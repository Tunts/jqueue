'use strict';

var proxyquire = require('proxyquire');
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var messageMock = function() {
    this.getQueueName = sinon.spy();
    this.getStatus = sinon.spy();
    this.getData = sinon.spy();
    this.getPriority = sinon.spy();
    this.getDelay = sinon.spy();
};
var exceptionMock = function() {error: 'an error'};
var callbackMock = sinon.spy();
var Queue = proxyquire('../src/queue', {
        './message': messageMock,
        './exception': exceptionMock,
        './callback': callbackMock
    });

describe('queue:', function() {

    it('should construct a new queue', function () {

        var queue = new Queue();

        expect(queue.getName).to.exist;
        expect(queue.put).to.exist;
        expect(queue.reserve).to.exist;
        expect(queue.watch).to.exist;
        expect(queue.kick).to.exist;
        expect(queue.kickMessage).to.exist;

    });

    it('should get name', function() {

        var queueName = 'test_name';

        var queue = new Queue(null, queueName);

        expect(queue.getName()).to.equal(queueName);

    });

    it('should put a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {insertId: 123});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.put('this is a test message', callback);

        expect(callbackMock.withArgs(callback, null,
            123).calledOnce).to.be.true;

    });

    it('should connection fail when put a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {insertId: 123});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb({error: 'error'});
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.put('this is a test message', callback);

        expect(callbackMock.withArgs(callback, sinon.match.object,
            undefined).calledOnce).to.be.true;

    });

    it('should fail to put a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {insertId: 123});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.put('this is a test message', 100, callback);

        expect(callbackMock.withArgs(callback, null,
            123).calledOnce).to.be.true;

    });

    it('should put a message with delay and priority', function() {

        var connection = {
            query: function(query, params, cb) {
                cb({error: 'error'}, undefined);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.put('this is a test message', 10, 10, callback);

        expect(callbackMock.withArgs(callback, sinon.match.object,
            undefined).calledOnce).to.be.true;

    });

    it('should reserve a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, [{}]);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.reserve(callback);

        expect(callbackMock.withArgs(callback, null,
            sinon.match.object).calledOnce).to.be.true;

    });

    it('should fail connection when reserve a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, [{}]);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb({error: 'error'});
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.reserve(callback);

        expect(callbackMock.withArgs(callback, sinon.match.object,
            undefined).calledOnce).to.be.true;

    });

    it('should not reserve a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb({error: 'error'}, undefined);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.reserve(10, callback);

        expect(callbackMock.withArgs(callback, sinon.match.object,
            undefined).calledOnce).to.be.true;

    });

    it('should watch a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, [{}]);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        queue.reserve = function(timeToRun, cb) {
            cb(null, {data:123});
        };

        var callback = function() {};

        queue.watch(callback);

        expect(callbackMock.withArgs(callback, null,
            sinon.match.object).calledOnce).to.be.true;

    });

    it('should not cancel and watch a message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, [{}]);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        queue.reserve = function(timeToRun, cb) {
            cb(null, {data:123});
        };

        var callback = function() {};

        var watcher = queue.watch(callback);
        watcher.cancel();

        expect(callbackMock.withArgs(callback, null,
            sinon.match.object).calledOnce).to.be.true;

    });

    it('should watch a message with interval', function(done) {

        var connection = {
            query: function(query, params, cb) {
                cb(null, [{}]);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var first = true;

        var queue = new Queue(dataSource, 'test');

        queue.reserve = function(timeToRun, cb) {
            if(first) {
                first = false;
                cb(null, null);
            } else {
                cb(null, {data: 123});
            }
        };

        var callback = function() {};

        queue.watch(10, 1, callback);

        setTimeout(function() {
            expect(callbackMock.withArgs(callback, sinon.match.any,
                sinon.match.any).calledOnce).to.be.true;
            done();
        }, 10);

    });

    it('should watch and cancel interval', function(done) {

        var connection = {
            query: function(query, params, cb) {
                cb(null, [{}]);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var first = true;

        var queue = new Queue(dataSource, 'test');

        queue.reserve = function(timeToRun, cb) {
            if(first) {
                first = false;
                cb(null, null);
            } else {
                cb(null, {data: 123});
            }
        };

        var callback = function() {};

        var watcher = queue.watch(10, callback);

        setTimeout(function() {
            watcher.cancel();
            expect(callbackMock.calledTwice).to.be.false;
            done();
        }, 10);

    });

    it('should watch with interval and not get a message', function(done) {

        var connection = {
            query: function(query, params, cb) {
                cb(null, [{}]);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        queue.reserve = function(timeToRun, cb) {
            cb(null, null);
        };

        var callback = function() {};

        queue.watch(10, 1, callback);

        setTimeout(function() {
            expect(callbackMock.calledTwice).to.be.false;
            done();
        }, 10);

    });

    it('should kick all messages', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 123});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.kick(callback);

        expect(callbackMock.withArgs(callback, null,
            123).calledOnce).to.be.true;

    });

    it('should kick a range of messages', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, {affectedRows: 123});
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.kick(10, callback);

        expect(callbackMock.withArgs(callback, null,
            123).calledOnce).to.be.true;

    });

    it('should fail to kick a range of messages', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, null);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.kick(10, 10, callback);

        expect(callbackMock.withArgs(callback, null,
            undefined).calledOnce).to.be.true;

    });

    it('should kick only one message', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, 1);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.kickMessage(1, callback);

        expect(callbackMock.withArgs(callback, null,
            1).calledOnce).to.be.true;

    });

    it('should kick only one message with delay', function() {

        var connection = {
            query: function(query, params, cb) {
                cb(null, 1);
            },
            release : function() {}
        };

        var dataSource = {
            getConnection: function(cb) {
                cb(null, connection);
            }
        };

        var queue = new Queue(dataSource, 'test');

        var callback = function() {};

        queue.kickMessage(1, 10, callback);

        expect(callbackMock.withArgs(callback, null,
            1).calledOnce).to.be.true;

    });

});
