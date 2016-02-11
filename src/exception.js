function JqueueException (message, code) {
    this.name = 'JqueueException';
    this.code = code;
    this.message = message;
    this.stack = (new Error()).stack;
}
JqueueException.prototype = Object.create(Error.prototype);
JqueueException.constructor = JqueueException;

module.exports = JqueueException;