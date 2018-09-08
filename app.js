
const config = require('./server/config/config');
const server = require('./server/server');

const app = {
    init: () => {
        // env config
        config();
        // init server
        server.init();
    }
};

app.init();

module.exports = app;
