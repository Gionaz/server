"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StashSells = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    productId: { type: mongoose_1.default.Types.ObjectId, ref: 'products' },
    items: [
        {
            size: { type: Number, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'users' },
    category: { type: String, default: 'Sneakers' }
});
const sellSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'users' },
    stashId: { type: mongoose_1.default.Types.ObjectId, ref: 'stash' },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    date: { type: Date, default: new Date() }
});
exports.StashSells = mongoose_1.default.model('stash_sells', sellSchema);
exports.default = mongoose_1.default.model('stash', schema);
