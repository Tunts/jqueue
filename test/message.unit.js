'use strict';

var proxyquire = require('proxyquire');
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

var callbackMock = sinon.spy();
var Message = proxyquire('../src/message', {
        './callback': callbackMock
    });

describe('message:', function() {

    it('should construct a new message', function () {

        var message = new Message();

        expect(message.getId).to.exist;
        expect(message.getData).to.exist;
        expect(message.getStatus).to.exist;
        expect(message.getDelay).to.exist;
        expect(message.getPriority).to.exist;
        expect(message.getDateTime).to.exist;
        expect(message.getTimeToRun).to.exist;
        expect(message.getQueueName).to.exist;
        expect(message.release).to.exist;
        expect(message.touch).to.exist;
        expect(message.delete).to.exist;
        expect(message.bury).to.exist;

    });

    it('should get id', function() {
        var id = 10;
        var message = new Message(null, null, null, null, null, null, null, id);
        expect(message.getId()).to.equal(id);
    });

    it('should get data', function() {
        var data = 'this is a data';
        var message = new Message(null, data);
        expect(message.getData()).to.equal(data);
    });

    it('should get status', function() {
        var status = 'ready';
        var message = new Message(null, null, null, null, null, status);
        expect(message.getStatus()).to.equal(status);
    });

    it('should get delay', function() {
        var delay = 10;
        var message = new Message(null, null, null, delay);
        expect(message.getDelay()).to.equal(delay);
    });

    it('should get priority', function() {
        var priority = 2;
        var message = new Message(null, null, null, null, priority);
        expect(message.getPriority()).to.equal(priority);
    });

    it('should get dateTime', function() {
        var dateTime = new Date();
        var message = new Message(null, null, null, null, null, null, dateTime);
        expect(message.getDateTime()).to.equal(dateTime);
    });

    it('should get timeToRun', function() {
        var timeToRun = 5;
        var message = new Message(null, null, null, null, null, null, null, null, timeToRun);
        expect(message.getTimeToRun()).to.equal(timeToRun);
    });

    it('should get queueName', function() {
        var queueName = 'queue_name';
        var message = new Message(null, null, queueName);
        expect(message.getQueueName()).to.equal(queueName);
    });

    it('should release a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 1});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.release(callback);

        expect(callbackMock.withArgs(callback, null).calledOnce).to.be.true;

    });

    it('should release a message with delay', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 1});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.release(10, callback);

        expect(callbackMock.withArgs(callback, null).calledOnce).to.be.true;

    });

    it('should fail to release a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 0});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.release(callback);

        expect(callbackMock.withArgs(callback, sinon.match.object).calledOnce).to.be.true;

    });

    it('should touch message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 1});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.touch(callback);

        expect(callbackMock.withArgs(callback, null).calledOnce).to.be.true;

    });

    it('should not touch a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 0});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.touch(callback);

        expect(callbackMock.withArgs(callback, sinon.match.object).calledOnce).to.be.true;

    });

    it('should delete message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 1});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.delete(callback);

        expect(callbackMock.withArgs(callback, null).calledOnce).to.be.true;

    });

    it('should not delete a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 0});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.delete(callback);

        expect(callbackMock.withArgs(callback, sinon.match.object).calledOnce).to.be.true;

    });

    it('should bury message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 1});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.bury(callback);

        expect(callbackMock.withArgs(callback, null).calledOnce).to.be.true;

    });

    it('should not bury a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 0});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.bury(callback);

        expect(callbackMock.withArgs(callback, sinon.match.object).calledOnce).to.be.true;

    });

    it('should connection fail when bury a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 0});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb({error:'error'});
            }
        };

        var message = new Message(dataSource);

        var callback = function() {};

        message.bury(callback);

        expect(callbackMock.withArgs(callback, sinon.match.object).calledOnce).to.be.true;

    });

});
