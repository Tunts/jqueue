var callBack = require('./callback').callBack;
var connection;

function Message (data, queueName, status, delay, priority, dateTime) {
    var self = this;

    this.id = undefined;
    this.data = data;
    this.status = status || 0;
    this.delay = delay || 0;
    this.priority = priority || 0;
    this.dateTime = dateTime || 'CURRENT_TIMESTAMP';
    this.queueName = queueName;

    this._set = function (message) {
        this.id = message.id;
        this.data = message.data;
        this.status = message.status;
        this.priority = message.priority;
        this.dateTime = message.date_time;
    };

    this.release = function(delayOrCb, cb) {
        var response = function (error) {
            if(isNaN(delayOrCb)) {
                callBack(delayOrCb, error);
            } else {
                callBack(cb, error);
            }
        };
        if(isNaN(delayOrCb)) {
            releaseMessage(self, response);
        } else {
            self.delay = delayOrCb;
            releaseMessageWithDelay(self, response);
        }
    };

    this.touch = function() {
        //TODO touch
    };

    this.delete = function(cb) {
        deleteMessage(self.queueName, self.id, function(error) {
            callBack(cb, error);
        });
    };

    this.bury = function() {
        //TODO bury
    };
}
Message.prototype = Object.create(Object.prototype);
Message.constructor = Message;

function deleteMessage(message, cb) {
    connection.query('DELETE FROM ' + message.queueName + ' WHERE id = ' + message.id, cb);
}

function releaseMessage(message, cb) {
    connection.query('UPDATE ' + message.queueName + ' SET status = 0 WHERE id = ' + message.id, cb);
}

function releaseMessageWithDelay(message, cb) {
    connection.query('UPDATE ' + message.queueName + ' SET status = 0, \
        date_time = DATE_ADD(date_time, INTERVAL ' + message.delay + ' SECOND) WHERE id = ' + message.id, cb);
}

exports.Message = Message;
exports.setConncetion = function(conn) {
    connection = conn;
};