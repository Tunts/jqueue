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
        queue.put('TESTE COM DELAY DE 1 MIN', 60, function(error, data) {
           console.log(error, data);
        });
        queue.watch(function(error, message) {
            if(message) {
                message.release(function(error) {
                    console.log(error)
                });
            }
        });
    });
});
