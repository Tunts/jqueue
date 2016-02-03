var callBack = require('./callback').callBack;

function Message (conn, data, queueName, delay, priority, status, dateTime, id, timeToRun, version) {
    var self = this;
    var connection = conn;

    var id = id;
    var data = data;
    var status = status || 'ready';
    var delay = delay || 0;
    var priority = priority || 0;
    var dateTime = dateTime;
    var timeToRun = timeToRun;
    var queueName = queueName;
    var version = version;

    this.getId = function() {
        return id;
    };

    this.getData = function() {
        return data;
    };

    this.getStatus = function() {
        return status;
    };

    this.getDelay = function() {
        return delay;
    };

    this.getPriority = function() {
        return priority;
    };

    this.getDateTime = function() {
        return dateTime;
    };

    this.getTimeToRun = function() {
        return timeToRun;
    };

    this.getQueueName = function() {
        return queueName;
    };

    this.release = function(parameter1, parameter2) {
        var cb;
        switch (arguments.length) {
            case 1:
                cb = parameter1;
                break;
            case 2:
                delay = parameter1;
                cb = parameter2;
                break;
        }
        var response = function (error, data) {
            error = verifyReserveError(error, data);
            callBack(cb, error);
        };
        releaseMessage(self, response);
    };

    this.touch = function(cb) {
        refreshMessage(self, function(error, data) {
            error = verifyReserveError(error, data);
            callBack(cb, error);
        });
    };

    this.delete = function(cb) {
        deleteMessage(self, function(error, data) {
            error = verifyReserveError(error, data);
            callBack(cb, error);
        });
    };

    this.bury = function(cb) {
        buryMessage(self, function(error, data) {
            error = verifyReserveError(error, data);
            callBack(cb, error);
        });
    };

    function deleteMessage(message, cb) {
        connection.query('DELETE FROM ?? WHERE id = ? AND version = ?', [message.getQueueName(), message.getId(), version] , cb);
    }

    function buryMessage(message, cb) {
        connection.query('UPDATE ?? SET status = ? WHERE id = ? AND version = ?', [message.getQueueName(), 'buried', message.getId(), version], cb);
    }

    function releaseMessage(message, cb) {
        connection.query('UPDATE ?? SET status = ?, \
        date_time = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND) WHERE id = ? AND version = ?',
            [message.getQueueName(), 'ready', message.getDelay(), message.getId(), version], cb);
    }

    function refreshMessage(message, cb) {
        connection.query('UPDATE ?? SET time_to_run = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND) WHERE id = ? AND version = ?',
            [message.getQueueName(), message.getTimeToRun(), message.getId(), version], cb);
    }

    function verifyReserveError(error, info) {
        if(!error && info && !info.affectedRows) {
            error = {error: 'the reserve was lost'};
        }
        return error;
    }

}
Message.constructor = Message;

exports.Message = Message;