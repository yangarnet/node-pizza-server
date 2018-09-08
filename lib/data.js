const fs = require("fs");
const path = require("path");
const helper = require("../utils/helper");

const _data = {};
_data.baseDir = path.join(__dirname, "/../data");

// create a file in given directory
_data.create = (dirname, filename, data, callback) => {
    // open first, then write the file
    fs.open(`${_data.baseDir}/${dirname}/${filename}.json`, "wx", (err, fileDescritor) => {
            if (!err && fileDescritor) {
                const stringData = JSON.stringify(data);
                // writ the file
                fs.writeFile(fileDescritor, stringData, err => {
                    if (!err) {
                        fs.close(fileDescritor, err => {
                            if (!err) {
                                callback(false, { success: "create data success" });
                            } else {
                                callback(400, {error: "error in closing data after witing" });
                            }
                        });
                    } else {
                        callback(400, { error: "error in writing data" });
                    }
                });
            } else {
                callback(400, { error: "error in opening data" });
            }
        }
    );
};

_data.read = (dirname, filename, callback) => {
    fs.readFile(`${_data.baseDir}/${dirname}/${filename}.json`, "utf8", (err, data) => {
            if (!err && data) {
                const parsedData = helper.parseJsonToObject(data);
                callback(false, parsedData);
            } else {
                if (err.message.includes("no such file or directory")) {
                    callback(404, { error: "not found" });
                } else {
                    callback(400, { error: "reading file error" });
                }
            }
        }
    );
};

_data.update = async (dirname, filename, data, callback) => {
    fs.open(`${_data.baseDir}/${dirname}/${filename}.json`, "r+", (err, fileDescritor) => {
            if (!err && fileDescritor) {
                const stringData = JSON.stringify(data);
                fs.truncate(fileDescritor, err => {
                    if (!err) {
                        fs.writeFile(fileDescritor, stringData, err => {
                            if (!err) {
                                fs.close(fileDescritor, err => {
                                    if (!err) {
                                        callback(false, { success: "update success" });
                                    } else {
                                        callback(400, { error: "error in file closing" });
                                    }
                                });
                            } else {
                                callback(400, { error: "error in writing file" });
                            }
                        });
                    } else {
                        callback(400, { error: "error in truncating file" });
                    }
                });
            } else {
                callback(400, { error: "could not open the file for update" });
            }
        }
    );
};

_data.delete = (dirname, filename, callback) => {
    fs.unlink(`${_data.baseDir}/${dirname}/${filename}.json`, err => {
        if (!err) {
            callback(false, { success: "delete data success" });
        } else {
            callback(400, { error: "error delete the file" });
        }
    });
};

module.exports = _data;
