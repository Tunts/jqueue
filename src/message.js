var callBack = require('./callback');

function Message(dataSource, data, queueName, delay, priority, status, dateTime, id, timeToRun, version, tag, reservationCounter, error) {
    var self = this;

    status = status || 'ready';
    delay = delay || 0;
    priority = priority || 0;
    reservationCounter = reservationCounter || 0;

    this.getId = function () {
        return id;
    };

    this.getData = function () {
        return data;
    };

    this.getStatus = function () {
        return status;
    };

    this.getDelay = function () {
        return delay;
    };

    this.getPriority = function () {
        return priority;
    };

    this.getDateTime = function () {
        return dateTime;
    };

    this.getTimeToRun = function () {
        return timeToRun;
    };

    this.getQueueName = function () {
        return queueName;
    };

    this.getTag = function () {
        return tag;
    };

    this.getReservationCounter = function () {
        return reservationCounter;
    };

    this.getError = function () {
        return error;
    };

    this.release = function (parameter1, parameter2) {
        var cb;
        switch (arguments.length) {
            case 1:
                cb = parameter1;
                break;
            case 2:
                delay = parameter1;
                cb = parameter2;
                break;
        }
        var response = function (error, data) {
            error = verifyReserveError(error, data);
            callBack(cb, error);
        };
        releaseMessage(response);
    };

    this.touch = function (cb) {
        refreshMessage(function (error, data) {
            error = verifyReserveError(error, data);
            callBack(cb, error);
        });
    };

    this.delete = function (cb) {
        deleteMessage(function (error, data) {
            error = verifyReserveError(error, data);
            callBack(cb, error);
        });
    };

    this.bury = function (reason, cb) {
        if (typeof reason === 'function') {
            cb = reason;
            reason = null;
        }
        if (reason && typeof reason !== 'string') {
            reason = JSON.stringify(reason);
        }
        buryMessage(reason, function (error, data) {
            error = verifyReserveError(error, data);
            callBack(cb, error);
        });
    };

    function execQuery(query, params, cb) {
        dataSource.getConnection(function (error, connection) {
            if (error) {
                cb(error);
            } else {
                connection.query(query, params, cb);
                connection.release();
            }
        });
    }

    function deleteMessage(cb) {
        execQuery('DELETE FROM ?? WHERE id = ? AND version = ? AND status = ? AND time_to_run >= CURRENT_TIMESTAMP',
            [queueName, id, version, 'reserved'], cb);
    }

    function buryMessage(error, cb) {
        execQuery('UPDATE ?? SET status = ?, error = ? WHERE id = ? AND version = ? AND status = ? AND time_to_run >= CURRENT_TIMESTAMP',
            [queueName, 'buried', error, id, version, 'reserved'], cb);
    }

    function releaseMessage(cb) {
        execQuery('UPDATE ?? SET status = ?, date_time = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND) \
             WHERE id = ? AND version = ? AND status = ? AND time_to_run >= CURRENT_TIMESTAMP',
            [queueName, 'ready', delay, id, version, 'reserved'], cb);
    }

    function refreshMessage(cb) {
        execQuery('UPDATE ?? SET time_to_run = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND) \
            WHERE id = ? AND version = ? AND status = ? AND time_to_run >= CURRENT_TIMESTAMP',
            [queueName, timeToRun, id, version, 'reserved'], cb);
    }

    function verifyReserveError(error, info) {
        if (!error && info && !info.affectedRows) {
            error = {error: 'This message is no longer available'};
        }
        return error;
    }

}

Message.constructor = Message;

module.exports = Message;