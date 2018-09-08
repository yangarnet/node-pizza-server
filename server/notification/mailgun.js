
const https = require('https');
const querystring = require('querystring');

function MailGun(status) {
    this.status = status;
}

MailGun.prototype = {
    send: function(email, cb) {
        const options = {
            "method": process.env.SEND_MAIL_METHOD,
            "hostname": process.env.MAILGUN_HOST_NAME,
            "path": process.env.MAILGUN_API_PATH,
            "headers": {
                "Content-Type": process.env.MAILGUN_REQ_CONTENT_TYPE,
                "Authorization": process.env.MAILGUN_AUTH
            }
        }

        const req = https.request(options, res => {
            const { statusCode, statusMessage } = res;
            if (statusCode === 200 || statusMessage === 'OK') {
                console.log('mailgun send email success');
                cb({statusCode, message: statusMessage});
            } else {
                cb({statusCode: 400, message: 'bad request'});
            }
        });
        
        req.write(querystring.stringify({ from: process.env.MAINGUN_SANBOX, ...email }))
        req.end();
    },
    setStatus: function(status) {
        this.status = status;
    },
    getStatus: function() {
        return this.status;
    }
};


module.exports = MailGun;
