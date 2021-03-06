var _            = require('lodash'),
    assert       = require('assert'),
    update       = require('../../lib/resources/importAsg/update'),
    importAsg    = require('../../lib/resources/importAsg'),
    lambda       = require('../../'),
    nock         = require('nock'),
    sinon        = require('sinon'),
    util         = require('lambda-formation').util;

var groupConfig = {
  "group": {
      "product": "Linux/UNIX",
      "spotInstanceTypes": [
          "t2.micro",
          "t2.small"
       ],
       "name": "TestASG"
  },
  "groupConfig":{}
}

describe("importAsg", function() {
  beforeEach(()=>{
      nock.cleanAll();
      sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
      sandbox.restore()
  });

  describe("update importAsg resource/", function(){
    it("update importAsg throw error", function(done) {
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111'
        }, {fail:groupConfig}),
        context
      );
    });

    it("update handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/ec2/group/sig-11111111', groupConfig.groupConfig)
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
        })

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111',
        }, groupConfig),
        context
        );
    });    
  })

});
