function callBack(cb, error, data, other) {
    if(cb) {
        try {
            cb(error, data, other);
        } catch (err) {
            console.log('CALLBACK ERROR', err);
        }
    }
}

module.exports = callBack;