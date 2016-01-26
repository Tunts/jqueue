var jqueue = require('../src/jqueue');
var db = require('node-mysql');

var conncetionInfo = {
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'jqueue'
};

var dataSource = new db.DB(conncetionInfo);

jqueue.init(dataSource);
jqueue.ready(function() {
    jqueue.use('test',function(error) {
        console.log(error);
    });
});
