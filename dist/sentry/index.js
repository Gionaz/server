"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTosentry = void 0;
const errors_1 = __importDefault(require("./errors"));
const Sentry = require("@sentry/node");
Sentry.init({
    dsn: process.env.dsn,
});
const sendTosentry = (name, error) => {
    const message = errors_1.default[name] + ": " + error;
    Sentry.captureException(message);
};
exports.sendTosentry = sendTosentry;
