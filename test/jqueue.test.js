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
        if(queue) {
            queue.put('klalalallaa', function(error){
                console.log(error);
                queue.watch(function(error, message) {
                    if(message) {
                        message.release(function(error) {
                            console.log(error);
                        });
                    }
                });
            });
        } else {
            console.log(error);
        }
    });
});
