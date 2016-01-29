var Queue =  require('./queue').Queue;
var JqueueException =  require('./exception').JqueueException;
var callBack = require('./callback').callBack;

var isConnected = false;
var dataSource;
var connection;
var queues = {};

var verifyConnection = function() {
    if(!isConnected) {
        throw new JqueueException('Jqueue is not connected, please use init to connect to the database', 0);
    }
};

function verifyIfQueueExists(queueName, cb) {
    connection.query('SELECT 1 FROM ?? LIMIT 1', [queueName], cb);
}

function createNewQueue(queueName, cb) {
    connection.query('CREATE TABLE ?? (\
        id BIGINT NOT NULL AUTO_INCREMENT,\
        status ENUM(\'ready\', \'reserved\', \'buried\') NOT NULL,\
        data TEXT NOT NULL,\
        priority TINYINT NOT NULL,\
        date_time TIMESTAMP NOT NULL,\
        time_to_run TIMESTAMP,\
        PRIMARY KEY (id))', [queueName], cb);
}

function init (ds, cb){
    var error = undefined;
    dataSource = ds;
    dataSource.connect(function(conn) {
        if(!conn) {
            error = {
                message: 'connection fail'
            };
        } else {
            connection = conn;
            isConnected = true;
        }
        callBack(cb ,error, conn);
    });
}

function listAll (cb) {
    verifyConnection();
    var queueList = [];
    connection.query('SHOW TABLES', function(error, rows, fields) {
        for(var ix in rows) {
            queueList.push(rows[ix].Tables_in_jqueue);
        }
        callBack(cb, error, queueList);
    });
}

function use(queueName, cb) {
    verifyConnection();
    if(queues.hasOwnProperty(queueName)){
        return queues[queueName];
    } else {
        var queue = undefined;
        verifyIfQueueExists(queueName, function(error) {
            if(error) {
                createNewQueue(queueName, function(error) {
                    if(!error) {
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

exports.init = init;
exports.listAll = listAll;
exports.use = use;