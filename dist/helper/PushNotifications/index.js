"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const config_json_1 = __importDefault(require("./config.json"));
const admin = firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(config_json_1.default)
});
exports.default = (message) => {
    message.tokens = message.tokens.filter((a) => a !== "");
    admin.messaging().sendMulticast(message).then((res) => {
        console.log('Notication sent');
    }).catch(e => {
        console.log(e);
        console.log('Notication not sent');
    });
};
