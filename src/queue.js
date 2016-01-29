var messageProvider = require('./message');
var callBack = require('./callback').callBack;
var Message = messageProvider.Message;
var connection;

var defaultWatchInterval = 1000;

function Queue (name) {
    var self = this;
    this.name = name;

    this.put = function(message, cb) {
        var queueMessage = new Message(message, self.name);
        writeMessage(queueMessage, function(error, data) {
            var insertedId = undefined;
            if(!error) {
                insertedId = data.insertId;
            }
            callBack(cb, error, insertedId);
        });
    };

    this.reserve = function(cb) {
        retrieveMessage(self.name, function(error, data) {
            var message = undefined;
            if(!error) {
                if(data.length > 0) {
                    var messageObject = data[0];
                    message = new Message(null, self.name);
                    message._set(messageObject);
                }
            }
            callBack(cb, error, message);
        });
    };

    this.watch = function(cb, timeout) {
        timeout = timeout || defaultWatchInterval;
        var interval = setInterval(function(){
            self.reserve(function(error, data) {
                if(error || data) {
                    clearInterval(interval);
                    callBack(cb, error, data);
                }
            });
        }, timeout);
        return function () {
            clearInterval(interval);
        };
    };

    this.kick = function(max, cb) {
        //TODO kick
    };

    this.kickMessage = function(id, cb) {
        //TODO kick
    };
}
Queue.prototype = Object.create(Object.prototype);
Queue.constructor = Queue;

function writeMessage (message, cb) {
    connection.query('INSERT INTO ' + message.queueName + ' (status, data, priority, date_time) \
        VALUES ('+ message.status + ',\'' + message.data + '\',' + message.priority + ',' + message.dateTime + ')', cb)
}

function retrieveMessage (queueName, cb) {
    connection.query('SELECT * FROM ' + queueName +
        ' WHERE date_time <= CURRENT_TIMESTAMP AND status = 0 ORDER BY priority desc,\
        date_time asc LIMIT 1 FOR UPDATE', function(error, data) {
        var message = data;
        if(!error && data && data.length) {
            connection.query('UPDATE ' + queueName + ' SET status = 1 WHERE id = '+ data[0].id, function(error) {
                callBack(cb, error, message);
            });
        } else {
            callBack(cb, error, message);
        }
    });
}

exports.Queue = Queue;
exports.setConncetion = function(conn) {
    connection = conn;
    messageProvider.setConncetion(conn);
};