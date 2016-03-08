var Queue =  require('./queue');
var JqueueException =  require('./exception');
var callBack = require('./callback');

function Jqueue(ds) {

    var dataSource = ds;
    var dataSource;
    var queues = {};

    function execQuery(query, params, cb) {
        dataSource.getConnection(function(error, connection) {
            if(error) {
                cb(error);
            } else {
                connection.query(query, params, cb);
                connection.release();
            }
        });
    }

    function verifyIfQueueExists(queueName, cb) {
        execQuery('SELECT 1 FROM ?? LIMIT 1', [queueName], cb);
    }

    function createNewQueue(queueName, isMemory, cb) {
        var storageEngine;
        if (isMemory) {
            storageEngine = 'MEMORY';
        } else {
            storageEngine = 'MyISAM';
        }
        execQuery('CREATE TABLE ?? (\
        id BIGINT NOT NULL AUTO_INCREMENT,\
        status ENUM(\'ready\', \'reserved\', \'buried\') NOT NULL,\
        data VARCHAR(21800) NOT NULL,\
        priority TINYINT NOT NULL,\
        date_time TIMESTAMP NOT NULL,\
        time_to_run TIMESTAMP NULL DEFAULT NULL,\
        version INT NULL DEFAULT NULL,\
        PRIMARY KEY (id)) ENGINE = ??', [queueName, storageEngine], cb);
    }

    function use(queueName, parameter1, parameter2, parameter3) {
        var noCreate, isMemory, cb;
        switch (arguments.length) {
            case 2:
                noCreate = false;
                isMemory = false;
                cb = parameter1;
                break;
            case 3:
                noCreate = !!parameter1;
                isMemory = false;
                cb = parameter2;
                break;
            case 4:
                noCreate = !!parameter1;
                isMemory = !!parameter2;
                cb = parameter3;
                break;
        }
        if (queues.hasOwnProperty(queueName)) {
            callBack(cb, null, queues[queueName]);
        } else {
            var queue = undefined;
            verifyIfQueueExists(queueName, function (error) {
                if (error) {
                    if(noCreate) {
                        callBack(cb, error);
                    } else {
                        createNewQueue(queueName, isMemory, function (error) {
                            if (!error) {
                                queue = new Queue(dataSource, queueName);
                                queues[queueName] = queue;
                            }
                            callBack(cb, error, queue);
                        })
                    }
                } else {
                    queue = new Queue(dataSource, queueName);
                    queues[queueName] = queue;
                    callBack(cb, error, queue);
                }
            });
        }
    }

    this.use = use;
}
Jqueue.constructor = Jqueue;

module.exports = Jqueue;