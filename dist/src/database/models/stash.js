"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    productId: { type: mongoose_1.default.Types.ObjectId, ref: 'products' },
    quantity: { type: Number, required: true },
    size: { type: Number, required: true },
    price: { type: Number, required: true },
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'users' },
    category: { type: String, default: 'Sneakers' }
});
exports.default = mongoose_1.default.model('stash', schema);
