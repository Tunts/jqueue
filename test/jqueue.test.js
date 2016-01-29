var jqueue = require('../src/jqueue');
var db = require('node-mysql');

var conncetionInfo = {
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'jqueue'
};

var dataSource = new db.DB(conncetionInfo);

jqueue.init(dataSource, function() {
    jqueue.use('test',function(error, queue) {
        queue.reserve(function(error, message) {
            if(message) {
                message.release(120, function(error) {
                    console.log(error)
                });
            }
        });
    });
});
