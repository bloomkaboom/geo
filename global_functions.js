to = (promise) => {
    return promise
    .then(data => {
        return [null, data];
    }).catch(err => 
        [pe(err)]
    );
}

pe = require('parse-error');

TE = function(err_message, log) {
    if(log === true) {
        console.error(err_message);
    }

    throw new Error(err_message);
};

ReE = (res, err, code) => {

    if (typeof err !== 'object') {
        err = { message: err };
    }
    
    if (typeof code !== 'undefined') {
        res.statusCode = code;
    }

    err.message = err.message || '';
    err.context = err.context || '';
    err.success = false;

    return res.json({
        success: false,
        error: err
    });
};

ReS = (res, data, code) => {
    let send_data = { success: true };
    
    if (typeof data === 'object') {
        send_data = Object.assign(data, send_data);
    }
    
    if (typeof code !== 'undefined') {
        res.statusCode = code;
    }

    return res.json(send_data);
};

const fs = require('fs');
ReF = (data, option) => {

    const filename = `${__dirname}/exports/${option.filename}`;
    data = `${data}\n`;
    fs.appendFile(filename, data, function (err) {
        if (err) throw 'Error occurred. Unable to save file.';
        data = null;
    });
};

process.on('unhandledReject', error => {
    console.error('Uncaught Error', pe(error));
});