'use strict';

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var callBack = require('../src/callback');

describe('callback:', function() {

    it('shoul be a function', function() {
        expect(callBack).to.be.an.instanceof(Function);
    });

    it('should call a callback', function () {

        var call = function(error, data, other) {
            expect(error).to.be.true;
            expect(data).to.be.true;
            expect(other).to.be.true;
        };

        callBack(call, true, true, true);

    });

    it('should log an exception', function () {

        var call = function() {
            throw 'test error';
        };

        try {
            callBack(call);
            chai.assert.fail();
        } catch (e) {
        }

    });

    it('should not call a callback', function () {

        var call = sinon.spy();

        callBack(null, call);

        expect(call.called).to.be.false;

    });

});
