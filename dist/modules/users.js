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
exports.updateUserDevice = exports.getUsersByIds = exports.peerProps = void 0;
const index_1 = require("./../sentry/index");
const helper_1 = require("../helper");
const auth_1 = require("../helper/auth");
const database_1 = require("../database");
const users_1 = require("../database/models/users");
const verifyEmail_1 = __importDefault(require("../mailTemplates/verifyEmail"));
const verifyPassCode_1 = __importDefault(require("../mailTemplates/verifyPassCode"));
const passwordChanged_1 = __importDefault(require("../mailTemplates/passwordChanged"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config({ path: "./src/.env" });
// import { sendTosentry } from "../sentry";
const table = "Users";
exports.peerProps = {
    hidden: 1,
    email: 1,
    userName: 1,
    company: 1,
    dob: 1,
    camera: 1,
    image: 1,
    fullName: 1,
    mobile: 1,
};
const getUsersByIds = (userIds, myId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let users = yield (0, database_1.find)({
            table,
            qty: "find",
            query: {
                _id: {
                    $in: userIds,
                },
            },
            project: myId
                ? Object.assign(Object.assign({}, exports.peerProps), { isFollowed: {
                        $in: [new mongoose_1.default.Types.ObjectId(myId), "$followers"],
                    } }) : exports.peerProps,
        });
        return users;
    }
    catch (e) {
        (0, index_1.sendTosentry)("getUsersByIds", e);
        return [];
    }
});
exports.getUsersByIds = getUsersByIds;
const updateUserDevice = (deviceInfo, userId, action) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let isDeviceSaved;
        let resp;
        if (action === "push")
            isDeviceSaved = yield (0, database_1.find)({
                table,
                qty: "findOne",
                query: { _id: userId, "devices.device_id": deviceInfo.device_id },
                project: { _id: 1 },
            });
        if (!isDeviceSaved || action === "pull")
            return yield (0, database_1.update)({
                table,
                qty: "updateOne",
                query: { _id: userId },
                update: {
                    ["$" + action]: {
                        devices: deviceInfo,
                    },
                },
            });
        return resp;
    }
    catch (e) {
        (0, index_1.sendTosentry)("updateUserDevice", e);
        return e;
    }
});
exports.updateUserDevice = updateUserDevice;
exports.default = ({ res, apiData, clients }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { action } = apiData;
    switch (action) {
        case "Register":
            // console.log(apiData);
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    $or: [
                        { email: apiData.email.trim() },
                        { userName: apiData.userName.trim() },
                    ],
                },
                project: {
                    email: 1,
                    password: 1,
                    userName: 1,
                },
            })
                .then((user) => {
                if (user)
                    (0, helper_1.Api)(res, {
                        field: user.email === apiData.email ? "email" : "userName",
                        error: user.email === apiData.email
                            ? "The email you entered is already registered!"
                            : "The username is not available!",
                    });
                else {
                    (0, database_1.save)({ table, data: apiData }).then((user) => {
                        var _a;
                        const code = apiData.isTest
                            ? process.env.testCode
                            : (0, helper_1.generate)(4);
                        //send emails
                        (0, helper_1.sendEmail)({
                            recipients: [(_a = apiData.email) === null || _a === void 0 ? void 0 : _a.trim()],
                            text: "Email Verification",
                            subject: "Email Verification",
                            senderEmailAdress: process.env.senderEmail,
                            html: (0, verifyEmail_1.default)({
                                code,
                                userName: apiData.userName || apiData.fullName,
                            }),
                        });
                        (0, database_1.save)({
                            table: "Activations",
                            data: {
                                userId: user._id,
                                code,
                                expiresAt: new Date(Date.now() + 30 * 60000),
                            },
                        }).then(() => {
                            (0, helper_1.Api)(res, {
                                status: "success",
                                verification: true,
                                verificationType: "email",
                                user: Object.assign(user, { password: undefined }),
                            });
                        });
                    });
                }
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("Register", e);
            });
            break;
        case "Login":
            // let url = returnThumbnail(
            //   "https://anthology-prod-backend.s3.amazonaws.com/profile/9/2022-08-09-01-08-53/fc42539f-1016-471f-8434-c686d220b390",
            //   0
            // );
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    $or: [
                        { email: apiData.email.trim().toLowerCase() },
                        { userName: apiData.email.trim() },
                    ],
                },
            })
                .then((user) => {
                var _a;
                if ((user === null || user === void 0 ? void 0 : user.status) === "suspended")
                    (0, helper_1.Api)(res, {
                        field: "email",
                        error: "This account cannot be accessed at this time. Please contact support.",
                    });
                else if (!user ||
                    !user.validPassword(apiData.password, user.password))
                    (0, helper_1.Api)(res, {
                        field: !user ? "email" : "password",
                        error: !user
                            ? "Email or username is not registered."
                            : "You have entered invalid credentials",
                    });
                else {
                    let User = Object.assign(user, {
                        password: undefined,
                        followers: undefined,
                    });
                    if (!user.isActive) {
                        const code = apiData.isTest
                            ? process.env.testCode
                            : (0, helper_1.generate)(4);
                        (0, helper_1.sendEmail)({
                            recipients: [(_a = apiData.email) === null || _a === void 0 ? void 0 : _a.trim()],
                            text: "Email Verification",
                            subject: "Email Verification",
                            senderEmailAdress: process.env.senderEmail,
                            html: (0, verifyEmail_1.default)({
                                code,
                                userName: apiData.userName || apiData.fullName,
                            }),
                        });
                        (0, database_1.save)({
                            table: "Activations",
                            data: {
                                userId: user._id,
                                code,
                                expiresAt: new Date(Date.now() + 30 * 60000),
                            },
                        })
                            .then(() => {
                            (0, helper_1.Api)(res, {
                                status: "success",
                                verification: true,
                                verificationType: "email",
                                User,
                            });
                        })
                            .catch((err) => {
                            console.log({ err });
                        });
                    }
                    else {
                        const jwtToken = (0, auth_1.generateJwtToken)(user._id);
                        const jwtRefreshToken = (0, auth_1.generateJwtToken)(user._id + "refreshToken");
                        (0, database_1.update)({
                            table,
                            qty: "updateOne",
                            query: { _id: user._id },
                            update: { $set: { jwtRefreshToken, lastLogin: new Date() } },
                        })
                            .then(() => {
                            (0, helper_1.Api)(res, {
                                User,
                                jwtToken,
                            });
                        })
                            .catch((err) => {
                            (0, index_1.sendTosentry)("Login", err); // check this update
                        });
                    }
                }
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("Login", e);
            });
            break;
        case "fgPass": //forgot password
            //check if the email email is registered
            //generate an activation code and send it through email, save it to the db
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    email: (_a = apiData.email) === null || _a === void 0 ? void 0 : _a.trim(),
                },
                project: {
                    _id: 1,
                    userName: 1,
                    fullName: 1,
                },
            })
                .then((user) => {
                // console.log(user);
                if (!user)
                    (0, helper_1.Api)(res, {
                        field: "email",
                        error: "This email is not registered.",
                    });
                else {
                    const code = apiData.isTest
                        ? process.env.testCode
                        : (0, helper_1.generate)(4);
                    (0, database_1.remove)({
                        table: "Activations",
                        qty: "deleteMany",
                        query: {
                            userId: user._id,
                        },
                    }).then(() => __awaiter(void 0, void 0, void 0, function* () {
                        var _a;
                        (0, helper_1.sendEmail)({
                            recipients: [(_a = apiData.email) === null || _a === void 0 ? void 0 : _a.trim()],
                            text: "Password reset verification",
                            subject: "Password reset verification",
                            senderEmailAdress: process.env.senderEmail,
                            html: (0, verifyPassCode_1.default)({
                                code,
                                userName: user.userName || user.fullName,
                            }),
                        });
                        (0, database_1.save)({
                            table: "Activations",
                            data: {
                                userId: user._id,
                                code,
                                type: "Forgot Password",
                                expiresAt: new Date(Date.now() + 30 * 60000),
                            },
                        }).then((code) => {
                            // console.log(code);
                            (0, helper_1.Api)(res, {
                                status: "success",
                                verification: true,
                                verificationType: "password",
                                user: {
                                    _id: user._id,
                                },
                            });
                        });
                    }));
                }
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("forgotPassword", e);
            });
            break;
        case "checkUsername":
            try {
                let user = yield (0, database_1.find)({
                    table,
                    qty: "findOne",
                    query: { userName: apiData.userName },
                });
                (0, helper_1.Api)(res, user
                    ? {
                        error: "This username is not available.",
                    }
                    : { status: "success" });
            }
            catch (e) {
                (0, index_1.sendTosentry)("checkUsername", e);
            }
            break;
        case "codeVerification":
            //check the verification code
            try {
                let userToVerify = yield (0, database_1.find)({
                    table,
                    qty: "findOne",
                    query: { email: apiData.email.toLowerCase().trim() },
                    project: apiData.verificationType === "email" ? { password: 0 } : { _id: 1 },
                });
                if (userToVerify) {
                    const record = yield (0, database_1.find)({
                        table: "Activations",
                        qty: "findOne",
                        query: {
                            userId: userToVerify._id,
                            code: apiData.code,
                        },
                        project: {
                            userId: 1,
                        },
                    });
                    // console.log(record);
                    if (apiData.verificationType === "email") {
                        const jwtToken = (0, auth_1.generateJwtToken)(userToVerify._id);
                        const jwtRefreshToken = (0, auth_1.generateJwtToken)(userToVerify._id + "refreshToken");
                        (0, database_1.update)({
                            table,
                            qty: "updateOne",
                            query: { _id: userToVerify._id },
                            update: { $set: { jwtRefreshToken, isActive: true } },
                        })
                            .then(() => {
                            (0, helper_1.Api)(res, {
                                User: Object.assign(userToVerify, { jwtToken }),
                            });
                            (0, database_1.remove)({
                                table: "Activations",
                                qty: "deleteMany",
                                query: {
                                    userId: userToVerify._id,
                                },
                            });
                        })
                            .catch((e) => {
                            (0, index_1.sendTosentry)("codeVerification", e);
                        });
                    }
                    else
                        (0, helper_1.Api)(res, !record
                            ? { error: "You have entered a wrong verification code" }
                            : {
                                status: "success",
                                User: userToVerify,
                            });
                }
                else
                    res.status(403);
            }
            catch (e) {
                (0, index_1.sendTosentry)("codeVerification", e);
            }
            break;
        case "Reset Password":
            try {
                const record = yield (0, database_1.find)({
                    table: "Activations",
                    qty: "findOne",
                    query: {
                        userId: apiData.user._id,
                        code: apiData.code,
                    },
                    project: {
                        userId: 1,
                    },
                });
                if (record) {
                    const updatedPassword = yield (0, users_1.generatePasswordHash)(apiData.password);
                    (0, database_1.update)({
                        table,
                        qty: "findOneAndUpdate",
                        query: { _id: apiData.user._id },
                        update: {
                            $set: {
                                password: updatedPassword,
                            },
                        },
                        options: { returnOriginal: true, projection: { email: 1, _id: 0 } },
                    })
                        .then((user) => {
                        (0, database_1.remove)({
                            table: "Activations",
                            qty: "deleteMany",
                            query: {
                                userId: apiData.user._id,
                            },
                        });
                        (0, helper_1.sendEmail)({
                            recipients: [user.email],
                            text: "Password changed",
                            subject: "Password changed",
                            senderEmailAdress: process.env.senderEmail,
                            html: (0, passwordChanged_1.default)(),
                        });
                        (0, helper_1.Api)(res, {
                            status: "success",
                            message: "Your password has been reset successfully.",
                            passwordReset: true,
                        });
                    })
                        .catch((e) => {
                        console.log(e);
                        (0, index_1.sendTosentry)("resetPassword", e);
                    });
                }
                else
                    (0, helper_1.Api)(res, {
                        error: "Invalid request",
                        field: "password",
                    });
            }
            catch (e) {
                (0, index_1.sendTosentry)("resetPassword", e);
            }
            break;
        case "resendCode":
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: { email: apiData.email.toLowerCase().trim() },
                project: { _id: 1, userName: 1, fullName: 1 },
            })
                .then((user) => {
                var _a;
                let code = apiData.isTest
                    ? process.env.testCode
                    : (0, helper_1.generate)(4);
                let text = apiData.verificationType === "email"
                    ? "Email Verification"
                    : "Password reset verification";
                let obj = { code, userName: user.userName || user.fullName };
                (0, helper_1.sendEmail)({
                    recipients: [(_a = apiData.email) === null || _a === void 0 ? void 0 : _a.trim()],
                    text,
                    subject: text,
                    senderEmailAdress: process.env.senderEmail,
                    html: apiData.verificationType === "email"
                        ? (0, verifyEmail_1.default)(obj)
                        : (0, verifyPassCode_1.default)(obj),
                });
                (0, database_1.update)({
                    table: "Activations",
                    qty: "updateOne",
                    query: { userId: user._id },
                    update: { $set: { code } },
                }).then((resp) => {
                    (0, helper_1.Api)(res, {
                        status: "success",
                    });
                });
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("resendCode", e);
            });
            break;
        case "getUserData":
            // try {
            let isFollowing;
            let User = yield (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    _id: apiData.peerId || apiData.userId,
                },
                project: {
                    followers: 1,
                    _id: 1,
                },
            });
            let followings = yield (0, database_1.count)({
                table,
                query: {
                    followers: apiData.peerId || apiData.userId,
                },
            });
            if (apiData.peerId)
                isFollowing = Boolean(yield (0, database_1.find)({
                    table,
                    qty: "findOne",
                    query: {
                        _id: apiData.peerId,
                        followers: new mongoose_1.default.Types.ObjectId(apiData.userId),
                    },
                    project: { _id: 1 },
                }));
            //get Portfolios
            const portfolios = yield (0, database_1.find)({
                table: "SocialFeeds",
                qty: "find",
                query: {
                    createdBy: apiData.peerId || apiData.userId,
                    type: "portfolio",
                },
                sort: { index: 1, updatedAt: -1, createdAt: -1 },
                limit: 12,
                project: {
                    name: 1,
                    media: { $elemMatch: { isCoverPhoto: true } },
                    mediaLength: { $size: "$media" },
                },
            });
            let lastPortfolio = yield (0, database_1.find)({
                table: "SocialFeeds",
                qty: "findOne",
                query: {
                    createdBy: apiData.peerId || apiData.userId,
                    type: "portfolio",
                },
                sort: { index: 1, updatedAt: -1, createdAt: -1 },
            });
            (0, helper_1.Api)(res, {
                user: {
                    followings,
                    followers: (_b = User === null || User === void 0 ? void 0 : User.followers) === null || _b === void 0 ? void 0 : _b.length,
                },
                isFollowing,
                portfolios,
                lastPortfolioId: lastPortfolio === null || lastPortfolio === void 0 ? void 0 : lastPortfolio._id,
            });
            // } catch (e){
            //   sendTosentry("getUserData", e)
            // }
            break;
        case "getFollows":
            try {
                let users;
                const getUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
                    query = apiData.searchValue
                        ? Object.assign(Object.assign({}, query), { $or: [
                                {
                                    fullName: {
                                        $regex: apiData.searchValue,
                                        $options: "i",
                                    },
                                },
                                {
                                    userName: {
                                        $regex: apiData.searchValue,
                                        $options: "i",
                                    },
                                },
                            ] }) : query;
                    let peersSize;
                    if (apiData.pageNumber === 0)
                        peersSize = yield (0, database_1.count)({ table, qty: "find", query });
                    const result = yield (0, database_1.find)({
                        table,
                        qty: "find",
                        query,
                        project: exports.peerProps,
                        sort: {
                            fullName: 1,
                            userName: 1,
                        },
                        limit: 10,
                        skip: apiData.pageNumber,
                    });
                    return {
                        peersSize,
                        peers: result,
                    };
                });
                if (apiData.type === "Following")
                    users = yield getUsers({
                        followers: apiData.peerId || apiData.userId,
                    });
                else {
                    let user = yield (0, database_1.find)({
                        table,
                        qty: "findOne",
                        query: {
                            _id: apiData.peerId || apiData.userId,
                        },
                        project: {
                            followers: 1,
                        },
                    });
                    users = yield getUsers({ _id: { $in: user.followers } });
                }
                (0, helper_1.Api)(res, users);
            }
            catch (e) {
                (0, index_1.sendTosentry)("getFollows", e);
            }
            break;
        case "removeFollow":
            (0, database_1.update)({
                table,
                qty: "updateOne",
                query: {
                    _id: apiData.type === "Following" ? apiData.peerId : apiData.userId,
                },
                update: {
                    $pull: {
                        followers: new mongoose_1.default.Types.ObjectId(apiData.type === "Following" ? apiData.userId : apiData.peerId),
                    },
                },
            })
                .then((resp) => {
                (0, helper_1.Api)(res, {
                    status: "success",
                });
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("removeFollows", e);
            });
            break;
        case "followUnfollow":
            (0, database_1.update)({
                table,
                qty: "updateOne",
                query: {
                    _id: apiData.peerId,
                },
                update: {
                    [apiData.isFollowing ? "$pull" : "$addToSet"]: {
                        followers: new mongoose_1.default.Types.ObjectId(apiData.userId),
                    },
                },
            })
                .then((resp) => __awaiter(void 0, void 0, void 0, function* () {
                if (!apiData.isFollowing) {
                    yield (0, helper_1.SendNotificationTemp)({
                        sender: apiData.userId,
                        recipient: apiData.peerId,
                        template: "NEW_FOLLOWER",
                    });
                }
                (0, helper_1.Api)(res, { status: "success" });
            }))
                .catch((e) => {
                (0, index_1.sendTosentry)("followUnfollow", e);
            });
            break;
        case "updateUser":
            //check if username or email is taken
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    _id: { $ne: apiData.userId },
                    $or: [{ email: apiData.email }, { userName: apiData.userName }],
                },
                project: {
                    email: 1,
                    userName: 1,
                },
            })
                .then((user) => {
                //
                if (!user) {
                    let error;
                    if (!helper_1.emailRegex.test(apiData.email))
                        //if the email is invalid
                        error = {
                            error: "Please enter a valid email address.",
                            field: "email",
                        };
                    else if (apiData.userName.length < helper_1.minUsernameLength ||
                        apiData.userName.length > helper_1.maxUsernameLength)
                        error = {
                            field: "userName",
                            error: helper_1.usernameLengthMessage,
                        };
                    if (error)
                        (0, helper_1.Api)(res, error);
                    else {
                        // console.log("saveUser");
                        delete apiData.password;
                        (0, database_1.update)({
                            table,
                            qty: "findOneAndUpdate",
                            query: {
                                _id: apiData.userId,
                            },
                            update: {
                                $set: apiData,
                            },
                            options: {
                                returnOriginal: false,
                                projection: {
                                    followers: 0,
                                    password: 0,
                                },
                            },
                        }).then((resp) => {
                            (0, helper_1.Api)(res, {
                                status: "success",
                                message: "Profile has been updated.",
                                user: resp,
                            });
                        });
                    }
                    // if(emailRegex.)
                }
                else {
                    let error = (apiData.email === user.email ? "Email" : "Username") +
                        " is already taken.";
                    let field = apiData.email === user.email ? "email" : "userName";
                    (0, helper_1.Api)(res, {
                        error,
                        field,
                    });
                }
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("updateUser", e);
            });
            break;
        case "updateProfPic":
            const updateUser = (image) => (0, database_1.update)({
                table,
                qty: "findOneAndUpdate",
                query: {
                    _id: apiData.userId,
                },
                update: {
                    $set: {
                        image: image || null,
                    },
                },
                options: {
                    returnOriginal: true,
                    projection: {
                        image: 1,
                        _id: 0,
                    },
                },
            })
                .then((user) => {
                if (user.image)
                    (0, helper_1.deleteS3BucketImage)(user.image);
                setTimeout(() => {
                    (0, helper_1.Api)(res, image || null);
                }, 2000);
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("updateUser", e);
            });
            if (!apiData.newImage)
                updateUser();
            else {
                try {
                    let image = yield (0, helper_1.saveImage)({
                        _id: apiData.userId,
                        folder: "profile",
                        base64: apiData.newImage,
                    });
                    updateUser(image);
                }
                catch (e) {
                    (0, index_1.sendTosentry)("updateUser", e);
                }
            }
            break;
        case "deleteAccount":
            //delete user personal information/details
            //delete followers
            //delete all categories created by user
            //delete all user portfolios
            try {
                const userToDelete = yield (0, database_1.remove)({
                    table,
                    qty: "findOneAndDelete",
                    query: {
                        _id: apiData.userId,
                    },
                    projection: {
                        image: 1,
                    },
                });
                if (userToDelete === null || userToDelete === void 0 ? void 0 : userToDelete.image)
                    (0, helper_1.deleteS3BucketImage)(userToDelete.image);
                yield (0, database_1.update)({
                    table,
                    qty: "updateMany",
                    query: {
                        followers: new mongoose_1.default.Types.ObjectId(apiData.userId),
                    },
                    update: {
                        $pull: {
                            followers: new mongoose_1.default.Types.ObjectId(apiData.userId),
                        },
                    },
                });
                yield (0, helper_1.deleteCategory)({ createdBy: apiData.userId });
                yield (0, helper_1.deleteSocialFeeds)({ createdBy: apiData.userId });
                if (res)
                    (0, helper_1.Api)(res, { message: "Account has been deleted.", status: "success" });
            }
            catch (e) {
                (0, index_1.sendTosentry)("deleteAccount", e);
            }
            break;
        case "changePass":
            try {
                let error;
                //check if new password is equal to confirm password
                if (apiData.newPass.length < helper_1.minPasswordLength ||
                    apiData.newPass.length > helper_1.maxPasswordLength)
                    error = { field: "newPass", value: helper_1.passwordLengthMessage };
                else if (apiData.newPass !== apiData.cPass)
                    error = { field: "cPass", value: "Password did not match" };
                if (error)
                    (0, helper_1.Api)(res, { error });
                else {
                    const userToChange = yield (0, database_1.find)({
                        table,
                        qty: "findOne",
                        query: {
                            _id: apiData.userId,
                        },
                        project: {
                            password: 1,
                            email: 1,
                            _id: 0,
                        },
                    });
                    if (!userToChange.validPassword(apiData.oldPass, userToChange.password))
                        (0, helper_1.Api)(res, {
                            error: {
                                field: "oldPass",
                                value: "Please enter a valid password",
                            },
                        });
                    else {
                        const newPass = yield (0, users_1.generatePasswordHash)(apiData.newPass);
                        // console.log(newPass);
                        (0, database_1.update)({
                            table,
                            qty: "updateOne",
                            query: {
                                _id: apiData.userId,
                            },
                            update: {
                                $set: {
                                    password: newPass,
                                },
                            },
                        })
                            .then((user) => {
                            (0, helper_1.Api)(res, { message: "Password changed successfully!" });
                            (0, helper_1.sendEmail)({
                                recipients: [userToChange.email],
                                text: "Password changed",
                                subject: "Password changed",
                                senderEmailAdress: process.env.senderEmail,
                                html: (0, passwordChanged_1.default)(),
                            });
                        })
                            .catch((e) => {
                            (0, index_1.sendTosentry)("changePass", e);
                        });
                    }
                }
            }
            catch (e) {
                (0, index_1.sendTosentry)("changePass", e);
            }
            break;
        case "userFeedBack":
            (0, database_1.save)({
                table: "FeedBacks",
                data: Object.assign(Object.assign({}, apiData), { createdBy: new mongoose_1.default.Types.ObjectId(apiData.userId) }),
            })
                .then((feedback) => {
                (0, helper_1.Api)(res, { message: "Feedback sent successfully" });
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("userFeedback", e);
            });
            break;
        case "search":
            const limit = 6; //apiData.selectedOption === "All" ? 5 : 10;
            const searchUsers = () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    let users = yield (0, database_1.aggregate)({
                        table,
                        array: [
                            !apiData.searchValue ? { $sample: { size: 5 } } : null,
                            {
                                $match: !apiData.searchValue
                                    ? {
                                        image: { $exists: true },
                                    }
                                    : {
                                        $or: [
                                            {
                                                fullName: {
                                                    $regex: apiData.searchValue,
                                                    $options: "i",
                                                },
                                            },
                                            {
                                                userName: {
                                                    $regex: apiData.searchValue,
                                                    $options: "i",
                                                },
                                            },
                                        ],
                                    },
                            },
                            {
                                $project: {
                                    userName: 1,
                                    fullName: 1,
                                    image: 1,
                                    hidden: 1,
                                },
                            },
                            {
                                $sort: {
                                    fullName: 1,
                                    userName: 1,
                                },
                            },
                            {
                                $skip: limit * apiData.pageNumber,
                            },
                            {
                                $limit: limit,
                            },
                        ].filter((a) => a !== null),
                    });
                    return users;
                }
                catch (e) {
                    (0, index_1.sendTosentry)("search", e);
                }
            });
            const searchPortfolios = () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const portfolios = yield (0, database_1.aggregate)({
                        table: "SocialFeeds",
                        array: [
                            !apiData.searchValue ? { $sample: { size: 5 } } : null,
                            {
                                $match: !apiData.searchValue
                                    ? {
                                        type: "portfolio",
                                    }
                                    : {
                                        type: "portfolio",
                                        $or: [
                                            {
                                                name: {
                                                    $regex: apiData.searchValue,
                                                    $options: "i",
                                                },
                                            },
                                            {
                                                categories: {
                                                    $regex: apiData.searchValue,
                                                    $options: "i",
                                                },
                                            },
                                        ],
                                    },
                            },
                            {
                                $sort: {
                                    name: 1,
                                    categories: 1,
                                },
                            },
                            {
                                $skip: limit * apiData.pageNumber,
                            },
                            {
                                $limit: limit,
                            },
                            {
                                $project: {
                                    name: 1,
                                    mediaLength: { $size: "$media" },
                                    createdBy: 1,
                                    media: {
                                        $filter: {
                                            input: "$media",
                                            as: "media",
                                            cond: { $eq: ["$$media.isCoverPhoto", true] },
                                        },
                                    },
                                },
                            },
                        ].filter((a) => a !== null),
                    });
                    const createdByIds = portfolios.map((a) => a.createdBy);
                    const users = yield (0, exports.getUsersByIds)(createdByIds);
                    return portfolios.map((portfolio) => Object.assign(portfolio, {
                        createdBy: users.find((user) => user._id.toString() === portfolio.createdBy.toString()),
                    }));
                }
                catch (e) {
                    (0, index_1.sendTosentry)("search", e);
                }
            });
            try {
                let returnObj = apiData.selectedOption === "All"
                    ? {
                        profiles: yield searchUsers(),
                        portfolios: yield searchPortfolios(),
                    }
                    : apiData.selectedOption === "Profile"
                        ? {
                            profiles: yield searchUsers(),
                        }
                        : {
                            portfolios: yield searchPortfolios(),
                        };
                (0, helper_1.Api)(res, returnObj);
            }
            catch (e) {
                (0, index_1.sendTosentry)("search", e);
            }
            break;
        case "getNotifications":
            try {
                let lastNotification;
                let Qry = {
                    recipient: apiData.userId,
                };
                if (apiData.pageNumber === 0)
                    lastNotification = yield (0, database_1.find)({
                        table: "Notifications",
                        qty: "findOne",
                        query: Qry,
                        sort: { createdAt: 1 },
                        project: { _id: 1 },
                    });
                let notifications = yield (0, database_1.find)({
                    table: "Notifications",
                    qty: "find",
                    query: Qry,
                    sort: {
                        createdAt: -1,
                    },
                    skip: apiData.pageNumber * 15,
                    limit: 15,
                    project: {
                        recipient: 0,
                        _id: 0,
                        __v: 0,
                    },
                });
                const senderIds = notifications.map((a) => a.sender);
                const Users = yield (0, database_1.find)({
                    table,
                    qty: "find",
                    query: { _id: { $in: senderIds } },
                    project: {
                        fullName: 1,
                        userName: 1,
                        image: 1,
                        _id: 1,
                        isFollowed: {
                            $in: [new mongoose_1.default.Types.ObjectId(apiData.userId), "$followers"],
                        },
                    },
                });
                const SocialFeedsIds = notifications
                    .map((a) => a.socialFeedId)
                    .filter((q) => Boolean(q));
                let SociaFeeds = [];
                if (SocialFeedsIds.length)
                    SociaFeeds = yield (0, database_1.find)({
                        table: "SocialFeeds",
                        qty: "find",
                        query: {
                            _id: { $in: SocialFeedsIds },
                        },
                        project: {},
                    });
                let Notifications = notifications.map((a) => {
                    let social = SociaFeeds.find((SocialFeed) => { var _a; return SocialFeed._id.toString() === ((_a = a.socialFeedId) === null || _a === void 0 ? void 0 : _a.toString()); });
                    return {
                        socialFeedId: a.socialFeedId,
                        message: a.message,
                        read: a.read,
                        viewed: a.viewed,
                        notificationType: a.notificationType,
                        createdAt: a.createdAt,
                        socialItem: social
                            ? {
                                _id: social === null || social === void 0 ? void 0 : social._id,
                                liked: social.likes
                                    .map((a) => { var _a; return (_a = a.likedBy) === null || _a === void 0 ? void 0 : _a.toString(); })
                                    .includes(apiData.userId),
                                likes: social.likes.length,
                                type: social.type,
                                flashChallengeId: social.flashChallengeId,
                                createdAt: social.createdAt,
                                coverImageUrl: social.media[0].image,
                            }
                            : null,
                        sender: Users.find((User) => User._id.toString() === a.sender.toString()),
                    };
                });
                (0, helper_1.Api)(res, { Notifications, lastNotificationId: lastNotification === null || lastNotification === void 0 ? void 0 : lastNotification._id });
            }
            catch (e) {
                (0, index_1.sendTosentry)("getNotification", e);
            }
            break;
        case "regenerateJwtToken":
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    _id: apiData.userId,
                    jwtRefreshToken: apiData.jwtToken,
                },
            })
                .then((user) => {
                const jwtToken = (0, auth_1.generateJwtToken)(user._id);
                const jwtRefreshToken = (0, auth_1.generateJwtToken)(user._id + "refreshToken");
                if (user) {
                    (0, database_1.update)({
                        table,
                        qty: "updateOne",
                        query: { _id: user._id },
                        update: { $set: { jwtRefreshToken } },
                    }).then(() => {
                        (0, helper_1.Api)(res, {
                            User,
                            jwtToken,
                        });
                    });
                }
                else {
                    (0, helper_1.Api)(res, {
                        message: "You are required to logout all previous sessions",
                        jwtRefreshToken,
                        jwtToken,
                    });
                }
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("regenerateJwtToken", e);
            });
            break;
        case "socialConnected":
            (0, database_1.update)({
                table,
                qty: "updateOne",
                query: { _id: apiData.userId },
                update: {
                    $set: apiData.data
                        ? {
                            [apiData.social]: apiData.data,
                        }
                        : {
                            [apiData.social + ".connected"]: false,
                            [apiData.social + ".lastDisconnect"]: new Date(),
                        },
                },
            })
                .then((resp) => {
                if (apiData.data.ig_user_id)
                    (0, helper_1.sendBySocket)(apiData.userId, clients, {
                        token: apiData.data.token,
                        ig_user_id: apiData.data.ig_user_id,
                        action: "connectedToInstagram",
                    }, "mobile");
                else
                    (0, helper_1.Api)(res, {
                        message: `You have successfully ${apiData.data ? "connected to" : "disconnected from"} ${apiData.social}`,
                    });
            })
                .catch((e) => {
                (0, index_1.sendTosentry)("socialConnect", e);
            });
            break;
        case "isSocialConnected":
            try {
                const userSocial = yield (0, database_1.find)({
                    table,
                    qty: "findOne",
                    query: { _id: apiData.userId },
                    project: { [apiData.social]: 1 },
                });
                const socialToken = userSocial[apiData.social];
                let responseMessage;
                if (!(socialToken === null || socialToken === void 0 ? void 0 : socialToken.connected))
                    responseMessage = "Not connected";
                else if (new Date() > new Date(socialToken.expiry)) {
                    responseMessage = "Token expired";
                }
                else {
                    responseMessage = socialToken.token;
                }
                (0, helper_1.Api)(res, responseMessage);
            }
            catch (e) {
                (0, index_1.sendTosentry)("isSocialConnect", e);
            }
            break;
        case "getConnectedSocials":
            try {
                const connectedSocials = yield (0, database_1.find)({
                    table,
                    qty: "findOne",
                    query: { _id: apiData.userId },
                    project: {
                        "facebook.connected": 1,
                        "instagram.connected": 1,
                        _id: 0,
                    },
                });
                (0, helper_1.Api)(res, [
                    connectedSocials.facebook.connected ? "Facebook" : null,
                    connectedSocials.instagram.connected ? "Instagram" : null,
                ].filter((q) => q !== null));
            }
            catch (e) {
                (0, index_1.sendTosentry)("getConnectedSocials", e);
            }
            break;
        case "fetchAWSCredentials":
            const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
            const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
            const region = process.env.AWS_REGION;
            (0, helper_1.Api)(res, {
                accessKeyId,
                secretAccessKey,
                region,
            });
            break;
        default:
            break;
    }
});
