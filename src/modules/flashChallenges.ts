import Mongoose from "mongoose";
import { aggregate, find, save, update } from "../database";
import { getUsersByIds } from "./users";
import {
  Api,
  saveImage,
  SendNotificationTemp,
  voteForSubmission,
} from "../helper";
import { SocialFeed } from "../types";
import momentTz from "moment-timezone";
import { sendTosentry } from "../sentry";

const table = "FlashChallenges";
export default async ({ res, apiData }: any) => {
  const { userId } = apiData;
  const activeChallenge: any = await find({
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
      console.log(momentTz().tz("America/New_York"))
      update({
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
        .then(async (fl: any) => {
          //logic to create a new flash challenge
          if (!apiData.end) {
            update({
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
                        date: new Date(
                          momentTz().tz("America/New_York").toString()
                        ),
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
              .then((resp: any) => {
                // console.log(resp);
                if (resp.modifiedCount) {
                  console.log("Flash challenge has been set.");
                  SendNotificationTemp({
                    sender: "admin",
                    recipient: "all",
                    template: apiData.end
                      ? "NEW_DAILY_CHALLENGE_ENDED"
                      : "NEW_DAILY_CHALLENGE",
                  });
                }
              })
              .catch((e) => {
                sendTosentry("createEndFlashChallenge", e);
              });
          } else {
            //get submissions with highest number of votes
            try {
              const wins: any = await aggregate({
                table: "SocialFeeds",
                array: [
                  {
                    $match: {
                      flashChallengeId: fl?._id,
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
              const winnerIds = wins.map((a: any) => a.createdBy);
              SendNotificationTemp({
                sender: "admin",
                recipient: winnerIds,
                template: "FLASH_CHALLENGE_WINNER",
              });
              update({
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
              update({
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
            } catch (e) {
              sendTosentry("createEndFlashChallenge", e);
            }
          }
        })
        .catch((e) => {
          sendTosentry("createEndFlashChallenge", e);
        });
      break;
    case "sendFlashReminder":
      //get joined and skipped
      try {
        let flashChallenge0: any = await find({
          table,
          qty: "findOne",
          query: { isActive: true },
          project: {
            joined: 1,
            skipped: 1,
          },
        });
        if (flashChallenge0) {
          const participated = flashChallenge0.joined.concat(
            flashChallenge0.skipped
          );
          const recipients: any = await find({
            table: "Users",
            qty: "find",
            query: {
              _id: { $nin: participated },
            },
            project: {
              _id: 1,
            },
          });
          SendNotificationTemp({
            sender: "admin",
            recipients: recipients,
            template: "NEW_DAILY_CHALLENGE_ABOUT_TO_ENDED",
          });
        }
      } catch (e) {
        sendTosentry("flashReminder", e);
      }
      break;
    case "flashSubmission":
      //start by finding the flash challenge that user wants to participate
      // then submit the photo/challenge
      try {
        const flashChallengeId = apiData.flashChallengeId;
        let flashChallenge = await find({
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
          const userSubmission: any = await find({
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
            let savedImageUrl: any = apiData.image;
            if (apiData.participatedBy !== "Portfolio")
              savedImageUrl = await saveImage({
                _id: flashChallengeId,
                ...apiData.image,
                folder: "flashChallenge",
              });
            // update the user to joined
            update({
              table,
              qty: "findOneAndUpdate",
              query: {
                _id: flashChallengeId,
              },
              update: {
                $addToSet: {
                  joined: new Mongoose.Types.ObjectId(apiData.userId),
                },
              },
            });
            const savedSubmission: any = await save({
              table: "SocialFeeds",
              data: {
                ...apiData,
                media: [
                  {
                    image: savedImageUrl,
                    isCoverPhoto: true,
                  },
                ],
                createdBy: new Mongoose.Types.ObjectId(apiData.userId),
                type: "flashChallenge",
              },
            });
            Api(res, {
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
              const startOfYesterday = new Date(
                yesterday.getFullYear(),
                yesterday.getMonth(),
                yesterday.getDate()
              );
              const endOfYesterday = new Date(
                yesterday.getFullYear(),
                yesterday.getMonth(),
                yesterday.getDate() + 1
              );

              const userPreviousDaySubmission: any = await find({
                table: "SocialFeeds",
                qty: "findOne",
                query: {
                  createdAt: { $gte: startOfYesterday, $lt: endOfYesterday },
                  createdBy: apiData.userId,
                  type: "flashChallenge",
                },
              });

              const User: any = await find({
                table: "Users",
                qty: "findOne",
                query: { _id: apiData.userId },
                project: {
                  flashStats: 1,
                  _id: 0,
                },
              });

              let streaks: number[] = User.flashStats.streaks;
              const userHadPreviousDaySubmission =
                userPreviousDaySubmission !== null;

              if (userHadPreviousDaySubmission) {
                streaks[streaks.length - 1] += 1;
              } else {
                streaks.push(1);
              }
              update({
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
          } else {
            Api(res, {
              error: "You have already submitted a flash challenge.",
            });
          }
        } else {
          Api(res, {
            error: "The flash challenge has expired!",
          });
        }
      } catch (e) {
        sendTosentry("flashSubmission", e);
      }
      break;
    case "userSkipped":
      try {
        const userSkipped = await update({
          table,
          qty: "findOneAndUpdate",
          query: {
            _id: apiData.flashChallengeId,
          },
          update: {
            $addToSet: { skipped: new Mongoose.Types.ObjectId(apiData.userId) },
          },
        });
        Api(res, {
          message: "You have skipped today's flash challenge.",
        });
      } catch (e) {
        sendTosentry("userSkipped", e);
      }
      break;
    case "getFlashSubmissions":
      try {
        let lastSubmission: any;
        //get the last submission Id
        if (apiData.pageNumber === 0)
          lastSubmission = await find({
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
        const submissions: any = await find({
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
              $in: [new Mongoose.Types.ObjectId(apiData.userId), "$votes"],
            },
          },
          limit: 15,
          skip: 15 * apiData.pageNumber,
        });
        Api(res, { submissions, lastSubmissionId: lastSubmission?._id });
      } catch (e) {
        sendTosentry("getFlashSubmission", e);
      }
      break;
    case "likeMultiFlashSubmissions":
      try {
        const likedSubmissions = {
          likedBy: new Mongoose.Types.ObjectId(apiData.userId),
        };
        update({
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
        Api(res, {
          message: "Multiple flash submissions liked",
        });
      } catch (e) {
        sendTosentry("likeFlashSubmissions", e);
      }
      break;
    case "voteForSubmission":
      try {
        if (activeChallenge) {
          voteForSubmission({
            _id: apiData.submissionId,
            voted: apiData.voted,
            userId: apiData.userId,
          });
          Api(res, {
            message: "Your vote has been cast successfully!",
          });
        } else {
          Api(res, {
            message: "The flash challenge has expired!",
          });
        }
      } catch (e) {
        sendTosentry("voteForSubmission", e);
      }
      break;
    case "getWinners":
      try {
        const pastFlashChallenges: any = await find({
          table: "FlashChallenges",
          qty: "find",
          query: { isActive: { $ne: true }, activated: true },
          skip: apiData.pageNumber * 10,
          limit: 10,
          project: { _id: 1, topic: 1 },
        });
        const ActiveFlash: any = await find({
          table: "FlashChallenges",
          qty: "findOne",
          query: { isActive: true },
          project: { _id: 1 },
        });
        const flashIds = pastFlashChallenges.map(
          (a: any) => new Mongoose.Types.ObjectId(a._id)
        );
        const wins: any = await aggregate({
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
        const userIds = wins.map((a: any) => a.winners.createdBy);
        const winners: any = await getUsersByIds(userIds, apiData.userId);

        let lastChallenge: any;
        if (!apiData.pageNumber)
          lastChallenge = await find({
            table: "SocialFeeds",
            qty: "findOne",
            query: {
              type: "flashChallenge",
              flashChallengeId: { $ne: ActiveFlash?._id },
              $expr: {
                $gt: [{ $size: "$votes" }, 0],
              },
            },
            sort: { createdAt: 1 },
            project: { flashChallengeId: 1, _id: 0 },
          });

        let wins0: any = [];
        if (wins.length)
          for (let index = 0; index < wins.length; index++) {
            const element = wins[index];
            wins0.push({
              flashChallenge: pastFlashChallenges.find(
                (a: any) => a._id.toString() === element._id.toString()
              ),
              winner: winners.find(
                (a: any) =>
                  a._id.toString() === element.winners.createdBy.toString()
              ),
              photoUrl: element.winners.media[0].image,
            });
            if (index === wins.length - 1)
              Api(res, {
                lastFlashId: lastChallenge?.flashChallengeId,
                wins: wins0,
              });
          }
        else
          Api(res, {
            lastFlashId: null,
            wins: [],
          });
      } catch (e) {
        sendTosentry("getWinners", e);
      }
      break;
    case "getStats":
      try {
        let lastSubmission0: any;
        let previousSubmissions: any = await find({
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
        const flashChallengeIds = previousSubmissions.map(
          (a: any) => a.flashChallengeId
        );
        const flashChallenges: any = await find({
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
          lastSubmission0 = await find({
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
        previousSubmissions = previousSubmissions.map((a: any) => ({
          media: a.media,
          flashChallenge: flashChallenges.find(
            (b: any) => b._id.toString() === a.flashChallengeId.toString()
          ),
        }));

        Api(res, {
          lastSubmissionId: lastSubmission0?._id,
          Stats: (
            (await find({
              table: "Users",
              qty: "findOne",
              query: { _id: apiData.userId },
              project: { flashStats: 1 },
            })) as any
          ).flashStats,
          submissions: previousSubmissions.filter((a: any) =>
            Boolean(a.flashChallenge)
          ),
        });
      } catch (e) {
        sendTosentry("getStats", e);
      }
      break;
    default:
      break;
  }
};
