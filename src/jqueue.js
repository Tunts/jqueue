var q = require('../node_modules/q/q');
var isConnected = false;
var dataSource;
var connection;
var connectionPromise;

function JqueueException (message, code) {
    this.name = 'JqueueException';
    this.code = code;
    this.message = message;
    this.stack = (new Error()).stack;
}
JqueueException.prototype = Object.create(Error.prototype);
JqueueException.constructor = JqueueException;

function JqueueMessage (message, timeToRun, delay, priority, dateTime) {
    this.id = null;
    this.message = message;
    this.timeToRun = timeToRun;
    this.delay = delay || 0;
    this.priority = priority || 0;
    this.dateTime = dateTime || new Date();
}
JqueueMessage.prototype = Object.create(Object.prototype);
JqueueMessage.constructor = JQueueMessage;

var verifyConnection = function() {
    if(!isConnected) {
        throw new JqueueException('Jqueue is not connected, please use init to connect to the database', 0);
    }
};

function verifyIfQueueExists(queueName, cb) {
    connection.query('SELECT 1 FROM ' + queueName + ' LIMIT 1', cb);
}

function createNewQueue(queueName, cb) {
    connection.query('CREATE TABLE '+ queueName +' (\
        id BIGINT NOT NULL AUTO_INCREMENT,\
        status TINYINT NOT NULL,\
        message TEXT NOT NULL,\
        time_to_run TIMESTAMP NOT NULL,\
        priority TINYINT NOT NULL,\
        date_time TIMESTAMP NOT NULL,\
        PRIMARY KEY (id))', cb);
}

var currentQueue = null;

var init = function(ds){
    dataSource = ds;
    var deferred = q.defer();
    dataSource.connect(function(conn) {
        connection = conn;
        isConnected = true;
        deferred.resolve(conn);
    });
    return connectionPromise = deferred.promise;
};

var ready = function(fn) {
    if(!connectionPromise) {
        throw new JqueueException('Please, call init before call ready', 1);
    }
    connectionPromise.then(fn);
};

var listAll = function(cb) {
    verifyConnection();
    var queueList = [];
    connection.query('SHOW TABLES', function(error, rows, fields) {
        for(var ix in rows) {
            queueList.push(rows[ix].Tables_in_jqueue);
        }
        cb(error, queueList);
    });
};

var use = function(queueName, cb) {
    verifyConnection();
    if(currentQueue !== queueName) {
        verifyIfQueueExists(queueName, function(error) {
            if(error) {
                createNewQueue(queueName, function(error) {
                    if(error) {
                        throw new JqueueException('Cannot found queue and cannot create a new queue', 2);
                    } else {
                        cb();
                    }
                })
            } else {
                currentQueue = queueName;
                cb();
            }
        })
    }
};

var put = function(message) {
    verifyConnection();
    if(!(message instanceof JqueueMessage)) {
        throw new JqueueException('Put expects a JqueueMessage. Please, create a new JqueueMessage and pass it as parameter', 3);
    } else {
        
    }
};

exports.JqueueMessage = JqueueMessage;
exports.init = init;
exports.ready = ready;
exports.listAll = listAll;
exports.use = use;
exports.put = put;