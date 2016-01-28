var isConnected = false;
var dataSource;
var connection;
var queues = {};

function JqueueException (message, code) {
    this.name = 'JqueueException';
    this.code = code;
    this.message = message;
    this.stack = (new Error()).stack;
}
JqueueException.prototype = Object.create(Error.prototype);
JqueueException.constructor = JqueueException;

function Message (data, queueName, status, delay, priority, dateTime) {
    this.id = null;
    this.data = data;
    this.status = status || 0;
    this.delay = delay || 0;
    this.priority = priority || 0;
    this.dateTime = dateTime || 'CURRENT_TIMESTAMP';
    this.queueName = queueName;

    this.release = function(delay) {
        if(delay) {
            //TODO release with delay
        } else {
            //TODO release
        }
    };

    this.touch = function() {
        //TODO touch
    };

    this.delete = function() {
        //TODO delete
    };

    this.bury = function() {
        //TODO bury
    };
}
Message.prototype = Object.create(Object.prototype);
Message.constructor = Message;

function Queue (name) {
    var self = this;
    this.name = name;

    this.put = function(message, cb) {
        var queueMessage = new Message(message, self.name);
        writeMessage(queueMessage, function(error, data) {
            var insertedId = undefined;
            if(!error) {
                insertedId = data.insertId;
            }
            callBack(cb, error, insertedId);
        });
    };

    this.reserve = function() {
        //TODO reserve
    };

    this.watch = function() {
        //TODO watch
    };

    this.kick = function(max) {
        //TODO kick
    };

    this.kickMessage = function(id) {
        //TODO kick
    };
}
Queue.prototype = Object.create(Object.prototype);
Queue.constructor = Queue;

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
        data TEXT NOT NULL,\
        priority TINYINT NOT NULL,\
        date_time TIMESTAMP NOT NULL,\
        PRIMARY KEY (id))', cb);
}

function writeMessage (message, cb) {
    console.log(message.queueName);
    connection.query('INSERT INTO ' + message.queueName + ' (status, data, priority, date_time) \
        VALUES ('+ message.status + ',\'' + message.data + '\',' + message.priority + ',' + message.dateTime + ')', cb)
}

function callBack(cb, error, data, other) {
    try {
        cb(error, data, other);
    } catch (err){
        console.log(err);
    }
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
                        queue = new Queue(queueName);
                        queues[queueName] = queue;
                    }
                    callBack(cb, error, queue);
                })
            } else {
                queue = new Queue(queueName);
                queues[queueName] = queue;
                callBack(cb, error, queue);
            }
        })
    }
}

exports.init = init;
exports.listAll = listAll;
exports.use = use;