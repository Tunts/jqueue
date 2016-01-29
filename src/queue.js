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
        retrieveMessage(self.getName(), function(error, data) {
            var message = undefined;
            if(!error) {
                if(data.length > 0) {
                    var messageObject = data[0];
                    message = new Message(connection, messageObject.data, self.getName(), 0,
                        messageObject.priority, messageObject.status,
                        messageObject.date_time, messageObject.id, messageObject.time_to_run);
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
            VALUES (?,?,?,DATE_ADD(' + message.getDateTime() + ', INTERVAL ? SECOND))',
            [message.getQueueName(), message.getStatus(), message.getData(), message.getPriority(), message.getDelay()], cb)
    }

    function retrieveMessage (queueName, cb) {
        connection.query('SELECT * FROM ?? \
            WHERE date_time <= CURRENT_TIMESTAMP AND status = \'ready\' ORDER BY priority desc,\
            date_time asc LIMIT 1 FOR UPDATE',[queueName], function(error, data) {
            var message = data;
            if(!error && data && data.length) {
                connection.query('UPDATE ?? SET status = \'ready\' WHERE id = ?',
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
            WHERE status = \'buried\' ORDER BY date_time asc LIMIT ?', [queueName, delay, max], cb);
    }

    function kickOneMessage (queueName, id, delay, cb) {
        connection.query('UPDATE ?? SET status = 0, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) \
            WHERE status = \'buried\' AND id = ?', [queueName, delay, id], cb);
    }

    function kickAllMessages (queueName, delay, cb) {
        connection.query('UPDATE ?? SET status = \'ready\', date_time = DATE_ADD(date_time, INTERVAL ? SECOND) WHERE status = 2',
            [queueName, delay], cb);
    }

}
Queue.constructor = Queue;

exports.Queue = Queue;