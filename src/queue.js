var callBack = require('./callback');
var Message = require('./message');

var defaultWatchInterval = 1000; //ms
var defaultTimeToRun = 5; //s

function Queue(dataSource, name) {
    var self = this;

    function execQuery(query, params, cb) {
        dataSource.getConnection(function (error, connection) {
            if (error) {
                cb(error);
            } else {
                connection.query(query, params, cb);
                connection.release();
            }
        });
    }

    this.getName = function () {
        return name;
    };

    this.put = function (message, parameter1, parameter2, parameter3, parameter4) {
        var delay, priority, cb, tag;
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
            case 5:
                delay = parameter1;
                priority = parameter2;
                tag = parameter3;
                cb = parameter4;
                break;
        }

        var queueMessage = new Message(dataSource, message, name, delay, priority,
            undefined, undefined, undefined, undefined, undefined, tag);
        writeMessage(queueMessage, function (error, data) {
            var insertedId = undefined;
            if (!error) {
                insertedId = data.insertId;
            }
            callBack(cb, error, insertedId);
        });
    };

    this.reserve = function (parameter1, parameter2, parameter3) {
        var cb, timeToRun, tag;
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
                tag = parameter2;
                cb = parameter3;
                break;
        }
        timeToRun = timeToRun || defaultTimeToRun;
        var version = Math.floor((Math.random() * 100000) + 1);
        retrieveMessage(name, tag, timeToRun, version, function (error, data) {
            var message = undefined;
            if (!error && data && data.length) {
                var messageObject = data[0];
                message = new Message(dataSource, messageObject.data, name, 0,
                    messageObject.priority, messageObject.status,
                    messageObject.date_time, messageObject.id, timeToRun, version,
                    messageObject.tag, messageObject.reservation_counter, messageObject.error);
            }
            callBack(cb, error, message);
        });
    };

    this.watch = function (parameter1, parameter2, parameter3, parameter4) {
        var timeout, tag, timeToRun, cb;
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
            case 4:
                timeToRun = parameter1;
                timeout = parameter2;
                tag = parameter3;
                cb = parameter4;
                break;
        }
        timeout = timeout || defaultWatchInterval;
        var watcher = {
            cancel: function () {
            }
        };
        self.reserve(timeToRun, tag, function (error, data) {
            if (!error && !data) {
                var interval = setInterval(function () {
                    self.reserve(timeToRun, function (error, data) {
                        if (error || data) {
                            clearInterval(interval);
                            callBack(cb, error, data);
                        }
                    });
                }, timeout);
                watcher.cancel = function () {
                    clearInterval(interval);
                };
            } else {
                callBack(cb, error, data);
            }
        });
        return watcher;

    };

    this.kick = function (parameter1, parameter2, parameter3) {
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

        var callback = function (error, data) {
            data = data ? data.affectedRows : undefined;
            callBack(cb, error, data);
        };

        delay = delay || 0;
        if (max) {
            kickMessages(name, max, delay, callback);
        } else {
            kickAllMessages(name, delay, callback)
        }
    };

    this.kickMessage = function (id, parameter1, parameter2) {
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
        kickOneMessage(name, id, delay, function (error, data) {
            callBack(cb, error, data);
        })
    };

    this.pick = function (id, parameter1, parameter2) {
        var cb, timeToRun;
        switch (arguments.length) {
            case 2:
                cb = parameter1;
                break;
            case 3:
                timeToRun = parameter1;
                cb = parameter2;
                break;
        }
        timeToRun = timeToRun || defaultTimeToRun;
        var version = Math.floor((Math.random() * 100000) + 1);
        pickMessage(name, id, timeToRun, version, function (error, data) {
            var message = undefined;
            if (error) {
                cb(error);
            } else if (data && data[0]) {
                var messageObject = data[0];
                message = new Message(dataSource, messageObject.data, name, 0,
                    messageObject.priority, messageObject.status,
                    messageObject.date_time, messageObject.id, timeToRun, version,
                    messageObject.tag, messageObject.reservation_counter, messageObject.error);
                callBack(cb, error, message);
            } else {
                getMessageById(name, id, function (error, data) {
                    if (error) {
                        callBack(error);
                    } else {
                        if (data && data[0]) {
                            callBack('message reserved by someone else');
                        } else {
                            callBack(error, message);
                        }
                    }
                });
            }
        });
    };

    function writeMessage(message, cb) {
        execQuery('INSERT INTO ?? (status, data, priority, tag, date_time, created_at, modified_at) \
            VALUES (?,?,?,?,DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND), now(), now())',
            [message.getQueueName(), message.getStatus(), message.getData(), message.getPriority(), message.getTag(), message.getDelay()], cb)
    }

    function retrieveMessage(queueName, tag, timeToRun, version, cb) {
        dataSource.getConnection(function (error, connection) {
            if (error) {
                cb(error);
            } else {
                connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE', function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        connection.beginTransaction(function (err) {
                            if (err) {
                                cb(err);
                            } else {
                                var params = [queueName, 'ready', 'reserved'];
                                var sql = 'SELECT * FROM ?? \
            WHERE ((date_time <= CURRENT_TIMESTAMP AND status = ?) OR (time_to_run IS NOT NULL\
             AND time_to_run < CURRENT_TIMESTAMP AND status = ?))';
                                if (tag) {
                                    sql += ' AND tag = ?';
                                    params.push(tag);
                                }
                                sql += ' ORDER BY priority desc,\
            date_time asc LIMIT 1 FOR UPDATE';
                                connection.query(sql, params, function (error, data) {
                                    var message = data;
                                    if (!error && message && message.length) {
                                        message[0].status = 'reserved';
                                        connection.query('UPDATE ?? SET status = ?, version = ?, \
                time_to_run = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND), \
                 reservation_counter = reservation_counter + 1  WHERE id = ?',
                                            [queueName, message[0].status, version, timeToRun, message[0].id], function (error) {
                                                connection.commit(function (err) {
                                                    if (!err) {
                                                        connection.release();
                                                    }
                                                    cb(error, message);
                                                });
                                            });
                                    } else {
                                        connection.commit(function (err) {
                                            if (!err) {
                                                connection.release();
                                            }
                                            cb(error, message);
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    function kickMessages(queueName, max, delay, cb) {
        execQuery('UPDATE ?? SET status = ?, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) \
            WHERE status = ? ORDER BY date_time asc LIMIT ?', [queueName, 'ready', delay, 'buried', max], cb);
    }

    function kickOneMessage(queueName, id, delay, cb) {
        execQuery('UPDATE ?? SET status = ?, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) \
            WHERE status = ? AND id = ?', [queueName, 'ready', delay, 'buried', id], cb);
    }

    function kickAllMessages(queueName, delay, cb) {
        execQuery('UPDATE ?? SET status = ?, date_time = DATE_ADD(date_time, INTERVAL ? SECOND) WHERE status = ?',
            [queueName, 'ready', delay, 'buried'], cb);
    }

    function pickMessage(queueName, id, timeToRun, version, cb) {
        dataSource.getConnection(function (error, connection) {
            if (error) {
                cb(error);
            } else {
                connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE', function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        connection.beginTransaction(function (err) {
                            if (err) {
                                cb(err);
                            } else {
                                var params = [queueName, ['ready', 'buried'], 'reserved', id];
                                var sql = 'SELECT * FROM ?? \
            WHERE ((date_time <= CURRENT_TIMESTAMP AND status in (?)) OR (time_to_run IS NOT NULL \
             AND time_to_run < CURRENT_TIMESTAMP AND status = ?)) AND id = ? FOR UPDATE';
                                connection.query(sql, params, function (error, data) {
                                    var message = data;
                                    if (!error && message && message.length) {
                                        message[0].status = 'reserved';
                                        connection.query('UPDATE ?? SET status = ?, version = ?, \
                time_to_run = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND),\
                 reservation_counter = reservation_counter + 1  WHERE id = ?',
                                            [queueName, message[0].status, version, timeToRun, message[0].id], function (error) {
                                                connection.commit(function (err) {
                                                    if (!err) {
                                                        connection.release();
                                                    }
                                                    cb(error, message);
                                                });
                                            });
                                    } else {
                                        connection.commit(function (err) {
                                            if (!err) {
                                                connection.release();
                                            }
                                            cb(error, message);
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    function getMessageById(queueName, id, cb) {
        execQuery('SELECT * FROM ?? WHERE id = ?', [queueName, id], cb);
    }

}

Queue.constructor = Queue;

module.exports = Queue;