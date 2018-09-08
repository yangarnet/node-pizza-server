const crypto = require("crypto");
const url = require("url");
const fs = require("fs");
const path = require("path");
const { StringDecoder } = require("string_decoder");
const https = require("https");
const querystring = require("querystring");

const helper = {
    parseJsonToObject: str => {
        try {
            const obj = JSON.parse(str);
            return obj;
        } catch (err) {
            return {};
        }
    },

    isValidEmailAddress: email => {
        const emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return email.trim().match(emailformat);
    },

    isAllStringType: (...str) => {
        const result = str.filter(s => typeof s === "string");
        return result.length === str.length;
    },

    isAllValidLength: (...str) => {
        // at least 3 chaaracter
        const result = str.filter(s => s.length >= 3);
        return result.length === str.length;
    },

    isValidCustomerData: ({ firstname, lastname, email, address }) => {
        return (
            helper.isAllStringType(firstname, lastname, email, address) &&
            helper.isAllValidLength(firstname, lastname, email, address) &&
            helper.isValidEmailAddress(email)
        );
    },

    hash: rawPassword => {
        if (typeof rawPassword === "string" && rawPassword.length > 0) {
            const hash = crypto
                .createHmac("sha256", process.env.SECRET)
                .update(rawPassword)
                .digest("hex");
            return hash;
        } else {
            return false;
        }
    },

    createRandomString: len => {
        len = typeof len === "number" && len > 0 ? len : false;
        if (len) {
            const characterSet =
                "agsdgGYUHUJIKLJNBHryuifgfgVGJFHJGVHGH9876865HJGTRTRTV67726907HUIHJKHJH";
            let str = "";
            while (str.length < len) {
                const randomChar = characterSet.charAt(
                    Math.floor(Math.random() * characterSet.length)
                );
                str += randomChar;
            }
            return str;
        }
        return "";
    },

    isLoadingStaticResources: url => {
        return (
            url === "/" ||
            url.match(/.html$/) ||
            url.match(/.css$/) ||
            url.match(/.js$/) ||
            url.match(/.jpg$/)
        );
    },

    loadingStaticResouces: (req, res) => {
        if (req.url.trim() === "/") {
            fs.readFile(
                path.join(__dirname, "../public/index.html"),
                "UTF-8",
                (err, html) => {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(html);
                }
            );
        } else if (req.url.trim().match("list-menu.html")) {
            fs.readFile(
                path.join(__dirname, "../public/list-menu.html"),
                "UTF-8",
                (err, html) => {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(html);
                }
            );
        } else if (req.url.match(/.css$/)) {
            const csspath = path.join(__dirname, "../public/", req.url.trim());
            const cssStream = fs.createReadStream(csspath, "UTF-8");
            res.writeHead(200, { "Content-Type": "text/css" });
            cssStream.pipe(res);
        } else if (req.url.match(/.js$/)) {
            const jspath = path.join(__dirname, "../public/", req.url.trim());
            const jsStream = fs.createReadStream(jspath, "UTF-8");
            res.writeHead(200, { "Content-Type": "text/plain" });
            jsStream.pipe(res);
        } else if (req.url.match(/.jpg$/)) {
            const imgPath = path.join(__dirname, "../public/", req.url.trim());
            const imgStream = fs.createReadStream(imgPath);
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            imgStream.pipe(res);
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 file not found");
        }
    },

    loadRequestPayload: (req, res, routeConfig) => {
        const method = req.method.toLowerCase().trim();
        const headers = req.headers;
        // need to get query string as well
        const reqUrl = url.parse(req.url, true);
        const query = reqUrl.query;
        const path = reqUrl.pathname;
        const trimmedPath = path.replace(/^\/+|\/+$/g, "");
        const urlParts = trimmedPath.split("/");

        //get the payload and handle request
        const decoder = new StringDecoder();
        let buffer = "";
        req.on("data", data => {
            buffer += decoder.write(data);
        });
        req.on("end", input => {
            buffer += decoder.end(input);
            // choose handler
            let targetHandler;
            if (urlParts.length === 1) {
                targetHandler =
                    routeConfig[trimmedPath] !== undefined
                        ? routeConfig[trimmedPath]
                        : routeConfig.notFound;
            } else if (urlParts.length === 2) {
                targetHandler =
                    routeConfig[urlParts[0]][urlParts[1]] !== undefined
                        ? routeConfig[urlParts[0]][urlParts[1]]
                        : routeConfig.notFound;
            } else if (urlParts.length === 3) {
                targetHandler =
                    routeConfig[urlParts[0]][urlParts[1]][urlParts[2]] !==
                    undefined
                        ? routeConfig[urlParts[0]][urlParts[1]][urlParts[2]]
                        : routeConfig.notFound;
            }

            //build request object
            const data = {
                path: trimmedPath,
                query,
                method,
                headers,
                payload: helper.parseJsonToObject(buffer)
            };

            targetHandler(data, (statusCode, response) => {
                statusCode = typeof statusCode === "number" ? statusCode : 400;
                response = typeof response === "object" ? response : {};

                res.setHeader("Content-Type", "application/json");
                res.writeHead(statusCode);
                res.end(JSON.stringify(response));
                console.log(`response: ${JSON.stringify(response, null, 4)}`);
            });
        });
    },

    processPayment: (paymentDetails, cb) => {
        const options = {
            method: process.env.METHOD,
            hostname: process.env.STRIPE_HOSTNAME,
            path: process.env.STRIPE_PATH,
            headers: {
                "Content-Type": process.env.CONTENT_TYPE,
                Authorization: process.env.PAYMENT_AUTH
            }
        };
        const req = https.request(options, res => {
            const { statusCode, statusMessage } = res;
            if (statusCode === 200 || statusMessage === "OK") {
                cb(true);
            } else {
                cb(false);
            }
        });

        req.write(
            querystring.stringify({
                ...paymentDetails,
                source: process.env.PAYMENT_TOKEN
            })
        );
        req.end();
    },

    sendEmail: (email, cb) => {
        const options = {
            method: process.env.METHOD,
            hostname: process.env.MAILGUN_HOST_NAME,
            path: process.env.MAILGUN_API_PATH,
            headers: {
                "Content-Type": process.env.CONTENT_TYPE,
                Authorization: process.env.MAILGUN_AUTH
            }
        };

        const req = https.request(options, res => {
            const { statusCode, statusMessage } = res;
            if (statusCode === 200 || statusMessage === "OK") {
                cb(true);
            } else {
                cb(false);
            }
        });

        req.write(
            querystring.stringify({
                from: process.env.MAINGUN_SANBOX,
                ...email
            })
        );
        req.end();
    }
};

module.exports = helper;
