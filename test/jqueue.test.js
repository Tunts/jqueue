var jqueue = require('../src/jqueue');
var db = require('node-mysql');

var conncetionInfo = {
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'jqueue'
};

var dataSource = new db.DB(conncetionInfo);

console.log(dataSource);

jqueue.init(dataSource);
jqueue.ready(function() {
    jqueue.listAll(function(error, data) {
        console.log(data);
    });
});
