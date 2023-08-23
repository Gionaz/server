"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("./users"));
const activations_1 = __importDefault(require("./activations"));
const socialFeeds_1 = __importDefault(require("./socialFeeds"));
const categories_1 = __importDefault(require("./categories"));
const feedbacks_1 = __importDefault(require("./feedbacks"));
const notifications_1 = __importDefault(require("./notifications"));
const sponsors_1 = __importDefault(require("./sponsors"));
const flashChallenges_1 = __importDefault(require("./flashChallenges"));
exports.default = {
    Users: users_1.default,
    Activations: activations_1.default,
    SocialFeeds: socialFeeds_1.default,
    Categories: categories_1.default,
    FeedBacks: feedbacks_1.default,
    Notifications: notifications_1.default,
    Sponsors: sponsors_1.default,
    FlashChallenges: flashChallenges_1.default,
};
