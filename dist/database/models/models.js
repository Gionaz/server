"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const activations_1 = __importDefault(require("./activations"));
const users_1 = __importDefault(require("./users"));
exports.default = {
    Users: users_1.default,
    Activations: activations_1.default
};
