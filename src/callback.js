function callBack(cb, error, data, other) {
    try {
        cb(error, data, other);
    } catch (err){
        console.log(err);
    }
}

exports.callBack = callBack;