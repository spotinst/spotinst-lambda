var _ = require('lodash'),
  assert = require('assert'),
  update = require('../../lib/resources/elastigroup/update'),
  elastigroup = require('../../lib/resources/elastigroup'),
  lambda = require('../../'),
  nock         = require('nock'),
  sinon     = require('sinon'),
  util      = require('lambda-formation').util;
  
var groupConfig = {
  "group": {
    "name": "test",
    "description": "asdf",
    "strategy": {
      "risk": 100,
      "onDemandCount": null,
      "availabilityVsCost": "balanced"
    },
    "capacity": {
      "target": 1,
      "minimum": 1,
      "maximum": 1
    },
    "scaling": {},
    "compute": {
      "instanceTypes": {
        "ondemand": "m3.medium",
        "spot": [
          "m3.medium"
        ]
      },
      "availabilityZones": [
        {
          "name": "us-east-1a",
          "subnetId": "subnet-11111111"
        }
      ],
      "product": "Linux/UNIX",
      "launchSpecification": {
        "securityGroupIds": [
          "sg-11111111"
        ],
        "monitoring": false,
        "imageId": "ami-60b6c60a",
        "keyPair": "testkey"
      }
    },
    "scheduling": {},
    "thirdPartiesIntegration": {}
  }
};

groupConfig.group.description = Date.now() / 1000 + "";

describe("elastigroup", function() {
  beforeEach(()=>{
      sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
      sandbox.restore()
  });

  describe("update resource", function() {
    it("update handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/ec2/group/sig-11111111', { "group": { "name": "test", "description": /.+/, "strategy": { "risk": 100, "onDemandCount": null, "availabilityVsCost": "balanced" }, "capacity": { "target":  1,  "minimum": 1, "maximum": 1 }, "scaling": {}, "compute": { "instanceTypes": { "ondemand": "m3.medium", "spot": ["m3.medium"] }, "availabilityZones": [{ "name": "us-east-1a", "subnetId": "subnet-11111111" }], "launchSpecification": { "securityGroupIds": ["sg-11111111"], "monitoring": false, "imageId": "ami-60b6c60a", "keyPair":"testkey"}},"scheduling": {},"thirdPartiesIntegration": {}}})
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111'
        }, groupConfig),
        context
      );
    });

    it("elastigroup handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/ec2/group/sig-11111111', { "group": { "name": "test", "description": /.+/, "strategy": { "risk": 100, "onDemandCount": null, "availabilityVsCost": "balanced" }, "capacity": { "target":  1,  "minimum": 1, "maximum": 1 }, "scaling": {}, "compute": { "instanceTypes": { "ondemand": "m3.medium", "spot": ["m3.medium"] }, "availabilityZones": [{ "name": "us-east-1a", "subnetId": "subnet-11111111" }], "launchSpecification": { "securityGroupIds": ["sg-11111111"], "monitoring": false, "imageId": "ami-60b6c60a", "keyPair":"testkey"}},"scheduling": {},"thirdPartiesIntegration": {}}})
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      elastigroup.handler(
        _.merge({
          ResourceType: 'Custom::elastigroup',
          requestType: 'update',
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111'
        }, groupConfig),
        context
      );
    });
  });
});
