const helper = require("../../utils/helper");
const _data = require("../../lib/data");
const token_handler = require("./token");
const menu = require("../../lib/menu.json");

const customer_handler = {
    /*
        @description: new user register
        @path: /customer/register
        @content-type: application/json
        @method: POST,
        @payload:
        {
            "firstname":"firstname",
            "lastname":"last name",
            "email":"your_email@gmail.com",
            "password":"passw0rd",
            "address":"100 main st"
        }
    */
    register: (data, callback) => {
        if (helper.isValidCustomerData(data.payload)) {
            const {
                firstname,
                lastname,
                email,
                password,
                address
            } = data.payload;
            const username = email.slice(0, email.indexOf("@"));
            // check if user already exist
            _data.read("users", username, (err, res) => {
                if (err) {
                    const newUser = {
                        firstname,
                        lastname,
                        email,
                        password: helper.hash(password),
                        address
                    };
                    _data.create(
                        "users",
                        username,
                        newUser,
                        (err, response) => {
                            if (!err && response) {
                                callback(200, {
                                    success: "add new user success"
                                });
                            } else {
                                callback(500, {
                                    error: "fail to add new user"
                                });
                            }
                        }
                    );
                } else {
                    callback(400, { error: `user already exist` });
                }
            });
        } else {
            callback(400, { error: "invalid customer data" });
        }
    },
    /*
        @description: user login with email address and passwod, tokens will be created on successful login
        @path: /customer/login
        @method: POST
        @headers: Content-Type:application/json
        @payload:{ "password":"passw0rd", "email":"your_email@gmail.com"}
    */
    login: (data, callback) => {
        const { email, password } = data.payload;
        if (email && password) {
            const username = email.slice(0, email.indexOf("@"));
            _data.read("users", username, (err, res) => {
                if (!err && res) {
                    const inputPassword = helper.hash(password);
                    if (inputPassword === res.password && email === res.email) {
                        // create token after login
                        token_handler.post(data, err => {
                            if (err === 200) {
                                callback(200, {
                                    success:
                                        "user log in and token creation success"
                                });
                            } else {
                                callback(500, {
                                    error:
                                        "create user token error after log in"
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: "invalid password or email address"
                        });
                    }
                } else {
                    callback(err, res);
                }
            });
        } else {
            callback(400, { error: "please input your email and password" });
        }
    },
    /*
        @description: logged in user log off, will need to delete token
        @path: /customer/logoff
        @method: POST
        @headers: {tokenId:'gJG9JVgGV7fGUJJTHTg2'}
    */
    logoff: (data, callback) => {
        token_handler.delete(data, callback);
    },
    /*
        @description: update user address or password
        @path: /customer/update
        @method: PUT
        @headers: {token:'gJG9JVgGV7fGUJJTHTg2', 'Content-Type':'application/json'}
        @payload: { "email":"your_email@gmail.com", "password":"passw0rd", "address":"102 william st"}
    */
    update: (data, callback) => {
        const token = data.headers.token;
        // user can update address and password, but not names & email
        const { email, password, address } = data.payload;
        token_handler.verifyToken(token, email, isValid => {
            if (isValid) {
                const username = email.slice(0, email.indexOf("@"));
                _data.read("users", username, (err, userData) => {
                    if (!err && userData) {
                        userData.address = address;
                        userData.password = helper.hash(password);
                        _data.update(
                            "users",
                            username,
                            userData,
                            (err, res) => {
                                if (!err && res) {
                                    callback(200, {
                                        success: "user data update success"
                                    });
                                } else {
                                    callback(500, {
                                        error: "user data update failed"
                                    });
                                }
                            }
                        );
                    } else {
                        callback(500, { error: "read user data error" });
                    }
                });
            } else {
                callback(403, { error: "unauthorized token" });
            }
        });
    },
    /*
        @description: delete user account, and remove linked token
        @path: /customer/cancel
        @method: DELETE
        @headers: {token: 'd9HH7HUV7dNUJaJYTHHK'}
        @payload: {"email":"your_email@gmail.com"}
    */
    cancel: (data, callback) => {
        const { token } = data.headers;
        const { email } = data.payload;
        if (token && email) {
            token_handler.verifyToken(token, email, isValid => {
                if (isValid) {
                    _data.delete(
                        "users",
                        email.slice(0, email.indexOf("@")),
                        (err, response) => {
                            if (!err && response) {
                                // delete user tokens
                                _data.delete("tokens", token, (err, res) => {});
                                callback(200);
                            } else {
                                callback(err, response);
                            }
                        }
                    );
                } else {
                    callback(400, {
                        error: "please provide a valid token and email"
                    });
                }
            });
        } else {
            callback(400, { error: "please provide a valid token and email" });
        }
    },

    /*
        @description: get pizza menu list for logged in user
        @path: /customer/listmenu
        @method: GET
        @headers: {token:'gJG9JVgGV7fGUJJTHTg2', email:'your_email@gmail.com'}
    */
    listMenu: (data, callback) => {
        const { token, email } = data.headers;
        if (token && email) {
            token_handler.verifyToken(token, email, isValid => {
                if (isValid) {
                    const pizzaMenus = menu.restaurant.menu.filter(
                        m => m.category === "Pizza"
                    )[0];
                    console.log(pizzaMenus);
                    callback(200, { success: pizzaMenus });
                } else {
                    callback(403, { error: "invalid token or email " });
                }
            });
        } else {
            callback(400, { error: "plz provide a valid token or email" });
        }
    },
    /*
        @description: a logged in user add pizza to shopping cart,identify with user email
        @path /customer/shopping/add
        @method: POST
        @content-type: application/json
        @header: { token: 'gJG9JVgGV7fGUJJTHTg2', email:'your_email@gmail.com' }
        @payload:
        {
            "pizza":"this is my 2nd order of pizza",
            "number":"8",
            "unitprice":"90"
        }
    */
    add: (data, callback) => {
        const { pizza, number, unitprice } = data.payload;
        const { token, email } = data.headers;
        if (token && email) {
            //verify token match the person
            token_handler.verifyToken(token, email, isValid => {
                if (isValid) {
                    // creating shopping cart using email
                    _data.read("cart", email, (err, pizzaData) => {
                        if (err) {
                            const order = {
                                items: [
                                    {
                                        pizza,
                                        number,
                                        unitprice
                                    }
                                ]
                            };
                            _data.create("cart", email, order, (err, res) => {
                                if (!err && res) {
                                    callback(200, {
                                        success: "add new pizza order success"
                                    });
                                } else {
                                    callback(500, {
                                        error: "add new pizza order failed"
                                    });
                                }
                            });
                        } else {
                            // add new order to existing
                            pizzaData.items.push({ pizza, number, unitprice });
                            _data.update(
                                "cart",
                                email,
                                pizzaData,
                                (err, response) => {
                                    if (!err && response) {
                                        callback(500, {
                                            success:
                                                "update pizza order success"
                                        });
                                    } else {
                                        callback(500, {
                                            error: "update pizza order failed"
                                        });
                                    }
                                }
                            );
                        }
                    });
                } else {
                    callback(403, { error: "unauthorize" });
                }
            });
        } else {
            callback(403, { error: "only authorize person can order pizza" });
        }
    },

    /*
        @description: process payment and email receipt
        @path /customer/shopping/checkout
        @method POST
        @header {token:'gJG9JVgGV7fGUJJTHTg2', email:'your_email@gmail.com'}
    */
    checkout: (data, callback) => {
        const { token, email } = data.headers;
        token_handler.verifyToken(token, email, isValid => {
            if (isValid) {
                // read shopping cart by email
                _data.read("cart", email, (err, orderData) => {
                    if (!err && orderData) {
                        const orderTotalCost = orderData.items.reduce(
                            (acc, order) => {
                                acc += order.number * order.unitprice;
                                return acc;
                            },
                            0.0
                        );
                        const paymentDetails = {
                            amount: orderTotalCost,
                            currency: "USD",
                            description: "pizza cost",
                            statement_descriptor: "online order pizza"
                        };

                        helper.processPayment(paymentDetails, success => {
                            if (success) {
                                const emailContext = {
                                    to: email,
                                    subject: "Thank you, here is your receipt",
                                    text: JSON.stringify({
                                        paymentDetails,
                                        orderDetails: orderData.items
                                    })
                                };
                                helper.sendEmail(emailContext, done => {
                                    if (done) {
                                        callback(200, {
                                            success:
                                                "payment processed, email sent to customer"
                                        });
                                    } else {
                                        callback(200, {
                                            success:
                                                "payment process, but email not sent,try later"
                                        });
                                    }
                                });
                            } else {
                                callback(400, {
                                    error: "process payment failed"
                                });
                            }
                        });
                    } else {
                        callback(500, { error: "reading shopping cart error" });
                    }
                });
            } else {
                callback(403, {
                    error: "token invalid or email, unable to checkout"
                });
            }
        });
    }
};

module.exports = customer_handler;
