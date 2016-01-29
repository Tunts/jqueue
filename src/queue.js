var callBack = require('./callback').callBack;
var Message = require('./message').Message;

var defaultWatchInterval = 1000;

function Queue (conn, name) {
    var connection = conn;
    var self = this;
    var name = name;

    this.getName = function() {
        return name;
    };

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

        var queueMessage = new Message(connection, message, self.getName(), delay, priority);
        writeMessage(queueMessage, function(error, data) {
            var insertedId = undefined;
            if(!error) {
                insertedId = data.insertId;
            }
            callBack(cb, error, insertedId);
        });
    };

    this.reserve = function(cb) {
        retrieveMessage(self.getName(), function(error, data) {
            var message = undefined;
            if(!error) {
                if(data.length > 0) {
                    var messageObject = data[0];
                    message = new Message(connection, messageObject.data, self.getName(), 0,
                        messageObject.priority, messageObject.status,
                        messageObject.date_time, messageObject.id);
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
            kickMessages(self.getName(), max, delay, callback);
        } else {
            kickAllMessages(self.getName(), delay, callback)
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
        kickOneMessage(self.getName(), id, delay, function(error, data){
            callBack(cb, error, data);
        })
    };

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
        connection.query('UPDATE ?? SET status = 0, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) \
            WHERE status = 2 ORDER BY date_time asc LIMIT ?', [queueName, delay, max], cb);
    }

    function kickOneMessage (queueName, id, delay, cb) {
        connection.query('UPDATE ?? SET status = 0, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) \
            WHERE status = 2 AND id = ?', [queueName, delay, id], cb);
    }

    function kickAllMessages (queueName, delay, cb) {
        connection.query('UPDATE ?? SET status = 0, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) WHERE status = 2',
            [queueName, delay], cb);
    }

}
Queue.constructor = Queue;

exports.Queue = Queue;