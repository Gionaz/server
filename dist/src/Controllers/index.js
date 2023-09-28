"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("./users"));
const chat_1 = __importDefault(require("./chat"));
const products_1 = __importDefault(require("./products"));
const orders_1 = __importDefault(require("./orders"));
const stash_1 = __importDefault(require("./stash"));
exports.default = {
    Users: users_1.default,
    Chats: chat_1.default,
    Products: products_1.default,
    Orders: orders_1.default,
    Stash: stash_1.default
};
