"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SellItemSchema = new mongoose_1.default.Schema({
    productNumber: { type: Number },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    images: [String],
    updatedAt: Date,
    category: { type: String, required: true }
});
SellItemSchema.pre("save", function (next) {
    const sellitem = this;
    sellitem.updatedAt = new Date();
    return next();
});
exports.default = mongoose_1.default.model("sellitem", SellItemSchema);
