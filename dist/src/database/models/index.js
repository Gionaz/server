"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const stash_1 = __importStar(require("./stash"));
exports.default = {
    Users: users_1.default,
    Activations: activations_1.default,
    Chats: chat_1.default,
    ProductsToSell: products_to_sell_1.default,
    Products: products_1.default,
    Orders: orders_1.default,
    Notifications: notifications_1.default,
    Stash: stash_1.default,
    StashSells: stash_1.StashSells
};
