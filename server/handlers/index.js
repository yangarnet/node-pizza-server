
const customer_handler = require('./customer');
const token_handler = require('./token');

const acceptMethods = ["post", "get", "put", "delete"];

const handler = {
    customer: {
        login: (data, callback) => customer_handler.login(data, callback),
        logoff: (data, callback) => customer_handler.logoff(data, callback),
        register: (data, callback) => customer_handler.register(data, callback),
        update: (data, callback) => customer_handler.update(data, callback),
        cancel: (data, callback) => customer_handler.cancel(data, callback),
        listmenu: (data, callback) => customer_handler.listMenu(data, callback),
        add: (data, callback) => customer_handler.add(data, callback),
        checkout: (data, callback) => customer_handler.checkout(data, callback)
    },
    // token: (data, callback) => {
    //     if (acceptMethods.indexOf(data.method) > -1) {
    //         token_handler[data.method](data, callback);
    //     } else {
    //         callback(404, { error: "no match token handler found" });
    //     }
    // },
    notFound: (data, callback) => {
        callback(404, {error: 'cannot find matching handler'})
    }
};

module.exports = handler;
