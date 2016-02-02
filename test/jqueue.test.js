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
    jqueue.use('test', true, function(error, queue) {
        if(queue) {
            queue.put('klalalallaa', function(error){
                console.log(error, queue);
                queue.watch(function(error, message) {
                    if(error, message) {
                        console.log(message);
                        setTimeout(function() {
                            message.release(function(error) {
                                console.log('released',error);
                            });
                        }, 1);
                    }
                });
            });
        } else {
            console.log(error);
        }
    });
});
