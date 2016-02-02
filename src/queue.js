var callBack = require('./callback').callBack;
var Message = require('./message').Message;

var defaultWatchInterval = 1000; //ms
var defaultTimeToRun = 5; //s

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

    this.reserve = function(parameter1, parameter2) {
        var cb, timeToRun;
        switch (arguments.length) {
            case 1:
                cb = parameter1;
                break;
            case 2:
                timeToRun = parameter1;
                cb = parameter2;
                break;
        }
        timeToRun = timeToRun || defaultTimeToRun;
        retrieveMessage(self.getName(), timeToRun, function(error, data) {
            var message = undefined;
            if(!error && data && data.length) {
                var messageObject = data[0];
                message = new Message(connection, messageObject.data, self.getName(), 0,
                    messageObject.priority, messageObject.status,
                    messageObject.date_time, messageObject.id, timeToRun);
            }
            callBack(cb, error, message);
        });
    };

    this.watch = function(parameter1, parameter2, parameter3) {
        var timeout, timeToRun, cb;
        switch (arguments.length) {
            case 1:
                cb = parameter1;
                break;
            case 2:
                timeToRun = parameter1;
                cb = parameter2;
                break;
            case 3:
                timeToRun = parameter1;
                timeout = parameter2;
                cb = parameter3;
                break;
        }
        timeout = timeout || defaultWatchInterval;
        self.reserve(timeToRun, function(error, data) {
            if(!error && !data) {
                var interval = setInterval(function() {
                    self.reserve(timeToRun, function(error, data) {
                        if(error || data) {
                            clearInterval(interval);
                            callBack(cb, error, data);
                        }
                    });
                }, timeout);
                return function () {
                    clearInterval(interval);
                };
            } else {
                callBack(cb, error, data);
                return function (){};
            }
        });

    };

    this.kick = function(parameter1, parameter2, parameter3) {
        var max, delay, cb;
        switch (arguments.length) {
            case 1:
                cb = parameter1;
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
            VALUES (?,?,?,DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND))',
            [message.getQueueName(), message.getStatus(), message.getData(), message.getPriority(), message.getDelay()], cb)
    }

    function retrieveMessage (queueName, timeToRun, cb) {
        connection.query('SELECT * FROM ?? \
            WHERE (date_time <= CURRENT_TIMESTAMP AND status = ?) OR (time_to_run IS NOT NULL\
             AND time_to_run < CURRENT_TIMESTAMP AND status = ?) ORDER BY priority desc,\
            date_time asc LIMIT 1 FOR UPDATE',[queueName, 'ready', 'reserved'], function(error, data) {
            var message = data;
            if(!error && message && message.length) {
                message[0].status = 'reserved';
                connection.query('UPDATE ?? SET status = ?, \
                time_to_run = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND) WHERE id = ?',
                    [queueName, message[0].status, timeToRun, message[0].id], function(error) {
                    callBack(cb, error, message);
                });
            } else {
                callBack(cb, error, message);
            }
        });
    }

    function kickMessages (queueName, max, delay, cb) {
        connection.query('UPDATE ?? SET status = ?, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) \
            WHERE status = ? ORDER BY date_time asc LIMIT ?', [queueName, 'ready', delay, 'buried', max], cb);
    }

    function kickOneMessage (queueName, id, delay, cb) {
        connection.query('UPDATE ?? SET status = ?, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) \
            WHERE status = ? AND id = ?', [queueName, 'ready', delay, 'buried', id], cb);
    }

    function kickAllMessages (queueName, delay, cb) {
        connection.query('UPDATE ?? SET status = ?, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) WHERE status = ?',
            [queueName, 'ready', delay, 'buried'], cb);
    }

}
Queue.constructor = Queue;

exports.Queue = Queue;