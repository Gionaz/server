"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    goatProductId: Number,
    title: String,
    price: Number,
    createdAt: { type: Date, default: new Date() },
});
exports.default = mongoose_1.default.model("orders", schema);
