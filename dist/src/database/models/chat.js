"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    from: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'users'
    },
    to: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date()
    },
    isRead: {
        type: Boolean,
        default: false
    },
    productId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'products'
    }
});
exports.default = mongoose_1.default.model('chats', schema);
