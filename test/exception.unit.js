'use strict';

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var JqueueException = require('../src/exception');

describe('exception:', function() {

    it('should construct a new jqueueException', function () {

        var jqueueException = new JqueueException('error', 1);

        expect(jqueueException.name).to.exist;
        expect(jqueueException.code).to.exist;
        expect(jqueueException.message).to.exist;
        expect(jqueueException.stack).to.exist;
    });

});
