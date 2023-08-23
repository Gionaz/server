"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstagramAccessToken = exports.decodeBase64 = exports.authSoket = exports.checkUserAuth = exports.removeUndefined = exports.generateJwtToken = exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hybrid_crypto_ts_1 = require("hybrid-crypto-ts");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const _1 = require(".");
const database_1 = require("../database");
const axios_1 = __importDefault(require("axios"));
const crypt = new hybrid_crypto_ts_1.Crypt();
const private_key = fs_1.default.readFileSync(path_1.default.resolve("./keys/dev_private.pem"), {
    encoding: "utf8",
});
const verifyJWT = (req, res, next) => {
    // console.log(req.body.userId);
    if (process.env.isOmbati || (req.query.code && req.query.state))
        next();
    else {
        if (Object.keys(req === null || req === void 0 ? void 0 : req.body).length) {
            let decrypted = crypt.decrypt(private_key, JSON.stringify(req.body));
            req.body = JSON.parse(decrypted.message);
            const { action } = req.body;
            const whiteListEndPoints = [
                "Register",
                "Login",
                "fgPass",
                "codeVerification",
                "Reset Password",
                "resendCode",
            ];
            if (whiteListEndPoints.includes(req.body.action)) {
                let error = (0, _1.validateForm)(req.body, action);
                if (error.field)
                    (0, _1.Api)(res, error);
                else
                    next();
            }
            else if (action === "checkUsername")
                next();
            else {
                const authHeader = req.headers.authorization || req.headers.Authorization;
                if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")))
                    return res.sendStatus(401);
                const token = authHeader.split(" ")[1];
                jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(403); //invalid token
                    }
                    else {
                        req.body.userId = decoded.data;
                        next();
                    }
                });
            }
        }
        else
            return res.sendStatus(401);
    }
}, generateJwtToken = (userId) => {
    return jsonwebtoken_1.default.sign({
        data: userId,
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
}, removeUndefined = (obj) => Object.entries(obj).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {}), checkUserAuth = ({ token, platform }) => new Promise((resolve, reject) => {
    (0, database_1.find)({
        table: 'Users',
        qty: 'findOne',
        query: { [platform + 'JwtToken']: token },
        project: { status: 1, [platform + 'Token']: 1, _id: 0 }
    }).then((user) => resolve(user)).catch(e => reject(e));
}), authSoket = (data) => new Promise((resolve, reject) => {
    try {
        let decrypted = crypt.decrypt(private_key, data), datam = JSON.parse(decrypted.message);
        // checkUserAuth({ token: datam.token, platform: datam.platform }).then((user: any) => {
        //   if (datam.action === 'developerOnline')
        //     resolve(removeUndefined(datam))
        //   else if (user)
        //     jwt.verify(datam.token, datam.platform === 'web' ? dev_jwt : user[datam.platform + 'Token'], (err: any, jwtResp: any) => {
        //       if (err)
        //         reject(err)
        //       else {
        //         datam.userId = jwtResp.data;
        //         datam.jwtToken = undefined;
        //         resolve(removeUndefined(datam))
        //       }
        //     })
        // }
        // )
        jsonwebtoken_1.default.verify(datam.token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(Object.assign({ userId: decoded.data }, datam));
            }
        });
    }
    catch (e) {
        console.log('error');
    }
}), decodeBase64 = (base64String) => {
    const decodedString = atob(base64String);
    return decodedString;
}, getInstagramAccessToken = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://api.instagram.com/oauth/access_token';
    const params = new URLSearchParams({
        client_id: process.env.instagramAppId,
        client_secret: process.env.instagramSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.instagramUrl
    });
    try {
        const resp = yield axios_1.default.post(url, params);
        return resp;
    }
    catch (e) {
        return e;
    }
});
exports.verifyJWT = verifyJWT, exports.generateJwtToken = generateJwtToken, exports.removeUndefined = removeUndefined, exports.checkUserAuth = checkUserAuth, exports.authSoket = authSoket, exports.decodeBase64 = decodeBase64, exports.getInstagramAccessToken = getInstagramAccessToken;
