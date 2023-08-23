"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const activationSchema = new mongoose_1.default.Schema({
    userId: { required: true, type: mongoose_1.default.Types.ObjectId, ref: 'Users' },
    code: { required: true, type: String },
    type: { type: String, default: 'Sign up' },
    expiresAt: { type: Date, required: true }
});
exports.default = mongoose_1.default.model('activations', activationSchema);
/** Run this command
 * db.activations.createIndex(
   { "expiresAt": 1 },
   { expireAfterSeconds: 0 }
)
 */ 
