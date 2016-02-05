'use strict';

var proxyquire = require('proxyquire');
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var queueMock = sinon.spy();
var exceptionMock = function() {error: 'an error'};
var callbackMock = sinon.spy();
var Jqueue = proxyquire('../src/jqueue', {
        './queue': queueMock,
        './exception': exceptionMock,
        './callback': callbackMock
    });

describe('jqueue:', function() {

    it('should construct a new jqueue', function () {

        var jqueue = new Jqueue();

        expect(jqueue.init).to.exist;
        expect(jqueue.use).to.exist;

    });

    it('should init success', function() {

        var dataSoure = {
            connect: function(cb) {
               cb(true);

            }

        };

        var jqueue = new Jqueue(dataSoure);

        var callback = function(){};

        jqueue.init(callback);

        expect(callbackMock.withArgs(callback, undefined, true).calledOnce).to.be.true;

    });

    it('should init fail', function() {

        var dataSource = {
            connect: function(cb) {
                cb(false);
            }

        };

        var jqueue = new Jqueue(dataSource);

        var callback = function(){};

        jqueue.init(callback);

        expect(callbackMock.withArgs(callback,
            sinon.match.object,
            false).calledOnce).to.be.true;

    });

    it('should use success', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null);
            }
        };

        var dataSource = {
            connect: function(cb) {
                cb(connection);
            }
        };

        var jqueue = new Jqueue(dataSource);

        var callback = function(){};

        jqueue.init();

        jqueue.use('lalala', callback);

        expect(callbackMock.withArgs(callback,
            null,
            sinon.match.object).calledOnce).to.be.true;

    });

    it('should use fail', function() {

        var connection = {
            query: function(query, params, cb) {
                cb({error:'fuuuu'});
            }
        };

        var dataSource = {
            connect: function(cb) {
                cb(connection);
            }
        };

        var jqueue = new Jqueue(dataSource);

        var callback = function(){};

        jqueue.init();

        jqueue.use('test', callback);

        expect(callbackMock.withArgs(callback,
            sinon.match.object,
            undefined).calledOnce).to.be.true;

    });

    it('should use exception', function() {

        var connection = {
            query: function(query, params, cb) {
                cb({error:'fuuuu'});
            }
        };

        var dataSource = {
            connect: function(cb) {
                cb(connection);
            }
        };

        var jqueue = new Jqueue(dataSource);

        var callback = function(){};

        try {
            jqueue.use('test', callback);
        } catch (error) {
            expect(error).to.be.eql({});
        }

    });

});
