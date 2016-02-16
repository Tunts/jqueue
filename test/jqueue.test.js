var jqueue = require('../src/jqueue');
var db = require('node-mysql');

var conncetionInfo = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'jqueue'
};

var dataSource = new db.DB(conncetionInfo);

jqueue = new jqueue(dataSource);

jqueue.use('test', false, function (error, queue) {
    if (queue) {
        queue.put('klalalallaa', function (error) {
            console.log(error, queue);
            queue.watch(function (error, message) {
                console.log(error, message);
                if (!error && message) {
                    setTimeout(function () {
                        message.touch(function (error) {
                            console.log('touched', error);
                        });
                    }, 3000);
                    setTimeout(function () {
                        message.release(function (error) {
                            console.log('released', error);
                        });
                    }, 6000);
                }
            });
        });
    } else {
        console.log(error);
    }
});
