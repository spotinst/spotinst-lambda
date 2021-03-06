var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');

var create = function(err, event, context) {
  if(err) {
    return util.done(err);
  }

  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) return util.done(err, event, context);

    var createOptions = {
      method:  'POST',
      url:     'https://api.spotinst.io/spectrum/metrics/alert',
      qs:      {
        accountId: spotUtil.getAccountId(event)
      },
      headers: {
        'content-type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      },
      json:    {
        alert: tc.config
      }
    };

    console.log('Creating spectrum alert: ' + JSON.stringify(tc.config, null, 2));
    request(createOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'spectrumAlert',
        action:    'create',
        successCb: function(spotResponse) {
          var options = {
            cfn_responder: {
              returnError: false
            }
          };
          util.done(err, event, context, body, body.response.items[0].id, options);
        }
      });
    });

  });

};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, create]);
};

