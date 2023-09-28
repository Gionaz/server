"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = exports.generateRSAKeys = exports.generateHex = exports.generateJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const hybrid_crypto_ts_1 = require("hybrid-crypto-ts");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const helper_1 = require("../helper");
const crypt = new hybrid_crypto_ts_1.Crypt(), rsa = new hybrid_crypto_ts_1.Rsa(), private_key = fs_1.default.readFileSync(path_1.default.resolve("./keys/encrypt.pem"), {
    encoding: "utf8",
});
const generateJwtToken = (userId) => {
    return jsonwebtoken_1.default.sign({
        data: userId,
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1y" });
}, generateHex = () => {
    let hex = crypto_1.default.randomBytes(64).toString("hex");
    return hex;
}, generateRSAKeys = () => {
    rsa.generateKeyPair().then((keyPair) => {
        var publicKey = keyPair.publicKey;
        var privateKey = keyPair.privateKey;
        console.log("keys", publicKey);
        console.log("keys", privateKey);
    });
}, verifyJWT = (req, res, next) => {
    if (Object.keys(req === null || req === void 0 ? void 0 : req.body).length) {
        let decrypted = crypt.decrypt(private_key, JSON.stringify(req.body));
        req.body = JSON.parse(decrypted.message);
        // console.log(req.body);
        const { action } = req.body;
        const whiteListEndPoints = [
            "Sign In",
            "Sign Up"
        ];
        if (whiteListEndPoints.includes(req.body.action)) {
            let error = (0, helper_1.validateForm)(req.body, action);
            if (error.field)
                (0, helper_1.Api)(res, error);
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
};
exports.generateJwtToken = generateJwtToken, exports.generateHex = generateHex, exports.generateRSAKeys = generateRSAKeys, exports.verifyJWT = verifyJWT;
