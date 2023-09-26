"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("./users"));
const activations_1 = __importDefault(require("./activations"));
const chat_1 = __importDefault(require("./chat"));
const products_1 = __importDefault(require("./products"));
const products_to_sell_1 = __importDefault(require("./products_to_sell"));
const orders_1 = __importDefault(require("./orders"));
const notifications_1 = __importDefault(require("./notifications"));
exports.default = {
    Users: users_1.default,
    Activations: activations_1.default,
    Chats: chat_1.default,
    ProductsToSell: products_to_sell_1.default,
    Products: products_1.default,
    Orders: orders_1.default,
    Notifications: notifications_1.default
};
