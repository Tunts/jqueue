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

});
