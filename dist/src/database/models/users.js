"use strict";
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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.default.Schema({
    password: { type: String },
    lastLogin: { type: Date, default: Date.now },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String },
    isActive: { type: Boolean, default: false },
    dateJoined: { type: Date, default: Date.now },
    status: { type: String, default: "active" },
    email: { type: String, required: true },
    image: { type: String },
    userVerified: Boolean,
    phone: String,
    age: String,
    zipcode: String,
    interest: String,
    confirmpass: String,
    jwtRefreshToken: String,
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
    ]
});
UserSchema.pre("save", function (next) {
    var _a;
    const user = this;
    user.email = user.email.trim();
    user.userName = (_a = user.userName) === null || _a === void 0 ? void 0 : _a.trim();
    //user.password = user.password?.trim();
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
exports.default = mongoose_1.default.model("users", UserSchema);
//db.getCollection('users').createIndex({"email": 1}, {unique: true})
