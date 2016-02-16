'use strict';

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var Jqueue = require('../src/jqueue');

var db = require('node-mysql');

var conncetionInfo = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'jqueue'
};

describe('jqueue e2e:', function () {

    var dataSource = new db.DB(conncetionInfo);
    var jqueue = new Jqueue(dataSource);

    it('use and create queue', function () {
        dataSource.connect(function (conn) {
            conn.query('DROP TABLE IF EXISTS test', function () {
                jqueue.use('test', function (error, queue) {
                    expect(queue.getName()).to.equal('test');
                });
            });
        });
    });

    it('fail use already exists queue', function () {
        jqueue.use('aff', true, function (error) {
            expect(error).not.to.be.null;
        });
    });

    it('put a message', function () {
        jqueue.use('test', function (error, queue) {
            queue.put('this is a test', function (error, id) {
                expect(id).to.equal(1);
            });
        });
    });

    it('get message', function () {
        jqueue.use('test', function (error, queue) {
            queue.reserve(function (error, message) {
                expect(message.getId()).to.equal(1);
                message.release();
            });
        });
    });

});