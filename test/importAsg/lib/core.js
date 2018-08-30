var assert       = require('assert'),
    nock         = require('nock'),
    sinon        = require('sinon'),
    lambda       = require('../../../'),
    asgLib       = require('../../../lib/resources/importAsg/lib/core');

var event = {
	"region":"us-west-2",
	"asgName":"TestAsg",
	"dryRun":true,
	"deletePolicy":"Retain",

}

describe("importAsg", function() {
	describe("core", function(){
		it("should get region", function(done){
			assert.equal(asgLib.getRegion(event), "us-west-2")
			done()
		})

		it("should get asg name", function(done){
			assert.equal(asgLib.getASGName(event), "TestAsg")
			done()
		})

		it("should get dry run", function(done){
			assert.equal(asgLib.getDryRun(event), true)
			done()
		})

		it("should get delete policy config", function(done){
			assert.equal(asgLib.getDeletePolicyConfig(event), "Retain")
			done()
		})
	})
})