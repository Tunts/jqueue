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
            //queue.put('klalalallaa', function(error){
                console.log(queue);
                queue.watch(function(error, message) {
                    if(message) {
                        console.log(message);
                        setTimeout(function() {
                            message.touch(function(error) {
                                console.log('TOUCHED ',error);
                            });
                        }, 1);
                    }
                });
            //});
        } else {
            console.log(error);
        }
    });
});
