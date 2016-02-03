var Queue =  require('./queue').Queue;
var JqueueException =  require('./exception').JqueueException;
var callBack = require('./callback').callBack;


function Jqueue(ds) {

    var dataSource = ds;
    var isConnected = false;
    var dataSource;
    var connection;
    var queues = {};

    var verifyConnection = function () {
        if (!isConnected) {
            throw new JqueueException('Jqueue is not connected, please use init to connect to the database', 0);
        }
    };

    function verifyIfQueueExists(queueName, cb) {
        connection.query('SELECT 1 FROM ?? LIMIT 1', [queueName], cb);
    }

    function createNewQueue(queueName, isMemory, cb) {
        var storageEngine;
        if (isMemory) {
            storageEngine = 'MEMORY';
        } else {
            storageEngine = 'MyISAM';
        }
        connection.query('CREATE TABLE ?? (\
        id BIGINT NOT NULL AUTO_INCREMENT,\
        status ENUM(\'ready\', \'reserved\', \'buried\') NOT NULL,\
        data VARCHAR(4096) NOT NULL,\
        priority TINYINT NOT NULL,\
        date_time TIMESTAMP NOT NULL,\
        time_to_run TIMESTAMP NULL DEFAULT NULL,\
        version INT NULL DEFAULT NULL,\
        PRIMARY KEY (id)) ENGINE = ??', [queueName, storageEngine], cb);
    }

    function init(cb) {
        var error = undefined;
        dataSource.connect(function (conn) {
            if (!conn) {
                error = {
                    message: 'connection fail'
                };
            } else {
                connection = conn;
                isConnected = true;
            }
            callBack(cb, error, conn);
        });
    }

    function listAll(cb) {
        verifyConnection();
        var queueList = [];
        connection.query('SHOW TABLES', function (error, rows, fields) {
            for (var ix in rows) {
                queueList.push(rows[ix].Tables_in_jqueue);
            }
            callBack(cb, error, queueList);
        });
    }

    function use(queueName, parameter1, parameter2) {
        verifyConnection();
        var isMemory, cb;
        switch (arguments.length) {
            case 2:
                isMemory = false;
                cb = parameter1;
                break;
            case 3:
                isMemory = !!parameter1;
                cb = parameter2;
                break;
        }
        if (queues.hasOwnProperty(queueName)) {
            return queues[queueName];
        } else {
            var queue = undefined;
            verifyIfQueueExists(queueName, function (error) {
                if (error) {
                    createNewQueue(queueName, isMemory, function (error) {
                        if (!error) {
                            queue = new Queue(connection, queueName);
                            queues[queueName] = queue;
                        }
                        callBack(cb, error, queue);
                    })
                } else {
                    queue = new Queue(connection, queueName);
                    queues[queueName] = queue;
                    callBack(cb, error, queue);
                }
            })
        }
    }

    this.init = init;
    this.listAll = listAll;
    this.use = use;
}
Jqueue.constructor = Jqueue;

exports.Jqueue = Jqueue;