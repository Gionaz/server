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
exports.reUploadImage = exports.returnThumbnail = exports.sendBySocket = exports.onRun = exports.voteForSubmission = exports.getActiveFlashChallenge = exports.SendNotificationTemp = exports.registerDeviceToken = exports.saveNotifications = exports.deleteImages = exports.deleteCategory = exports.deleteSocialFeeds = exports.getSuperUser = exports.duplicateImage = exports.deleteS3BucketImage = exports.saveMultipleImages = exports.saveImages = exports.saveImage = exports.saveSocialImage = exports.savePortfolioImages = exports.sendEmail = exports.generate = exports.validateForm = exports.Api = exports.emailRegex = exports.usernameLengthMessage = exports.maxUsernameLength = exports.minUsernameLength = exports.passwordLengthMessage = exports.maxPasswordLength = exports.minPasswordLength = exports.pinpoint = void 0;
const flashChallenges_1 = __importDefault(require("../modules/flashChallenges"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const moment_1 = __importDefault(require("moment"));
const database_1 = require("../database");
const notifications_1 = require("./notifications");
const mongoose_1 = __importDefault(require("mongoose"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
const sentry_1 = require("../sentry");
const config = new aws_sdk_1.default.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
aws_sdk_1.default.config = config;
const appId = process.env.PINPOINT_PROJECT_ID;
const ses = new aws_sdk_1.default.SES();
const s3 = new aws_sdk_1.default.S3();
exports.pinpoint = new aws_sdk_1.default.Pinpoint({
    apiVersion: "2016-12-01",
    region: process.env.AWS_REGION,
});
exports.minPasswordLength = 8;
exports.maxPasswordLength = 30;
exports.passwordLengthMessage = `Password must contain ${exports.minPasswordLength}-${exports.maxPasswordLength} characters`;
const minNameLength = 3;
const maxNameLength = 100;
const nameLengthMessage = `Name must contain ${minNameLength}-${maxNameLength} characters`;
exports.minUsernameLength = 3;
exports.maxUsernameLength = 30;
exports.usernameLengthMessage = `Username must contain ${minNameLength}-${maxNameLength} characters`;
exports.emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const Api = (res, data) => {
    res.status(201).json(data);
}, validateForm = (formData, formType) => {
    let error = {
        field: null,
        value: null,
    };
    if (formType !== "Reset Password" && !formData.email.trim()) {
        error.field = "email";
        error.value = "Email is required";
        return error;
    }
    if (!["Reset Password", "Login"].includes(formType) &&
        !exports.emailRegex.test(formData.email)) {
        error.field = "email";
        error.value = "Invalid email address";
        return error;
    }
    if (["Login", "Register", "Reset Password"].includes(formType) &&
        !formData.password.trim()) {
        error.field = "password";
        error.value = "Password is required";
        return error;
    }
    if (formType === "Register") {
        if (!formData.fullName) {
            error.field = "fullName";
            error.value = "Full name is required";
            return error;
        }
        if (formData.fullName.length < minNameLength ||
            formData.fullName.length > maxNameLength) {
            error = {
                field: "fullName",
                value: nameLengthMessage,
            };
        }
        else if (formData.userName.length < exports.minUsernameLength ||
            formData.userName.length > exports.maxUsernameLength) {
            error = {
                field: "userName",
                value: exports.usernameLengthMessage,
            };
        }
        else if (formData.password.length < exports.minPasswordLength ||
            formData.password.length > exports.maxPasswordLength) {
            error = {
                field: "password",
                value: exports.passwordLengthMessage,
            };
        }
    }
    if (formType === "Reset Password") {
        if (formData.confirmPass !== formData.password) {
            error = {
                field: "confirmPass",
                value: "Passwords do not match",
            };
        }
        else if (formData.password.length < exports.minPasswordLength ||
            formData.password.length > exports.maxPasswordLength) {
            error = {
                field: "password",
                value: exports.passwordLengthMessage,
            };
        }
    }
    return error;
}, generate = (n) => {
    var add = 1, max = 12 - add;
    if (n > max) {
        return (0, exports.generate)(max) + (0, exports.generate)(n - max);
    }
    max = Math.pow(10, n + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;
    return ("" + number).substring(add);
}, sendEmail = ({ recipients, text, subject, senderEmailAdress, html, }) => {
    const params = {
        Destination: {
            ToAddresses: recipients,
        },
        Message: {
            Body: {
                Html: { Data: html },
                Text: { Data: text },
            },
            Subject: { Data: subject },
        },
        Source: senderEmailAdress,
    };
    return ses.sendEmail(params).promise();
}, savePortfolioImages = ({ images, folder, _id }) => __awaiter(void 0, void 0, void 0, function* () {
    let imagesToSave = [];
    for (let index = 0; index < images.length; index++) {
        const { base64, ext, isCoverPhoto } = images[index];
        let image = yield (0, exports.saveImage)({ folder, base64, ext, _id });
        imagesToSave.push({
            image,
            isCoverPhoto,
            priority: 1,
        });
        if (index === images.length - 1)
            return imagesToSave;
    }
}), saveSocialImage = (socialImage, userId, portfolioId) => __awaiter(void 0, void 0, void 0, function* () {
    yield https_1.default.get(socialImage.image, (response) => __awaiter(void 0, void 0, void 0, function* () {
        let imgUrl = yield (0, exports.saveImage)({
            _id: userId + "/" + portfolioId,
            folder: "portfolio",
            addToPortfolio: response,
        });
        (0, database_1.update)({
            table: "SocialFeeds",
            qty: "updateOne",
            query: {
                _id: portfolioId,
            },
            update: {
                $push: {
                    media: {
                        image: imgUrl,
                        socialUrl: socialImage.image,
                        social: socialImage.social,
                        isCoverPhoto: socialImage.isCoverPhoto,
                    },
                },
            },
        }).then((resp) => {
            console.log(resp);
        });
    }));
}), saveImage = ({ _id, base64, addToPortfolio, folder, ext, }) => __awaiter(void 0, void 0, void 0, function* () {
    // convert the base64 image to a buffer
    const imageBuffer = addToPortfolio || Buffer.from(base64, "base64");
    const date = (0, moment_1.default)(new Date()).format("YYYY-MM-DD-HH-mm-s");
    // upload the original image to S3
    const originalKey = `${folder}/${_id}/${date}/image`;
    const originalParams = {
        Bucket: `anthology-${process.env.env}-backend`,
        Key: originalKey,
        Body: imageBuffer,
        ContentType: `image/${ext || "jpeg"}`,
    };
    let resp = yield s3.upload(originalParams).promise();
    return resp.Location;
}), saveImages = (socialImages, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const s3Images = [];
    for (const socialImage of socialImages) {
        const response = yield axios_1.default.get(socialImage.image, {
            responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data, "binary");
        const date = (0, moment_1.default)(new Date()).format("YYYY-MM-DD-HH-mm-s");
        const originalKey = `portfolios/${_id}/${date}/image`;
        const params = {
            Bucket: `anthology-${process.env.env}-backend`,
            Key: originalKey,
            Body: buffer,
            ContentType: `image/${"jpeg"}`,
        };
        let resp = yield s3.upload(params).promise();
        const s3Url = resp.Location;
        s3Images.push(Object.assign(Object.assign({}, socialImage), { image: s3Url, isUploaded: true, socialUrl: socialImage.image }));
    }
    return s3Images;
}), saveMultipleImages = ({ folder, _id, base64, }) => __awaiter(void 0, void 0, void 0, function* () {
    let images = [];
    for (let index = 0; index < base64.length; index++) {
        let imgUrl = yield (0, exports.saveImage)({ folder, base64: base64[index], _id });
        images.push(imgUrl);
        if (index === base64.length - 1)
            return images;
    }
}), deleteS3BucketImage = (image) => {
    const bucketName = image.split(".s3")[0].split("//")[1];
    const splitImg = image.split(".com/")[1];
    let itemsToDelete = ["small", "medium", "large", "huge"].map((size) => {
        return { Key: splitImg + "-thumbnail-" + size };
    });
    itemsToDelete.push({ Key: splitImg });
    const deleteParams = {
        Bucket: bucketName,
        Delete: {
            Objects: itemsToDelete,
        },
    };
    s3.deleteObjects(deleteParams, (err, data) => {
        if (err) {
            console.log(`Error deleting object ${err}`);
        }
        else
            return data;
    });
}, duplicateImage = ({ sourceKey, targetKey }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield s3
            .copyObject({
            Bucket: `anthology-${process.env.env}-backend`,
            CopySource: sourceKey.split(".com")[1],
            Key: targetKey,
        })
            .promise();
        return targetKey;
    }
    catch (err) {
        console.error(err);
    }
}), getSuperUser = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, database_1.find)({
        table: "Users",
        qty: "findOne",
        query: {
            email: process.env.superUserEmail,
        },
        project: {
            _id: 1,
        },
    });
}), deleteSocialFeeds = (query) => __awaiter(void 0, void 0, void 0, function* () {
    let portfolios = yield (0, database_1.find)({
        table: "SocialFeeds",
        qty: "find",
        query,
        project: {
            "media.image": 1,
            _id: 0,
        },
    });
    let images = portfolios
        .map((a) => a.media.map((x) => x.image))
        .flat();
    (0, exports.deleteImages)(images);
    (0, database_1.remove)({
        table: "SocialFeeds",
        qty: "deleteMany",
        query,
    }).then(() => { });
}), deleteCategory = (query) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.remove)({
        table: "Categories",
        qty: "deleteMany",
        query,
    });
}), deleteImages = (imageUrls) => __awaiter(void 0, void 0, void 0, function* () {
    for (let index = 0; index < imageUrls.length; index++) {
        (0, exports.deleteS3BucketImage)(imageUrls[index]);
        if (index === imageUrls.length - 1)
            return imageUrls.length + " images have been deleted";
    }
}), saveNotifications = (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.save)({
        table: "Notifications",
        data,
    });
    (0, notifications_1.sendPushNotification)({
        title: data.title,
        body: data.body,
        data: {},
        to: data.recipients ||
            (data.recipient === "all" ? "all" : [data.recipient]),
    });
}), registerDeviceToken = (deviceToken, device) => __awaiter(void 0, void 0, void 0, function* () {
    const updateEndpointParams = {
        ApplicationId: appId,
        EndpointId: deviceToken,
        EndpointRequest: {
            Address: deviceToken,
            ChannelType: device === "android" ? "GCM" : "APNS",
        },
    };
    const pinpoint = new aws_sdk_1.default.Pinpoint();
    pinpoint.updateEndpoint(updateEndpointParams, (err, data) => {
        if (err) {
            console.error(err);
        }
        else {
            console.log("Device token registered:", deviceToken);
        }
    });
}), SendNotificationTemp = ({ sender, recipient, template, socialFeedId, }) => __awaiter(void 0, void 0, void 0, function* () {
    let Sender = { _id: "Anthology", fullName: "Anthology" };
    if (sender !== "admin")
        Sender = yield (0, database_1.find)({
            table: "Users",
            qty: "findOne",
            query: {
                _id: sender,
            },
            project: {
                image: 1,
                fullName: 1,
                userName: 1,
            },
        });
    const payloads = {
        NEW_FOLLOWER: {
            title: (Sender.fullName.trim() || Sender.userName) +
                " just started following you!",
            body: "Open app",
            recipient,
            sender,
            message: "Started following you",
            notificationType: "following",
        },
        NEW_DAILY_CHALLENGE: {
            title: "Today's photo Challenge is Now Live!",
            body: "Make your submissions before the challenge closes to keep your streak going & be entered to win!",
            notificationType: "newFlashChallenge",
        },
        NEW_DAILY_CHALLENGE_ABOUT_TO_ENDED: {
            title: "Today's photo Challenge is about to end!",
            body: "Make your submissions before the challenge closes to keep your streak going & be entered to win!",
            notificationType: "flasChallengeAbout ToEnd",
            recipient,
        },
        NEW_DAILY_CHALLENGE_ENDED: {
            title: "Today's Challenge has Closed!",
            body: "Check out the submissions who won today's creative photo challenge!",
            notificationType: "flashChallengeEnded",
        },
        NEW_LIKE: {
            title: (Sender.fullName.trim() || Sender.userName) +
                " liked your recent post!",
            body: "Open the app to see more.",
            recipient,
            sender,
            message: "Liked your recent post.",
            socialFeedId,
            notificationType: "New like",
        },
        FLASH_CHALLENGE_WINNER: {
            title: "You've Won Today's Challenge!",
            body: "Congrats! Your photo has been selected as one of the winners of today's challenge!",
            notificationType: "flashChallengeWinners",
        },
    };
    (0, exports.saveNotifications)(payloads[template]);
}), getActiveFlashChallenge = (userId, currentChallenge) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let challenge = yield (0, database_1.find)({
            table: "FlashChallenges",
            qty: "findOne",
            query: userId
                ? {
                    isActive: true,
                    _id: { $ne: currentChallenge },
                }
                : { isActive: true, _id: { $ne: currentChallenge } },
        });
        let sponsor;
        if (challenge)
            sponsor = yield (0, database_1.find)({
                table: "Sponsors",
                qty: "findOne",
                query: {
                    _id: challenge.sponsoredBy,
                },
            });
        return challenge
            ? {
                _id: challenge._id,
                topic: challenge.topic,
                startDate: challenge.startDate,
                endDate: challenge.endDate,
                createdAt: challenge.createdAt,
                updatedAt: challenge.isActive,
                isActive: challenge.isActive,
                sponsor,
                isJoined: Boolean(challenge.joined.find((a) => a.toString() === (userId === null || userId === void 0 ? void 0 : userId.toString()))),
                isSkipped: Boolean(challenge.skipped.find((a) => a.toString() === (userId === null || userId === void 0 ? void 0 : userId.toString()))),
            }
            : null;
    }
    catch (e) {
        console.log(e);
        return e;
    }
}), voteForSubmission = ({ _id, voted, userId }) => __awaiter(void 0, void 0, void 0, function* () {
    let Update = yield (0, database_1.update)({
        table: "SocialFeeds",
        qty: "findOneAndUpdate",
        query: {
            _id,
        },
        update: {
            ["$" + (voted ? "addToSet" : "pull")]: {
                votes: new mongoose_1.default.Types.ObjectId(userId),
                likes: { likedBy: userId },
            },
        },
    });
    return Update;
}), onRun = () => {
    // FlashChallenges({ apiData: { action: "createEndFlashChallenge" } });
    setInterval(() => {
        const date = (0, moment_timezone_1.default)().tz("America/New_York");
        const time = date.format("HH:mm:ss");
        if (time === process.env.flashStartTime) {
            (0, flashChallenges_1.default)({ apiData: { action: "createEndFlashChallenge" } });
            (0, sentry_1.sendTosentry)("Flashchallenge ", "Flash challenge has started.");
        }
        else if (time === process.env.sendFlashReminder)
            (0, flashChallenges_1.default)({ apiData: { action: "sendFlashReminder" } });
        else if (time === process.env.flashEndTime)
            (0, flashChallenges_1.default)({
                apiData: { action: "createEndFlashChallenge", end: true },
            });
    }, 1000);
}, sendBySocket = (receipient, clients, data, platform) => {
    if (typeof receipient === "string") {
        let socket = clients.list[receipient + "_" + platform];
        if (socket === null || socket === void 0 ? void 0 : socket.OPEN)
            socket.send(JSON.stringify(data));
    }
    else
        (receipient.length ? receipient : Object.keys(clients.list)).forEach((receip) => {
            let socket = clients.list[receip + "_" + platform];
            if (socket === null || socket === void 0 ? void 0 : socket.OPEN)
                socket.send(JSON.stringify(data));
        });
}, returnThumbnail = (imageUrl, index) => {
    let thumbs = ["small", "medium", "large", "huge"];
    let img = imageUrl ? imageUrl + "-thumbnail-" + thumbs[index] : "";
    return img;
}, reUploadImage = ({ imgUrl, _id, folder, ext }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(imgUrl, {
            responseType: "arraybuffer",
            timeout: 5000,
            maxContentLength: 50 * 1024 * 1024,
        });
        const buffer = Buffer.from(response.data, "binary");
        const date = (0, moment_1.default)(new Date()).format("YYYY-MM-DD-HH-mm-s");
        const originalKey = `${folder}/${_id}/${date}/image`;
        const params = {
            Bucket: `anthology-prod-backend`,
            Key: originalKey,
            Body: buffer,
            ContentType: `image/${ext}`,
        };
        const resp = yield s3.upload(params).promise();
        const s3Url = resp.Location;
        return s3Url;
    }
    catch (error) {
        // console.error(`Error uploading image ${imgUrl}: `, error);
        return error;
    }
});
exports.Api = Api, exports.validateForm = validateForm, exports.generate = generate, exports.sendEmail = sendEmail, exports.savePortfolioImages = savePortfolioImages, exports.saveSocialImage = saveSocialImage, exports.saveImage = saveImage, exports.saveImages = saveImages, exports.saveMultipleImages = saveMultipleImages, exports.deleteS3BucketImage = deleteS3BucketImage, exports.duplicateImage = duplicateImage, exports.getSuperUser = getSuperUser, exports.deleteSocialFeeds = deleteSocialFeeds, exports.deleteCategory = deleteCategory, exports.deleteImages = deleteImages, exports.saveNotifications = saveNotifications, exports.registerDeviceToken = registerDeviceToken, exports.SendNotificationTemp = SendNotificationTemp, exports.getActiveFlashChallenge = getActiveFlashChallenge, exports.voteForSubmission = voteForSubmission, exports.onRun = onRun, exports.sendBySocket = sendBySocket, exports.returnThumbnail = returnThumbnail, exports.reUploadImage = reUploadImage;
