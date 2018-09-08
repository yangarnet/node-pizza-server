const http = require('http');
const router = require('./routes/router');
const config = require('./config/config');

const server = {
    init: () => {  
        //  create http server
        const httpServer = http.createServer((req, res) => { router(req, res); });    
        // start the http server
        httpServer.listen(process.env.PORT, () => {
            console.log(`server starts....running @ port: ${process.env.PORT}`);
        });
    }
};

module.exports = server;

