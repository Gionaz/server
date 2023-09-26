"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const helper_1 = require("../helper");
const auth_1 = require("../helper/auth");
const table = 'Users';
exports.default = ({ data, res }) => {
    const { action } = data;
    switch (action) {
        case "Sign Up":
            //check if in the database (email, or the username)
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    $or: [{ userName: data.userName }, { email: data.email }],
                },
                project: {
                    email: 1,
                    userName: 1,
                },
            }).then((user) => {
                if (!user) {
                    (0, database_1.save)({
                        table,
                        data: Object.assign({}, data),
                    }).then((user) => {
                        res.status(201).json({
                            status: "success",
                            message: "User has been registered",
                            user,
                        });
                    });
                }
                else
                    res.status(201).json({
                        status: "error",
                        message: data.email === user.email
                            ? "The email is already registed."
                            : "The username is not available.",
                        field: data.email === user.email ? "email" : "userName",
                    });
            });
            break;
        case "Sign In":
            // Check if the username or email exists in the database
            // console.log(data)
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    $or: [{ userName: data.email }, { email: data.email }],
                },
            }).then((user) => {
                if (!user) {
                    (0, helper_1.Api)(res, {
                        status: "error",
                        message: "Invalid credentials",
                        field: "email",
                    });
                }
                else {
                    if (user.validPassword(data.password, user.password)) {
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
                                status: "success",
                                User: user,
                                jwtToken
                            });
                        })
                            .catch((err) => {
                        });
                    }
                    else {
                        (0, helper_1.Api)(res, {
                            status: "error",
                            message: "Invalid password",
                            field: "password",
                        });
                    }
                }
            });
            break;
        case 'fetchAWSCredentials':
            const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
            const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
            const region = process.env.AWS_REGION;
            (0, helper_1.Api)(res, {
                accessKeyId,
                secretAccessKey,
                region,
            });
            break;
        case 'updateUserImage':
            (0, database_1.update)({
                table,
                qty: 'findOneAndUpdate',
                query: {
                    _id: data.userId
                },
                update: {
                    $set: {
                        image: data.image
                    }
                },
                options: {
                    returnOriginal: true,
                    projection: { image: 1, _id: 0 }
                }
            }).then((user) => {
                if (user.image)
                    (0, helper_1.deleteS3BucketImage)(user.image);
                //
                (0, helper_1.Api)(res, { status: "success", message: "Profile has been updated" });
                //if remove profile image, delete the old one from AWS
            });
            break;
        default:
            break;
    }
};
