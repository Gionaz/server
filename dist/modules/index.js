"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("./users"));
const Portfolios_1 = __importDefault(require("./Portfolios"));
const categories_1 = __importDefault(require("./categories"));
const flashChallenges_1 = __importDefault(require("./flashChallenges"));
const sponsors_1 = __importDefault(require("./sponsors"));
exports.default = {
    Users: users_1.default,
    Portfolios: Portfolios_1.default,
    Categories: categories_1.default,
    FlashChallenges: flashChallenges_1.default,
    Sponsors: sponsors_1.default,
};
