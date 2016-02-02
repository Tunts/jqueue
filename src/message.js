var callBack = require('./callback').callBack;

function Message (conn, data, queueName, delay, priority, status, dateTime, id, timeToRun) {
    var self = this;
    var connection = conn;

    var id = id;
    var data = data;
    var status = status || 'ready';
    var delay = delay || 0;
    var priority = priority || 0;
    var dateTime = dateTime || new Date();
    var timeToRun = timeToRun;
    var queueName = queueName;

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
        var response = function (error) {
            callBack(cb, error);
        };
        releaseMessage(self, response);
    };

    this.touch = function(cb) {
        refreshMessage(self, function(error) {
            callBack(cb, error);
        });
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
        connection.query('UPDATE ?? SET status = ? WHERE id = ?', [message.getQueueName(), 'buried', message.getId()], cb);
    }

    function releaseMessage(message, cb) {
        connection.query('UPDATE ?? SET status = ?, \
        date_time = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND) WHERE id = ?',
            [message.getQueueName(), 'ready', message.getDelay(), message.getId()], cb);
    }

    function refreshMessage(message, cb) {
        connection.query('SELECT id FROM ?? WHERE status = ? AND time_to_run >= CURRENT_TIMESTAMP AND id = ? FOR UPDATE',
            [message.getQueueName(), 'reserved', message.getId()], function(error, data) {
                if(data && !!data.length) {
                    connection.query('UPDATE ?? SET time_to_run = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND) WHERE id = ?',
                        [message.getQueueName(), message.getTimeToRun(), message.getId()], cb);
                } else {
                    cb({error: 'the reserve was lost'});
                }
           });
    }

}
Message.constructor = Message;

exports.Message = Message;