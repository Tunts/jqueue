var callBack = require('./callback').callBack;
var connection;

function Message (data, queueName, delay, priority, status, dateTime) {
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

    this.release = function(parameter1, parameter2) {
        var delay, cb;
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
        self.delay = delay || 0;
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
}
Message.constructor = Message;

function deleteMessage(message, cb) {
    connection.query('DELETE FROM ?? WHERE id = ?',[message.queueName,message.id] , cb);
}

function buryMessage(message, cb) {
    connection.query('UPDATE ?? SET status = 2 WHERE id = ?', [message.queueName, message.id], cb);
}

function releaseMessage(message, cb) {
    connection.query('UPDATE ?? SET status = 0, \
        date_time = DATE_ADD(date_time, INTERVAL ? SECOND) WHERE id = ?',
        [message.queueName, message.delay, message.id], cb);
}

exports.Message = Message;
exports.setConncetion = function(conn) {
    connection = conn;
};