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
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../database");
const users_1 = require("./users");
const helper_1 = require("../helper");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const sentry_1 = require("../sentry");
const table = "FlashChallenges";
exports.default = ({ res, apiData }) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = apiData;
    const activeChallenge = yield (0, database_1.find)({
        table,
        qty: "findOne",
        query: {
            isActive: true,
        },
        project: {
            _id: 1,
        },
    });
    switch (apiData.action) {
        case "createEndFlashChallenge":
            console.log((0, moment_timezone_1.default)().tz("America/New_York"));
            (0, database_1.update)({
                table,
                qty: "findOneAndUpdate",
                query: {
                    isActive: true,
                },
                update: {
                    $set: {
                        isActive: false,
                    },
                },
                options: {
                    projection: {
                        joined: 1,
                    },
                },
            })
                .then((fl) => __awaiter(void 0, void 0, void 0, function* () {
                //logic to create a new flash challenge
                if (!apiData.end) {
                    (0, database_1.update)({
                        table,
                        qty: "updateOne",
                        query: {
                            $expr: {
                                $eq: [
                                    {
                                        $dateToString: { format: "%Y-%m-%d", date: "$startDate" },
                                    },
                                    {
                                        $dateToString: {
                                            format: "%Y-%m-%d",
                                            date: new Date((0, moment_timezone_1.default)().tz("America/New_York").toString()),
                                        },
                                    },
                                ],
                            },
                        },
                        update: {
                            $set: {
                                isActive: true,
                                activated: true,
                                endDate: {
                                    $toDate: {
                                        $add: [
                                            { $toDate: "$startDate" },
                                            { $multiply: [7 * 60 * 60 * 1000, 1] },
                                        ],
                                    },
                                },
                            },
                        },
                    })
                        .then((resp) => {
                        // console.log(resp);
                        if (resp.modifiedCount) {
                            console.log("Flash challenge has been set.");
                            (0, helper_1.SendNotificationTemp)({
                                sender: "admin",
                                recipient: "all",
                                template: apiData.end
                                    ? "NEW_DAILY_CHALLENGE_ENDED"
                                    : "NEW_DAILY_CHALLENGE",
                            });
                        }
                    })
                        .catch((e) => {
                        (0, sentry_1.sendTosentry)("createEndFlashChallenge", e);
                    });
                }
                else {
                    //get submissions with highest number of votes
                    try {
                        const wins = yield (0, database_1.aggregate)({
                            table: "SocialFeeds",
                            array: [
                                {
                                    $match: {
                                        flashChallengeId: fl === null || fl === void 0 ? void 0 : fl._id,
                                    },
                                },
                                {
                                    $project: {
                                        createdBy: 1,
                                        votes: { $size: "$votes" },
                                    },
                                },
                                {
                                    $sort: {
                                        votes: -1,
                                    },
                                },
                                {
                                    $limit: 3,
                                },
                            ],
                        });
                        //get winnerIds
                        const winnerIds = wins.map((a) => a.createdBy);
                        (0, helper_1.SendNotificationTemp)({
                            sender: "admin",
                            recipient: winnerIds,
                            template: "FLASH_CHALLENGE_WINNER",
                        });
                        (0, database_1.update)({
                            table: "Users",
                            qty: "update",
                            query: {
                                _id: { $in: winnerIds },
                            },
                            update: {
                                $inc: {
                                    "flashStats.wonChallenges": 1,
                                },
                            },
                        });
                        (0, database_1.update)({
                            table: "Users",
                            qty: "update",
                            query: {
                                _id: { $nin: fl.joined },
                            },
                            update: {
                                $set: {
                                    "flashStats.currentStreak": 0,
                                },
                            },
                        });
                    }
                    catch (e) {
                        (0, sentry_1.sendTosentry)("createEndFlashChallenge", e);
                    }
                }
            }))
                .catch((e) => {
                (0, sentry_1.sendTosentry)("createEndFlashChallenge", e);
            });
            break;
        case "sendFlashReminder":
            //get joined and skipped
            try {
                let flashChallenge0 = yield (0, database_1.find)({
                    table,
                    qty: "findOne",
                    query: { isActive: true },
                    project: {
                        joined: 1,
                        skipped: 1,
                    },
                });
                if (flashChallenge0) {
                    const participated = flashChallenge0.joined.concat(flashChallenge0.skipped);
                    const recipients = yield (0, database_1.find)({
                        table: "Users",
                        qty: "find",
                        query: {
                            _id: { $nin: participated },
                        },
                        project: {
                            _id: 1,
                        },
                    });
                    (0, helper_1.SendNotificationTemp)({
                        sender: "admin",
                        recipients: recipients,
                        template: "NEW_DAILY_CHALLENGE_ABOUT_TO_ENDED",
                    });
                }
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("flashReminder", e);
            }
            break;
        case "flashSubmission":
            //start by finding the flash challenge that user wants to participate
            // then submit the photo/challenge
            try {
                const flashChallengeId = apiData.flashChallengeId;
                let flashChallenge = yield (0, database_1.find)({
                    table,
                    qty: "findOne",
                    query: {
                        _id: flashChallengeId,
                        isActive: true,
                    },
                    project: {
                        topic: 1,
                        isActive: 1,
                    },
                });
                if (flashChallenge) {
                    //check that the user has not submitted a challenge already
                    const userSubmission = yield (0, database_1.find)({
                        table: "SocialFeeds",
                        qty: "findOne",
                        query: {
                            createdBy: apiData.userId,
                            flashChallengeId,
                        },
                    });
                    // console.log({userSubmission})
                    if (!userSubmission) {
                        //save the flashchallenge submission to s3 bucket
                        let savedImageUrl = apiData.image;
                        if (apiData.participatedBy !== "Portfolio")
                            savedImageUrl = yield (0, helper_1.saveImage)(Object.assign(Object.assign({ _id: flashChallengeId }, apiData.image), { folder: "flashChallenge" }));
                        // update the user to joined
                        (0, database_1.update)({
                            table,
                            qty: "findOneAndUpdate",
                            query: {
                                _id: flashChallengeId,
                            },
                            update: {
                                $addToSet: {
                                    joined: new mongoose_1.default.Types.ObjectId(apiData.userId),
                                },
                            },
                        });
                        const savedSubmission = yield (0, database_1.save)({
                            table: "SocialFeeds",
                            data: Object.assign(Object.assign({}, apiData), { media: [
                                    {
                                        image: savedImageUrl,
                                        isCoverPhoto: true,
                                    },
                                ], createdBy: new mongoose_1.default.Types.ObjectId(apiData.userId), type: "flashChallenge" }),
                        });
                        (0, helper_1.Api)(res, {
                            message: "Flash challenge submitted successfully!",
                        });
                        // console.log({ savedSubmission });
                        if (savedSubmission) {
                            //<checking whether user submitted a flashchallenge the day before/yesterday>
                            //first we get the date when media was submitted
                            //then get yesterday's date
                            //thirdly we compare dates
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                            const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
                            const userPreviousDaySubmission = yield (0, database_1.find)({
                                table: "SocialFeeds",
                                qty: "findOne",
                                query: {
                                    createdAt: { $gte: startOfYesterday, $lt: endOfYesterday },
                                    createdBy: apiData.userId,
                                    type: "flashChallenge",
                                },
                            });
                            const User = yield (0, database_1.find)({
                                table: "Users",
                                qty: "findOne",
                                query: { _id: apiData.userId },
                                project: {
                                    flashStats: 1,
                                    _id: 0,
                                },
                            });
                            let streaks = User.flashStats.streaks;
                            const userHadPreviousDaySubmission = userPreviousDaySubmission !== null;
                            if (userHadPreviousDaySubmission) {
                                streaks[streaks.length - 1] += 1;
                            }
                            else {
                                streaks.push(1);
                            }
                            (0, database_1.update)({
                                table: "Users",
                                qty: "updateOne",
                                query: { _id: apiData.userId },
                                update: {
                                    $set: {
                                        "flashStats.currentStreak": userPreviousDaySubmission
                                            ? User.flashStats.currentStreak + 1
                                            : 1,
                                        "flashStats.streaks": streaks,
                                    },
                                    $inc: {
                                        "flashStats.enteredPics": 1,
                                    },
                                },
                            });
                        }
                    }
                    else {
                        (0, helper_1.Api)(res, {
                            error: "You have already submitted a flash challenge.",
                        });
                    }
                }
                else {
                    (0, helper_1.Api)(res, {
                        error: "The flash challenge has expired!",
                    });
                }
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("flashSubmission", e);
            }
            break;
        case "userSkipped":
            try {
                const userSkipped = yield (0, database_1.update)({
                    table,
                    qty: "findOneAndUpdate",
                    query: {
                        _id: apiData.flashChallengeId,
                    },
                    update: {
                        $addToSet: { skipped: new mongoose_1.default.Types.ObjectId(apiData.userId) },
                    },
                });
                (0, helper_1.Api)(res, {
                    message: "You have skipped today's flash challenge.",
                });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("userSkipped", e);
            }
            break;
        case "getFlashSubmissions":
            try {
                let lastSubmission;
                //get the last submission Id
                if (apiData.pageNumber === 0)
                    lastSubmission = yield (0, database_1.find)({
                        table: "SocialFeeds",
                        qty: "findOne",
                        query: {
                            flashChallengeId: activeChallenge._id,
                        },
                        project: {
                            _id: 1,
                        },
                        sort: {
                            createdAt: 1,
                        },
                    });
                //get submission record to that specific flash challenge
                const submissions = yield (0, database_1.find)({
                    table: "SocialFeeds",
                    qty: "find",
                    query: {
                        flashChallengeId: activeChallenge._id,
                    },
                    sort: {
                        createdAt: -1,
                    },
                    project: {
                        "media.image": 1,
                        isVoted: {
                            $in: [new mongoose_1.default.Types.ObjectId(apiData.userId), "$votes"],
                        },
                    },
                    limit: 15,
                    skip: 15 * apiData.pageNumber,
                });
                (0, helper_1.Api)(res, { submissions, lastSubmissionId: lastSubmission === null || lastSubmission === void 0 ? void 0 : lastSubmission._id });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("getFlashSubmission", e);
            }
            break;
        case "likeMultiFlashSubmissions":
            try {
                const likedSubmissions = {
                    likedBy: new mongoose_1.default.Types.ObjectId(apiData.userId),
                };
                (0, database_1.update)({
                    table: "SocialFeeds",
                    qty: "findOneAndUpdate",
                    query: {
                        _id: { $in: apiData.ids },
                    },
                    update: {
                        $addToSet: {
                            likes: likedSubmissions,
                        },
                    },
                });
                (0, helper_1.Api)(res, {
                    message: "Multiple flash submissions liked",
                });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("likeFlashSubmissions", e);
            }
            break;
        case "voteForSubmission":
            try {
                if (activeChallenge) {
                    (0, helper_1.voteForSubmission)({
                        _id: apiData.submissionId,
                        voted: apiData.voted,
                        userId: apiData.userId,
                    });
                    (0, helper_1.Api)(res, {
                        message: "Your vote has been cast successfully!",
                    });
                }
                else {
                    (0, helper_1.Api)(res, {
                        message: "The flash challenge has expired!",
                    });
                }
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("voteForSubmission", e);
            }
            break;
        case "getWinners":
            try {
                const pastFlashChallenges = yield (0, database_1.find)({
                    table: "FlashChallenges",
                    qty: "find",
                    query: { isActive: { $ne: true }, activated: true },
                    skip: apiData.pageNumber * 10,
                    limit: 10,
                    project: { _id: 1, topic: 1 },
                });
                const ActiveFlash = yield (0, database_1.find)({
                    table: "FlashChallenges",
                    qty: "findOne",
                    query: { isActive: true },
                    project: { _id: 1 },
                });
                const flashIds = pastFlashChallenges.map((a) => new mongoose_1.default.Types.ObjectId(a._id));
                const wins = yield (0, database_1.aggregate)({
                    table: "SocialFeeds",
                    array: [
                        {
                            $match: {
                                type: "flashChallenge",
                                flashChallengeId: { $in: flashIds },
                            },
                        },
                        {
                            $project: {
                                flashChallengeId: 1,
                                createdAt: 1,
                                media: 1,
                                createdBy: 1,
                                votes: { $size: "$votes" },
                            },
                        },
                        {
                            $sort: { flashChallengeId: -1, votes: -1, createdAt: 1 },
                        },
                        {
                            $group: {
                                _id: "$flashChallengeId",
                                winners: {
                                    $push: {
                                        createdBy: "$createdBy",
                                        createdAt: "$createdAt",
                                        media: "$media",
                                        votes: "$votes",
                                    },
                                },
                            },
                        },
                        {
                            $match: {
                                $expr: {
                                    $gt: [{ $size: "$winners" }, 0],
                                },
                            },
                        },
                        {
                            $project: {
                                winners: { $slice: ["$winners", 3] },
                            },
                        },
                        {
                            $unwind: "$winners",
                        },
                        {
                            $match: {
                                "winners.votes": { $gt: 0 },
                            },
                        },
                        {
                            $sort: {
                                "winners.createdAt": -1,
                            },
                        },
                    ],
                });
                const userIds = wins.map((a) => a.winners.createdBy);
                const winners = yield (0, users_1.getUsersByIds)(userIds, apiData.userId);
                let lastChallenge;
                if (!apiData.pageNumber)
                    lastChallenge = yield (0, database_1.find)({
                        table: "SocialFeeds",
                        qty: "findOne",
                        query: {
                            type: "flashChallenge",
                            flashChallengeId: { $ne: ActiveFlash === null || ActiveFlash === void 0 ? void 0 : ActiveFlash._id },
                            $expr: {
                                $gt: [{ $size: "$votes" }, 0],
                            },
                        },
                        sort: { createdAt: 1 },
                        project: { flashChallengeId: 1, _id: 0 },
                    });
                let wins0 = [];
                if (wins.length)
                    for (let index = 0; index < wins.length; index++) {
                        const element = wins[index];
                        wins0.push({
                            flashChallenge: pastFlashChallenges.find((a) => a._id.toString() === element._id.toString()),
                            winner: winners.find((a) => a._id.toString() === element.winners.createdBy.toString()),
                            photoUrl: element.winners.media[0].image,
                        });
                        if (index === wins.length - 1)
                            (0, helper_1.Api)(res, {
                                lastFlashId: lastChallenge === null || lastChallenge === void 0 ? void 0 : lastChallenge.flashChallengeId,
                                wins: wins0,
                            });
                    }
                else
                    (0, helper_1.Api)(res, {
                        lastFlashId: null,
                        wins: [],
                    });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("getWinners", e);
            }
            break;
        case "getStats":
            try {
                let lastSubmission0;
                let previousSubmissions = yield (0, database_1.find)({
                    table: "SocialFeeds",
                    qty: "find",
                    query: {
                        type: "flashChallenge",
                        createdBy: apiData.userId,
                    },
                    sort: {
                        createdAt: -1,
                    },
                    skip: 10 * apiData.pageNumber,
                    limit: 10,
                    project: {
                        flashChallengeId: 1,
                        "media.image": 1,
                    },
                });
                const flashChallengeIds = previousSubmissions.map((a) => a.flashChallengeId);
                const flashChallenges = yield (0, database_1.find)({
                    table: "FlashChallenges",
                    qty: "find",
                    query: {
                        _id: { $in: flashChallengeIds },
                    },
                    project: {
                        topic: 1,
                        createdAt: 1,
                    },
                });
                if (!apiData.pageNumber)
                    lastSubmission0 = yield (0, database_1.find)({
                        table: "SocialFeeds",
                        qty: "findOne",
                        query: {
                            type: "flashChallenge",
                            createdBy: apiData.userId,
                        },
                        sort: {
                            createdAt: -1,
                        },
                        project: {
                            _id: 1,
                        },
                    });
                previousSubmissions = previousSubmissions.map((a) => ({
                    media: a.media,
                    flashChallenge: flashChallenges.find((b) => b._id.toString() === a.flashChallengeId.toString()),
                }));
                (0, helper_1.Api)(res, {
                    lastSubmissionId: lastSubmission0 === null || lastSubmission0 === void 0 ? void 0 : lastSubmission0._id,
                    Stats: (yield (0, database_1.find)({
                        table: "Users",
                        qty: "findOne",
                        query: { _id: apiData.userId },
                        project: { flashStats: 1 },
                    })).flashStats,
                    submissions: previousSubmissions.filter((a) => Boolean(a.flashChallenge)),
                });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("getStats", e);
            }
            break;
        default:
            break;
    }
});
