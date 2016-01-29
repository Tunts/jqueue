var callBack = require('./callback').callBack;

function Message (conn, data, queueName, delay, priority, status, dateTime, id) {
    var self = this;
    var connection = conn;

    var id = id;
    var data = data;
    var status = status || 0;
    var delay = delay || 0;
    var priority = priority || 0;
    var dateTime = dateTime || 'CURRENT_TIMESTAMP';
    var queueName = queueName;

    this.getId = function() {
        return id;
    };

    this.getData = function() {
        return data;
    };

    this.getStatus = function() {
        var stringStatus = '';
        switch (status) {
            case 0:
                stringStatus = 'READY';
                break;
            case 1:
                stringStatus = 'RESERVED';
                break;
            case 2:
                stringStatus = 'BURIED';
                break;
        }
        return stringStatus;
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
        var response = function (error) {
            callBack(cb, error);
        };
        releaseMessage(self, response);
    };

    this.touch = function() {
        //TODO touch
    };

    this.delete = function(cb) {
        deleteMessage(self, function(error) {
            callBack(cb, error);
        });
    };

    this.bury = function(cb) {
        buryMessage(self, function(error) {
            callBack(cb, error);
        });
    };

    function deleteMessage(message, cb) {
        connection.query('DELETE FROM ?? WHERE id = ?',[message.getQueueName(), message.getId()] , cb);
    }

    function buryMessage(message, cb) {
        connection.query('UPDATE ?? SET status = 2 WHERE id = ?', [message.getQueueName(), message.getId()], cb);
    }

    function releaseMessage(message, cb) {
        connection.query('UPDATE ?? SET status = 0, \
        date_time = DATE_ADD(date_time, INTERVAL ? SECOND) WHERE id = ?',
            [message.getQueueName(), message.getDelay(), message.getId()], cb);
    }

}
Message.constructor = Message;

exports.Message = Message;