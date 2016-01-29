var messageProvider = require('./message');
var callBack = require('./callback').callBack;
var Message = messageProvider.Message;
var connection;

var defaultWatchInterval = 1000;

function Queue (name) {
    var self = this;
    this.name = name;

    this.put = function(message, parameter1, parameter2, parameter3) {
        var delay, priority, cb;
        switch (arguments.length) {
            case 2:
                cb = parameter1;
                break;
            case 3:
                delay = parameter1;
                cb = parameter2;
                break;
            case 4:
                delay = parameter1;
                priority = parameter2;
                cb = parameter3;
                break;
        }

        var queueMessage = new Message(message, self.name, delay, priority);
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

    this.watch = function(parameter1, parameter2) {
        var timeout, cb;
        switch (arguments.length) {
            case 1:
                cb = parameter1;
                break;
            case 2:
                timeout = parameter1;
                cb = parameter2;
                break;
        }
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

    this.kick = function(parameter1, parameter2, parameter3) {
        var max, delay, cb;
        switch (arguments.length) {
            case 1:
                cb: parameter1;
                break;
            case 2:
                max = parameter1;
                cb = parameter2;
                break;
            case 3:
                max = parameter1;
                delay = parameter2;
                cb = parameter3;
                break;
        }

        var callback = function(error, data) {
            callBack(cb, error, data);
        };

        delay = delay || 0;
        if(max) {
            kickMessages(self.name, max, delay, callback);
        } else {
            kickAllMessages(self.name, delay, callback)
        }
    };

    this.kickMessage = function(id, parameter1, parameter2) {
        var delay, cb;
        switch (arguments.length) {
            case 2:
                cb = parameter1;
                break;
            case 3:
                delay = parameter1;
                cb = parameter2;
                break;
        }
        delay = delay || 0;
        kickOneMessage(self.name, id, delay, function(error, data){
            callBack(cb, error, data);
        })
    };
}
Queue.constructor = Queue;

function writeMessage (message, cb) {
    connection.query('INSERT INTO ?? (status, data, priority, date_time) \
        VALUES (?,?,?,DATE_ADD(' + message.dateTime + ', INTERVAL ? SECOND))',
        [message.queueName, message.status, message.data, message.priority, message.delay], cb)
}

function retrieveMessage (queueName, cb) {
    connection.query('SELECT * FROM ?? \
        WHERE date_time <= CURRENT_TIMESTAMP AND status = 0 ORDER BY priority desc,\
        date_time asc LIMIT 1 FOR UPDATE',[queueName], function(error, data) {
        var message = data;
        if(!error && data && data.length) {
            connection.query('UPDATE ?? SET status = 1 WHERE id = ?',
                [queueName, data[0].id], function(error) {
                callBack(cb, error, message);
            });
        } else {
            callBack(cb, error, message);
        }
    });
}

function kickMessages (queueName, max, delay, cb) {
    connection.query('UPDATE ?? SET status = 0 date_time = DATE_ADD(date_time, INTERVAL ? SECOND) \
        ORDER BY date_time asc LIMIT ?', [queueName, delay, max], cb);
}

function kickOneMessage (queueName, id, delay, cb) {
    connection.query('UPDATE ?? SET status = 0 date_time = DATE_ADD(date_time, INTERVAL ? SECOND) \
        WHERE id = ?', [queueName, delay, id], cb);
}

function kickAllMessages (queueName, delay, cb) {
    connection.query('UPDATE ?? SET status = 0 date_time = DATE_ADD(date_time, INTERVAL ? SECOND)',
        [queueName, delay], cb);
}

exports.Queue = Queue;
exports.setConncetion = function(conn) {
    connection = conn;
    messageProvider.setConncetion(conn);
};