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
const database_1 = require("../database");
const mongoose_1 = __importDefault(require("mongoose"));
const helper_1 = require("../helper");
const users_1 = require("./users");
const https_1 = __importDefault(require("https"));
const sentry_1 = require("../sentry");
const table = "SocialFeeds";
exports.default = ({ res, apiData }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const activeChallenge = yield (0, database_1.find)({
        table: "FlashChallenges",
        qty: "findOne",
        query: {
            isActive: true,
        },
        project: {
            _id: 1,
        },
    });
    const { action } = apiData;
    switch (action) {
        case "getSocialFeeds":
            try {
                if (apiData.device)
                    (0, users_1.updateUserDevice)(apiData.device, apiData.userId, "push");
                //get userIds fow followings
                const followings = yield (0, database_1.find)({
                    table: "Users",
                    qty: "find",
                    query: {
                        followers: new mongoose_1.default.Types.ObjectId(apiData.userId),
                    },
                    project: {
                        _id: 1,
                        image: 1,
                        fullName: 1,
                        userName: 1,
                    },
                });
                const userIds = followings.map((a) => a._id);
                let portfolios = yield (0, database_1.find)({
                    table,
                    qty: "find",
                    query: { createdBy: { $in: userIds } },
                    sort: { createdAt: -1 },
                    limit: 10,
                    skip: apiData.pageNumber * 10,
                    project: {
                        createdBy: 1,
                        likes: 1,
                        createdAt: 1,
                        type: 1,
                        flashChallengeId: 1,
                        media: {
                            $elemMatch: {
                                $or: [
                                    {
                                        isCoverPhoto: true,
                                        reported: { $ne: true },
                                    },
                                    {
                                        reported: { $ne: true },
                                    },
                                ],
                            },
                        },
                    },
                });
                let lastSocialFeedItem;
                if (apiData.pageNumber === 0)
                    lastSocialFeedItem = yield (0, database_1.find)({
                        table,
                        qty: "findOne",
                        query: { createdBy: { $in: userIds } },
                        sort: {
                            createdAt: 1,
                        },
                    });
                portfolios = yield portfolios
                    .map((portfolio) => {
                    var _a;
                    return ({
                        _id: portfolio._id,
                        postedBy: followings.find((a) => a._id.toString() === portfolio.createdBy.toString()),
                        liked: portfolio.likes
                            .map((a) => { var _a; return (_a = a.likedBy) === null || _a === void 0 ? void 0 : _a.toString(); })
                            .includes(apiData.userId),
                        likes: portfolio.likes.length,
                        type: portfolio.type,
                        flashChallengeId: portfolio.flashChallengeId,
                        createdAt: portfolio.createdAt,
                        coverImageUrl: (_a = portfolio.media[0]) === null || _a === void 0 ? void 0 : _a.image,
                    });
                })
                    .filter((a) => Boolean(a.coverImageUrl));
                (0, helper_1.Api)(res, {
                    socialFeeds: portfolios,
                    lastSocialFeedId: lastSocialFeedItem === null || lastSocialFeedItem === void 0 ? void 0 : lastSocialFeedItem._id,
                    flashChallenge: yield (0, helper_1.getActiveFlashChallenge)(apiData.userId, apiData.currentChallenge),
                });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("getSocialFeeds", e);
            }
            break;
        case "likeDislike":
            try {
                let portfolio = yield (0, database_1.find)({
                    table,
                    qty: "findOne",
                    query: { _id: apiData.feedId },
                    project: {
                        createdBy: 1,
                        media: 1,
                        _id: 0,
                    },
                });
                // let imageIds = portfolio.media.map((a: any) => a._id);
                if (activeChallenge)
                    (0, helper_1.voteForSubmission)({
                        _id: apiData.submissionId,
                        voted: apiData.value,
                        userId: apiData.userId,
                    });
                (0, database_1.update)({
                    table,
                    qty: "updateOne",
                    query: { _id: apiData.feedId },
                    update: {
                        [apiData.value ? "$push" : "$pull"]: {
                            likes: {
                                likedBy: new mongoose_1.default.Types.ObjectId(apiData.userId),
                            },
                        },
                    },
                })
                    .then((resp) => __awaiter(void 0, void 0, void 0, function* () {
                    if (apiData.value &&
                        portfolio.createdBy.toString() !== apiData.userId) {
                        yield (0, helper_1.SendNotificationTemp)({
                            sender: apiData.userId,
                            recipient: portfolio.createdBy,
                            socialFeedId: apiData.feedId,
                            template: "NEW_LIKE",
                        });
                    }
                }))
                    .catch((e) => {
                    (0, sentry_1.sendTosentry)("likeDislike", e);
                });
                (0, helper_1.Api)(res, { status: "success" });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("likeDislike", e);
            }
            break;
        case "fetchMore":
            try {
                const userPortfolios = yield (0, database_1.find)({
                    table: "SocialFeeds",
                    qty: "find",
                    query: {
                        createdBy: apiData.peerId || apiData.userId,
                        type: "portfolio",
                        // "media.reported": false,
                    },
                    sort: { index: 1, updatedAt: -1, createdAt: -1 },
                    limit: 12,
                    skip: apiData.pageNumber * 12,
                    project: {
                        name: 1,
                        coverImageUrl: 1,
                        mediaLength: { $size: "$media" },
                    },
                });
                (0, helper_1.Api)(res, userPortfolios);
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("fetchMore", e);
            }
            break;
        case "getLikes":
            try {
                let lastLke;
                if (apiData.pageNumber === 0)
                    lastLke = yield (0, database_1.find)({
                        table,
                        qty: "findOne",
                        query: {
                            _id: apiData.portfolioId,
                        },
                        project: {
                            firstLike: { $arrayElemAt: ["$likes", 0] },
                            _id: 1,
                        },
                    });
                (0, database_1.aggregate)({
                    table,
                    array: [
                        {
                            $match: {
                                _id: new mongoose_1.default.Types.ObjectId(apiData.portfolioId),
                            },
                        },
                        {
                            $project: {
                                likes: 1,
                            },
                        },
                        {
                            $unwind: "$likes",
                        },
                        {
                            $sort: {
                                "likes.createdAt": -1,
                            },
                        },
                        {
                            $skip: apiData.pageNumber * 10,
                        },
                        {
                            $limit: 10,
                        },
                    ],
                })
                    .then((portfolios) => {
                    const LikeIds = portfolios.map((a) => a.likes.likedBy);
                    (0, database_1.find)({
                        table: "Users",
                        qty: "find",
                        query: {
                            _id: {
                                $in: LikeIds,
                            },
                        },
                        project: {
                            image: 1,
                            fullName: 1,
                            userName: 1,
                            following: {
                                $in: [
                                    new mongoose_1.default.Types.ObjectId(apiData.userId),
                                    "$followers",
                                ],
                            },
                        },
                    }).then((likers) => {
                        var _a;
                        (0, helper_1.Api)(res, { likers, lastLikeId: (_a = lastLke === null || lastLke === void 0 ? void 0 : lastLke.firstLike) === null || _a === void 0 ? void 0 : _a.likedBy });
                    });
                })
                    .catch((e) => {
                    (0, sentry_1.sendTosentry)("getLikes", e);
                });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("getLikes", e);
            }
            break;
        case "savePortfolio":
            const query = {
                name: { $regex: new RegExp(`^${apiData.name}$`, "i") },
                createdBy: new mongoose_1.default.Types.ObjectId(apiData.userId),
            };
            (0, database_1.find)({
                table,
                qty: "findOne",
                query,
                project: {
                    name: 1,
                },
            })
                .then((portfolio) => __awaiter(void 0, void 0, void 0, function* () {
                if (!portfolio) {
                    if (apiData.newUploads.length || apiData.socialImages.length) {
                        let _id = apiData._id;
                        let media = apiData.newUploads || [];
                        let socialImages = [];
                        if (apiData.socialImages.length)
                            socialImages = yield (0, helper_1.saveImages)(apiData.socialImages, _id);
                        // console.log({ socialImages });
                        (0, database_1.save)({
                            table,
                            data: Object.assign(Object.assign({}, apiData), { createdBy: new mongoose_1.default.Types.ObjectId(apiData.userId), media: media.concat(socialImages) }),
                        }).then((portfolio) => {
                            (0, helper_1.Api)(res, { message: "Portfolio saved successfully" });
                        });
                    }
                    else {
                        (0, helper_1.Api)(res, {
                            error: "You need atleast 1 image for your portfolio.",
                        });
                    }
                }
                else
                    (0, helper_1.Api)(res, {
                        field: "name",
                        error: "The portfolio name exists.",
                    });
            }))
                .catch((e) => {
                (0, sentry_1.sendTosentry)("savePortfolio", e);
            });
            break;
        case "deletePortfolio":
            (0, database_1.remove)({
                table,
                qty: "findOneAndDelete",
                query: {
                    _id: apiData.portfolioId,
                },
                projection: {
                    name: 1,
                    media: 1,
                },
            })
                .then((portfolio) => {
                if (portfolio) {
                    let images = portfolio.media.map((a) => a.image);
                    images.forEach((image) => {
                        (0, helper_1.deleteS3BucketImage)(image);
                    });
                }
                (0, helper_1.Api)(res, portfolio);
            })
                .catch((e) => {
                (0, sentry_1.sendTosentry)("deletePortfolio", e);
            });
            break;
        case "checkIfNameExists":
            const Qry = apiData.portfolioId
                ? { _id: { $ne: apiData.portfolioId } }
                : {};
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: Object.assign({ name: apiData.name.trim(), createdBy: apiData.userId }, Qry),
                project: {
                    name: 1,
                    _id: 0,
                },
            })
                .then((portfolio) => {
                if (portfolio)
                    (0, helper_1.Api)(res, {
                        field: "name",
                        error: "The portfolio name exists.",
                    });
                else {
                    console.log("Portfolio does not exist");
                    (0, helper_1.Api)(res, {
                        success: true,
                    });
                }
            })
                .catch((e) => {
                (0, sentry_1.sendTosentry)("checkName", e);
            });
            break;
        case 'organizePortfolio':
            (0, database_1.update)({
                table,
                qty: "findOneAndUpdate",
                query: {
                    _id: apiData.portfolioId,
                    createdBy: apiData.userId
                },
                update: {
                    $set: {
                        media: apiData.media
                    }
                },
                options: {
                    returnOriginal: false,
                },
            }).then((portfolio) => {
                (0, helper_1.Api)(res, {
                    message: "Portfolio updated successfully",
                    portfolio,
                });
            });
            break;
        case "updatePortfolio":
            console.log(apiData);
            try {
                let updateObj = {}, media = apiData.newUploads || [], pushMedia = {};
                let _id = new mongoose_1.default.Types.ObjectId().toString();
                let socialImages = [];
                if ((_a = apiData.socialImages) === null || _a === void 0 ? void 0 : _a.length)
                    socialImages = yield (0, helper_1.saveImages)(apiData.socialImages, _id);
                pushMedia = { media: { $each: media.concat(socialImages) } };
                if ((_b = apiData.deleteImages) === null || _b === void 0 ? void 0 : _b.length) {
                    yield (0, helper_1.deleteImages)(apiData.deleteImages.map((a) => a.image));
                }
                updateObj = {
                    $push: Object.assign({}, pushMedia),
                    $set: apiData,
                };
                (0, database_1.update)({
                    table,
                    qty: "findOneAndUpdate",
                    query: { _id: apiData.portfolioId, createdBy: apiData.userId },
                    update: updateObj,
                    options: {
                        returnOriginal: false,
                    },
                }).then((portfolio) => {
                    let newMedia = portfolio.media.filter((q) => !apiData.deleteImages
                        .map((r) => r._id)
                        .includes(q._id.toString()));
                    (0, database_1.update)({
                        table,
                        qty: "findOneAndUpdate",
                        query: { _id: apiData.portfolioId, createdBy: apiData.userId },
                        update: {
                            $set: {
                                media: newMedia,
                            },
                        },
                        options: {
                            returnOriginal: false,
                        },
                    })
                        .then((portfolio) => {
                        if (apiData.coverMediaId ||
                            !portfolio.media.filter((a) => a.isCoverPhoto).length) {
                            const mediaId = apiData.coverMediaId || portfolio.media[0]._id;
                            const ifNoCoverImg = () => {
                                (0, database_1.update)({
                                    table,
                                    qty: "findOneAndUpdate",
                                    query: {
                                        _id: apiData.portfolioId,
                                        media: {
                                            $elemMatch: {
                                                _id: portfolio.media[0]._id,
                                            },
                                        },
                                        createdBy: apiData.userId,
                                    },
                                    update: { $set: { "media.$.isCoverPhoto": true } },
                                    options: {
                                        returnOriginal: false,
                                    },
                                }).then((portfolio) => {
                                    (0, helper_1.Api)(res, {
                                        message: "Portfolio updated successfully",
                                        portfolio,
                                    });
                                });
                            };
                            (0, database_1.update)({
                                table,
                                qty: "updateOne",
                                query: {
                                    _id: apiData.portfolioId,
                                    createdBy: apiData.userId,
                                },
                                update: { $set: { "media.$[].isCoverPhoto": false } },
                            });
                            if (apiData.coverMediaId)
                                (0, database_1.update)({
                                    table,
                                    qty: "findOneAndUpdate",
                                    query: {
                                        _id: apiData.portfolioId,
                                        media: {
                                            $elemMatch: {
                                                _id: mediaId,
                                            },
                                        },
                                        createdBy: apiData.userId,
                                    },
                                    update: { $set: { "media.$.isCoverPhoto": true } },
                                    options: {
                                        returnOriginal: false,
                                    },
                                }).then((portfolio) => {
                                    if (!portfolio.media.filter((a) => a.isCoverPhoto).length)
                                        ifNoCoverImg();
                                    else
                                        (0, helper_1.Api)(res, {
                                            message: "Portfolio updated successfully",
                                            portfolio,
                                        });
                                });
                            else
                                ifNoCoverImg();
                        }
                        else
                            (0, helper_1.Api)(res, {
                                message: "Portfolio updated successfully",
                                portfolio,
                            });
                    })
                        .catch((e) => {
                        (0, sentry_1.sendTosentry)("updatePortfolio", e);
                    });
                });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("updatePortfolio", e);
            }
            break;
        case "getPortfolio":
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    _id: apiData.portfolioId,
                    $or: [
                        { "media.reported": false },
                        { "media.reported": { $exists: false } },
                    ],
                },
            })
                .then((portfolio) => (0, helper_1.Api)(res, portfolio))
                .catch((e) => {
                (0, sentry_1.sendTosentry)("getPortfolio", e);
            });
            break;
        case "arrangePortfolios":
            for (let index = 0; index < apiData.portfolios.length; index++) {
                const portfolio = apiData.portfolios[index];
                (0, database_1.update)({
                    table,
                    qty: "updateOne",
                    query: {
                        _id: portfolio._id,
                        createdBy: apiData.userId,
                    },
                    update: {
                        $set: {
                            index: portfolio.index,
                            updatedAt: new Date(),
                        },
                    },
                })
                    .then(() => {
                    if (index === apiData.portfolios.length - 1)
                        (0, helper_1.Api)(res, { message: "Profile updated successfully." });
                })
                    .catch((e) => {
                    (0, sentry_1.sendTosentry)("arrangePortfolios", e);
                });
            }
            break;
        case "getPortFolios":
            try {
                let lastPortfolio;
                const query0 = apiData.searchValue
                    ? {
                        createdBy: apiData.userId,
                        type: "portfolio",
                        // "media.reported": false,
                        $or: [
                            {
                                name: { $regex: apiData.searchValue, $options: "i" },
                            },
                            {
                                categories: { $regex: apiData.searchValue, $options: "i" },
                            },
                        ],
                    }
                    : {
                        type: "portfolio",
                        createdBy: apiData.userId,
                        // "media.reported": false,
                    };
                if (!apiData.pageNumber)
                    lastPortfolio = yield (0, database_1.find)({
                        table: "SocialFeeds",
                        qty: "findOne",
                        query: query0,
                        project: { _id: 1 },
                        sort: { createdAt: 1, index: 1, updatedAt: 1 },
                    });
                const portfolios0 = yield (0, database_1.find)({
                    table: "SocialFeeds",
                    qty: "find",
                    query: query0,
                    sort: { createdAt: -1, updatedAt: -1, index: -1 },
                    limit: 12,
                    skip: apiData.pageNumber * 12,
                });
                (0, helper_1.Api)(res, {
                    lastPortfolioId: lastPortfolio === null || lastPortfolio === void 0 ? void 0 : lastPortfolio._id,
                    portfolios: portfolios0,
                });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("getPortfolios", e);
            }
            break;
        case "addImageToPortfolios":
            //we have imageurl && portfolioId[]
            //the imageurl needs to be added to the selected portfolios
            //duplicate the image for each portfolio on aws and get the url
            //using the url from aws add to the portfolio media
            try {
                for (let index = 0; index < apiData.portfolioIds.length; index++) {
                    const portfolioId = apiData.portfolioIds[index];
                    https_1.default.get(apiData.imageUrl, (response) => __awaiter(void 0, void 0, void 0, function* () {
                        let imgUrl = yield (0, helper_1.saveImage)({
                            _id: apiData.userId + "/" + portfolioId,
                            folder: "portfolio",
                            addToPortfolio: response,
                        });
                        (0, database_1.update)({
                            table,
                            qty: "updateOne",
                            query: {
                                _id: portfolioId,
                            },
                            update: {
                                $push: {
                                    media: {
                                        image: imgUrl,
                                    },
                                },
                            },
                        });
                        if (index === apiData.portfolioIds.length - 1)
                            (0, helper_1.Api)(res, {
                                message: `Profile has been updated`,
                            });
                    }));
                }
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("addPortImage", e);
            }
            break;
        case "addUploadImg":
            try {
                for (let index = 0; index < apiData.portfolioIds.length; index++) {
                    const portfolioId = apiData.portfolioIds[index];
                    let imageUrl = yield (0, helper_1.saveImage)(Object.assign(Object.assign({ _id: portfolioId }, apiData.image), { folder: "portfolio" }));
                    (0, database_1.update)({
                        table,
                        qty: "updateOne",
                        query: {
                            _id: portfolioId,
                        },
                        update: {
                            $push: {
                                media: {
                                    image: imageUrl,
                                },
                            },
                        },
                    });
                    if (index === apiData.portfolioIds.length - 1)
                        (0, helper_1.Api)(res, {
                            message: `Profile has been updated`,
                        });
                }
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("addUploadImg", e);
            }
            break;
        case "createPOI":
            const saveFn = (imgUrl) => (0, database_1.save)({
                table,
                data: Object.assign(Object.assign({}, apiData), { createdBy: new mongoose_1.default.Types.ObjectId(apiData.userId), media: [
                        {
                            image: imgUrl,
                        },
                    ], type: "POI" }),
            })
                .then((POI) => {
                (0, helper_1.Api)(res, {
                    message: "You have created a Point of Interest.",
                    POI,
                });
            })
                .catch((e) => {
                (0, sentry_1.sendTosentry)("createPOI", e);
            });
            try {
                if (apiData.participatedBy === "Portfolio")
                    https_1.default.get(apiData.image, (response) => __awaiter(void 0, void 0, void 0, function* () {
                        let portfolioImgUrl = yield (0, helper_1.saveImage)({
                            _id: apiData.userId,
                            folder: "pointOfInterest",
                            addToPortfolio: response,
                        });
                        saveFn(portfolioImgUrl);
                    }));
                else
                    (0, helper_1.saveImage)(Object.assign(Object.assign({ _id: apiData.userId }, apiData.image), { folder: "pointOfInterest" })).then((imageUrl) => saveFn(imageUrl));
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("createPOI", e);
            }
            break;
        case "getPOIs":
            //make sure to create a 2dsphere index on the "location.coordinates" field in production as well
            // db.socialfeeds.createIndex({"location.coordinates": "2dsphere"})
            try {
                let qry0 = {};
                if (apiData.type === "public")
                    qry0 = { isPrivate: false };
                else if (apiData.type === "private")
                    qry0 = {
                        isPrivate: true,
                        createdBy: new mongoose_1.default.Types.ObjectId(apiData.userId),
                    };
                else
                    qry0 = {
                        $or: [
                            { isPrivate: false },
                            {
                                isPrivate: true,
                                createdBy: new mongoose_1.default.Types.ObjectId(apiData.userId),
                            },
                        ],
                    };
                let POIs = yield (0, database_1.aggregate)({
                    table,
                    array: [
                        {
                            $geoNear: {
                                near: {
                                    coordinates: apiData.coordinates,
                                },
                                key: "location.coordinates",
                                distanceField: "dist.calculated",
                                maxDistance: apiData.distance || 10 ** 6,
                                includeLocs: "dist.location",
                                spherical: true,
                                query: Object.assign(Object.assign({}, qry0), { _id: {
                                        $nin: apiData.except.map((q) => new mongoose_1.default.Types.ObjectId(q)),
                                    }, associatePOIId: {
                                        $exists: false,
                                    }, "media.reported": false }),
                            },
                        },
                        //add project to project only fields for POI
                        {
                            $project: {
                                createdAt: 1,
                                location: 1,
                                createdBy: 1,
                                media: 1,
                                isPrivate: 1,
                                approved: 1,
                                name: 1,
                            },
                        },
                        {
                            $lookup: {
                                from: "socialfeeds",
                                let: { poiId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$associatePOIId", "$$poiId"],
                                            },
                                        },
                                    },
                                    {
                                        $project: {
                                            "media.image": 1,
                                        },
                                    },
                                ],
                                as: "associatePOIIds",
                            },
                        },
                        {
                            $sort: { createdAt: -1 },
                        },
                        {
                            $limit: 20,
                        },
                    ],
                });
                let createdByIds = POIs.map((a) => a.createdBy);
                const poiUsers = yield (0, database_1.find)({
                    table: "Users",
                    qty: "find",
                    query: {
                        _id: { $in: createdByIds },
                    },
                    project: {
                        image: 1,
                        userName: 1,
                        fullName: 1,
                    },
                });
                POIs = POIs.map((poi) => ({
                    _id: poi._id,
                    createdAt: poi.createdAt,
                    location: poi.location,
                    createdBy: poi.createdBy,
                    media: poi.media.concat(poi.associatePOIIds.map((q) => q.media).flat()),
                    isPrivate: poi.isPrivate,
                    approved: poi.creatapprovededAt,
                    name: poi.name,
                    poiCreater: poiUsers.find((user) => user._id.toString() === poi.createdBy.toString()),
                }));
                (0, helper_1.Api)(res, POIs);
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("getPOIs", e);
            }
            break;
        case "getAssociatePOIs":
            try {
                const qry = {
                    $or: [
                        { _id: new mongoose_1.default.Types.ObjectId(apiData.associatePOIId) },
                        {
                            associatePOIId: new mongoose_1.default.Types.ObjectId(apiData.associatePOIId),
                        },
                    ],
                };
                let associatePOIs = yield (0, database_1.find)({
                    table,
                    qty: "find",
                    query: qry,
                    sort: { _id: -1 },
                    limit: 10,
                    skip: apiData.pageNumber,
                });
                let createdbyIds = associatePOIs.map((a) => a.createdBy);
                let associateUsers = yield (0, database_1.find)({
                    table: "Users",
                    qty: "find",
                    query: {
                        _id: { $in: createdbyIds },
                    },
                    project: {
                        image: 1,
                        userName: 1,
                        fullName: 1,
                    },
                });
                let lastPOI;
                if (apiData.pageNumber === 0)
                    lastPOI = yield (0, database_1.find)({
                        table,
                        qty: "findOne",
                        query: qry,
                        project: {
                            _id: 1,
                        },
                        sort: { createdAt: 1 },
                    });
                let associatePois = associatePOIs.map((poi) => ({
                    _id: poi._id,
                    createdAt: poi.createdAt,
                    location: poi.location,
                    createdBy: poi.createdBy,
                    media: poi.media,
                    associatePOIId: poi.associatePOIId,
                    isPrivate: poi.isPrivate,
                    approved: poi.creatapprovededAt,
                    name: poi.name,
                    poiCreater: associateUsers.find((user) => user._id.toString() === poi.createdBy.toString()),
                }));
                (0, helper_1.Api)(res, { associatePois, lastPOId: lastPOI === null || lastPOI === void 0 ? void 0 : lastPOI._id });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("associatePOIs", e);
            }
            break;
        case "reportInappropriate":
            (0, database_1.update)({
                table,
                qty: "updateOne",
                query: {
                    _id: apiData.postId,
                    media: {
                        $elemMatch: {
                            image: apiData.imageUrl,
                        },
                    },
                },
                update: {
                    $set: {
                        "media.$.reported": true,
                    },
                    $push: {
                        "media.$.reportedBy": {
                            createdBy: new mongoose_1.default.Types.ObjectId(apiData.userId),
                            messages: apiData.messages,
                        },
                    },
                },
            })
                .then((resp) => {
                // console.log(resp);
                (0, helper_1.Api)(res, { message: "Thank you for reporting." });
            })
                .catch((e) => {
                (0, sentry_1.sendTosentry)("report", e);
            });
            //use sockets to hide the post from all devices
            break;
        case 'getId':
            (0, helper_1.Api)(res, new mongoose_1.default.Types.ObjectId());
            break;
        default:
            break;
    }
});
