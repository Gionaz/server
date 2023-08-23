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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePasswordHash = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.default.Schema({
    id: Number,
    password: { type: String },
    lastLogin: { type: Date, default: Date.now },
    isSuperuser: { type: Boolean, default: false },
    fullName: { type: String, required: true },
    userName: { type: String },
    isStaff: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    dateJoined: { type: Date, default: Date.now },
    status: { type: String, default: "active" },
    signUpFrom: { type: String, default: "web" },
    email: { type: String, required: true },
    forgotPasswordToken: String,
    fbId: Number,
    isFbSyncExpired: { type: Boolean, default: false },
    fbName: String,
    instaId: Number,
    dob: Date,
    company: String,
    mobile: String,
    bio: String,
    isInstaSyncExpired: { type: Boolean, default: false },
    instaName: String,
    hidden: [String],
    cameras: [String],
    camera: String,
    image: String,
    jwtRefreshToken: String,
    flashStats: {
        enteredPics: Number,
        currentStreak: Number,
        streaks: [],
        wonChallenges: Number,
    },
    devices: [
        {
            name: { type: String },
            active: {
                type: Boolean,
                default: false,
            },
            date_created: {
                type: Date,
                default: Date.now,
            },
            device_id: String,
            registration_id: String,
            type: { type: String },
        },
    ],
    followers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    facebook: {
        token: String,
        expiry: Date,
        connected: Boolean,
        lastConnect: Date,
        lastDisconnect: Date,
    },
    instagram: {
        token: String,
        expiry: Date,
        connected: Boolean,
        lastConnect: Date,
        lastDisconnect: Date,
        ig_user_id: String
    },
});
UserSchema.pre("save", function (next) {
    var _a;
    const user = this;
    user.email = user.email.trim();
    user.userName = (_a = user.userName) === null || _a === void 0 ? void 0 : _a.trim();
    // If the password hasn't been modified, move on
    if (!user.isModified("password")) {
        return next();
    }
    // Generate a salt and use it to hash the password
    bcryptjs_1.default.genSalt(10, function (err, salt) {
        if (err) {
            return next(err);
        }
        bcryptjs_1.default.hash(user.password, salt, function (err, hash) {
            if (err) {
                return next(err);
            }
            // Replace the plaintext password with the hashed one
            user.password = hash;
            next();
        });
    });
});
UserSchema.methods.validPassword = (Password, pass0) => {
    const self = this;
    return bcryptjs_1.default.compareSync(Password, pass0);
};
const generatePasswordHash = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hash = yield bcryptjs_1.default.hash(password, salt);
    return hash;
});
exports.generatePasswordHash = generatePasswordHash;
exports.default = mongoose_1.default.model("User", UserSchema);
//db.getCollection('users').createIndex({"email": 1}, {unique: true})
