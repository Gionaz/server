"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SocialFeedsSchema = new mongoose_1.Schema({
    id: Number,
    createdAt: { type: Date, default: Date.now },
    name: { type: String },
    tags: {},
    location: {
        locName: String || null,
        coordinates: [Number],
        type: { type: String, default: "Point" },
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    isDelete: { type: Boolean, default: false },
    priority: { type: Number },
    likes: [
        {
            likedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "users",
            },
            likedImages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "SocialFeeds.media" }],
            createdAt: { type: Date, default: new Date() },
        },
    ],
    media: [
        {
            image: String,
            submissionId: Number,
            poiMediaId: Number,
            isDeleted: Boolean,
            social: String,
            socialUrl: String,
            priority: Number,
            isCoverPhoto: Boolean,
            isUploaded: { type: Boolean },
            reported: { type: Boolean, default: false },
            reportedBy: [
                {
                    createdBy: {
                        type: mongoose_1.Schema.Types.ObjectId,
                        ref: "users",
                    },
                    messages: [{ type: String }],
                },
            ],
        },
    ],
    keywords: [String],
    categories: [String],
    // category: String,
    index: Number,
    type: {
        type: String,
        default: "portfolio",
    },
    flashChallengeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "FlashChallenge" },
    challengeId: Number,
    updatedAt: Date,
    votes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    isPrivate: Boolean,
    isHotspot: Boolean,
    approved: { type: Boolean, default: false },
    associatePOIId: { type: mongoose_1.Schema.Types.ObjectId, ref: "SocialFeeds" },
});
exports.default = mongoose_1.default.model("SocialFeeds", SocialFeedsSchema);
//make sure to add keywords in the migration
