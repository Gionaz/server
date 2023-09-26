"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    productNumber: Number,
    title: String,
    price: Number,
    description: String,
    images: [String],
    createdAt: { type: Date, default: new Date() },
    postedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});
exports.default = mongoose_1.default.model("products_to_sell", schema);
