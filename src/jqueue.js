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

var verifyConnection = function() {
    if(!isConnected) {
        throw new JqueueException('jqueue is not connected, please use init to connect to the database', 0);
    }
};

exports.init = function(ds){
    dataSource = ds;
    var deferred = q.defer();
    dataSource.connect(function(conn) {
        connection = conn;
        isConnected = true;
        deferred.resolve(conn);
    });
    return connectionPromise = deferred.promise;
};

exports.ready = function(fn) {
    if(!connectionPromise) {
        throw new JqueueException('Please, call init before call ready', 1);
    }
    connectionPromise.then(fn);
};

exports.listAll = function(cb) {
    verifyConnection();
    var queueList = [];
    connection.query('SHOW TABLES', function(error, data) {
        for(var ix in data) {
            queueList.push(data[ix].Tables_in_jqueue);
        }
        cb(error, queueList);
    });
};