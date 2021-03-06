"use strict";

var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var _        = require('lodash');
var async    = require('async');


/**
 * This function creates an elastigroup based on the CF template
 *
 * @function
 * @name create
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 */
function create(err, event, context) {
  if(err) {
    return util.done(err);
  }

  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) {
      return util.done(err, event, context);
    }

    let createPolicy  = getCreatePolicyConfig(event) || {};
    let groupConfig   = spotUtil.parseGroupConfig(tc.config);

    if(spotUtil.checkAutoTag(event)){
      let autoTags = spotUtil.generateTags(event)

      if(spotUtil.tagsExsist(groupConfig)){
        autoTags.forEach((singleTag)=>{
          groupConfig.compute.launchSpecification.tags.push(singleTag)
        })
      }
      else{
        groupConfig.compute.launchSpecification.tags = autoTags
      }
    }

    let createOptions = {
      method:  'POST',
      url:     'https://api.spotinst.io/aws/ec2/group',
      qs:      {
        accountId:              spotUtil.getAccountId(event),
        ignoreInitHealthChecks: createPolicy.ignoreInitHealthChecks
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      },
      json:    {
        group: groupConfig
      }
    };

    console.log('Creating group: ' + JSON.stringify(groupConfig, null, 2));

    let createRequest = (cb, err) =>{
      request(createOptions, function(err, res, body) {
        spotUtil.validateResponse({
          err:       err,
          res:       res,
          body:      body,
          event:     event,
          context:   context,
          resource:  'elasticgroup',
          action:    'create',
          successCb: function(spotResponse) {
            cb(null, spotResponse)
          },
          failureCb: function(spotResponse){
            cb(spotResponse);
          }
        });
      });
    }

    let errorFilter = (spotResponse)=>{
      let errors = spotResponse.body.response.errors
      for(err in errors){
        if(errors[err].code === "RequestLimitExceeded"){
          return true
        }
      }
      return false
    }

    async.retry({times: 5, interval: 1000, errorFilter: errorFilter}, createRequest, (err, res)=>{
      if(err){
        let physicalResourceId = event.PhysicalResourceId || "ResourceFailed";
        let error =  "elasticgroup create failed: " + err.errMsg;
        console.log(`${physicalResourceId} failed: ${error}`)

        return util.done(error, event, context, null, physicalResourceId);
      }
      else{
        let options = {
          cfn_responder: {
            returnError: false,
            logLevel:    "debug"
          }
        };
        let physicalResourceId = res.body.response.items[0].id
        console.log(`${physicalResourceId} creation success`)

        return util.done(null, res.event, res.context, null, physicalResourceId, options);
      }
    })

  });
}

function getCreatePolicyConfig(event) {
  var createPolicy = _.get(event, 'ResourceProperties.createPolicy') || _.get(event, 'createPolicy');
  return createPolicy;
}

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, create]);
};

