const _data = require("../../lib/data");
const helper = require("../../utils/helper");


const token_handler = {
    // verify the token with email and tokenid
    verifyToken: (id, email, callback) => {
        _data.read("tokens", id, (err, tokenData) => {
            if (!err && tokenData) {
                if (tokenData.email === email && tokenData.expires > Date.now()) {
                    callback(true);
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        });
    },
    // get token by id
    get: (data, callback) => {
        const { tokenId } = data.query;
        if (tokenId) {
            _data.read("tokens", tokenId, (error, res) => {
                if (!error && res) {
                    callback(200, res);
                } else {
                    callback(404, { error: "token not found" });
                }
            });
        } else {
            callback(400, { error: "no token id specified" });
        }
    },
    /*private route: using email and password to generate token after user login*/
    post: (data, callback) => {
        const { email, password } = data.payload;
        if (email && password) {
            // read the user profile to load user data
            const username = email.slice(0, email.indexOf('@'));
            // token id is reandom string
            const tokenId = helper.createRandomString(20);
            const expires = Date.now() + 2000 * 60 * 60; 
            const token = {
                id: tokenId,
                email,
                expires
            };
            _data.create("tokens", tokenId, token, err => {
                if (!err) {
                    callback(200, { success: "user log in and token creation success" });
                } else {
                    callback(400, { errror: "user token creation error" });
                }
            });
        } else {
            callback(400, { error: "email or pass is missing" });
        }
    },
    
    put: (data, callback) => {
        // need to verify email and pass before updating token
        const { tokenId } = data.query;
        const { email } = data.payload; 
        if (tokenId && email) {
            _data.read("tokens", tokenId, (err, data) => {
                if (!err && data) {
                    if (data.expires > Date.now() && data.email === email) {
                        //extend by 2 hour
                        data.expires = Date.now() + 2000 * 60 * 60;
                        _data.update("tokens", tokenId, data, (err, res) => {
                            if (!err && res) {
                                callback(200, {
                                    success: "extend token successful"
                                });
                            } else {
                                callback(500, {
                                    error: "cannot extend the token"
                                });
                            }
                        });
                    } else {
                        callback(400, { error: "cannot extend expired token" });
                    }
                } else {
                    callback(404, {
                        error: `cannot find token by id ${tokenId}`
                    });
                }
            });
        } else {
            callback(400, { error: "missing required valid tokenid to update" });
        }
    },

    delete: (data, callback) => {
        const { tokenid } = data.headers;
        if (tokenid) {
            _data.read("tokens", tokenid, (err, res) => {
                if (!err && res) {
                    _data.delete("tokens", tokenid, (err, response) => {
                        if (!err && response) {
                            callback(200, { success: `user logoff success` });
                        } else {
                            callback(500, { error: "cannot delete the given token" });
                        }
                    });
                } else {
                    callback(404, { error: "given token not found" });
                }
            });
        } else {
            callback(400, { error: "no token id supplied" });
        }
    }
};

module.exports = token_handler;
