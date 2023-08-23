import { aggregate, find, remove, save, update } from "../database";
import Mongoose from "mongoose";
import {
  Api,
  deleteImages,
  deleteS3BucketImage,
  duplicateImage,
  getActiveFlashChallenge,
  saveImage,
  saveImages,
  savePortfolioImages,
  saveSocialImage,
  SendNotificationTemp,
  voteForSubmission,
} from "../helper";
import { updateUserDevice } from "./users";
import Https from "https";
import fs from "fs";
import { sendTosentry } from "../sentry";
const table = "SocialFeeds";

export default async ({ res, apiData }: any) => {
  const activeChallenge: any = await find({
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
          updateUserDevice(apiData.device, apiData.userId, "push");
        //get userIds fow followings
        const followings: any = await find({
          table: "Users",
          qty: "find",
          query: {
            followers: new Mongoose.Types.ObjectId(apiData.userId),
          },
          project: {
            _id: 1,
            image: 1,
            fullName: 1,
            userName: 1,
          },
        });
        const userIds = followings.map((a: any) => a._id);

        let portfolios: any = await find({
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
        let lastSocialFeedItem: any;

        if (apiData.pageNumber === 0)
          lastSocialFeedItem = await find({
            table,
            qty: "findOne",
            query: { createdBy: { $in: userIds } },
            sort: {
              createdAt: 1,
            },
          });
        portfolios = await portfolios
          .map((portfolio: any) => ({
            _id: portfolio._id,
            postedBy: followings.find(
              (a: any) => a._id.toString() === portfolio.createdBy.toString()
            ),
            liked: portfolio.likes
              .map((a: any) => a.likedBy?.toString())
              .includes(apiData.userId),
            likes: portfolio.likes.length,
            type: portfolio.type,
            flashChallengeId: portfolio.flashChallengeId,
            createdAt: portfolio.createdAt,
            coverImageUrl: portfolio.media[0]?.image,
          }))
          .filter((a: any) => Boolean(a.coverImageUrl));
        Api(res, {
          socialFeeds: portfolios,
          lastSocialFeedId: lastSocialFeedItem?._id,
          flashChallenge: await getActiveFlashChallenge(
            apiData.userId,
            apiData.currentChallenge
          ),
        });
      } catch (e) {
        sendTosentry("getSocialFeeds", e);
      }
      break;
    case "likeDislike":
      try {
        let portfolio: any = await find({
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
          voteForSubmission({
            _id: apiData.submissionId,
            voted: apiData.value,
            userId: apiData.userId,
          });
        update({
          table,
          qty: "updateOne",
          query: { _id: apiData.feedId },
          update: {
            [apiData.value ? "$push" : "$pull"]: {
              likes: {
                likedBy: new Mongoose.Types.ObjectId(apiData.userId),
              },
            },
          },
        })
          .then(async (resp) => {
            if (
              apiData.value &&
              portfolio.createdBy.toString() !== apiData.userId
            ) {
              await SendNotificationTemp({
                sender: apiData.userId,
                recipient: portfolio.createdBy,
                socialFeedId: apiData.feedId,
                template: "NEW_LIKE",
              });
            }
          })
          .catch((e) => {
            sendTosentry("likeDislike", e);
          });
        Api(res, { status: "success" });
      } catch (e) {
        sendTosentry("likeDislike", e);
      }
      break;
    case "fetchMore":
      try {
        const userPortfolios = await find({
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
        Api(res, userPortfolios);
      } catch (e) {
        sendTosentry("fetchMore", e);
      }
      break;
    case "getLikes":
      try {
        let lastLke: any;
        if (apiData.pageNumber === 0)
          lastLke = await find({
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
        aggregate({
          table,
          array: [
            {
              $match: {
                _id: new Mongoose.Types.ObjectId(apiData.portfolioId),
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
          .then((portfolios: any) => {
            const LikeIds = portfolios.map((a: any) => a.likes.likedBy);
            find({
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
                    new Mongoose.Types.ObjectId(apiData.userId),
                    "$followers",
                  ],
                },
              },
            }).then((likers: any) => {
              Api(res, { likers, lastLikeId: lastLke?.firstLike?.likedBy });
            });
          })
          .catch((e) => {
            sendTosentry("getLikes", e);
          });
      } catch (e) {
        sendTosentry("getLikes", e);
      }
      break;
    case "savePortfolio":
      const query = {
        name: { $regex: new RegExp(`^${apiData.name}$`, "i") },
        createdBy: new Mongoose.Types.ObjectId(apiData.userId),
      };
      find({
        table,
        qty: "findOne",
        query,
        project: {
          name: 1,
        },
      })
        .then(async (portfolio: any) => {
          if (!portfolio) {
            if (apiData.newUploads.length || apiData.socialImages.length) {
              let _id = apiData._id;
              let media: any = apiData.newUploads || [];
              let socialImages: any = [];

              if (apiData.socialImages.length)
                socialImages = await saveImages(apiData.socialImages, _id);
              // console.log({ socialImages });

              save({
                table,
                data: {
                  ...apiData,
                  createdBy: new Mongoose.Types.ObjectId(apiData.userId),
                  media: media.concat(socialImages),
                },
              }).then((portfolio) => {
                Api(res, { message: "Portfolio saved successfully" });
              });
            } else {
              Api(res, {
                error: "You need atleast 1 image for your portfolio.",
              });
            }
          } else
            Api(res, {
              field: "name",
              error: "The portfolio name exists.",
            });
        })
        .catch((e) => {
          sendTosentry("savePortfolio", e);
        });
      break;
    case "deletePortfolio":
      remove({
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
        .then((portfolio: any) => {
          if (portfolio) {
            let images: string[] = portfolio.media.map((a: any) => a.image);
            images.forEach((image) => {
              deleteS3BucketImage(image);
            });
          }
          Api(res, portfolio);
        })
        .catch((e) => {
          sendTosentry("deletePortfolio", e);
        });
      break;
    case "checkIfNameExists":
      const Qry = apiData.portfolioId
        ? { _id: { $ne: apiData.portfolioId } }
        : {};
      find({
        table,
        qty: "findOne",
        query: {
          name: apiData.name.trim(),
          createdBy: apiData.userId,
          ...Qry,
        },
        project: {
          name: 1,
          _id: 0,
        },
      })
        .then((portfolio: any) => {
          if (portfolio)
            Api(res, {
              field: "name",
              error: "The portfolio name exists.",
            });
          else {
            console.log("Portfolio does not exist")
            Api(res, {
              success: true,
            });
          }
        })
        .catch((e) => {
          sendTosentry("checkName", e);
        });
      break;
    case 'organizePortfolio':
      update({
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
      }).then((portfolio: any) => {
        Api(res, {
          message: "Portfolio updated successfully",
          portfolio,
        });
      })
      break;
    case "updatePortfolio":
      console.log(apiData)
      try {
        let updateObj: any = {},
          media: any = apiData.newUploads || [],
          pushMedia: any = {};
        let _id = new Mongoose.Types.ObjectId().toString();
        let socialImages: any = [];
        if (apiData.socialImages?.length)
          socialImages = await saveImages(apiData.socialImages, _id);

        pushMedia = { media: { $each: media.concat(socialImages) } };

        if (apiData.deleteImages?.length) {
          await deleteImages(apiData.deleteImages.map((a: any) => a.image));
        }
        updateObj = {
          $push: {
            ...pushMedia,
          },
          $set: apiData,
        };
        update({
          table,
          qty: "findOneAndUpdate",
          query: { _id: apiData.portfolioId, createdBy: apiData.userId },
          update: updateObj,
          options: {
            returnOriginal: false,
          },
        }).then((portfolio: any) => {
          let newMedia = portfolio.media.filter(
            (q: any) =>
              !apiData.deleteImages
                .map((r: any) => r._id)
                .includes(q._id.toString())
          );
          update({
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
            .then((portfolio: any) => {
              if (
                apiData.coverMediaId ||
                !portfolio.media.filter((a: any) => a.isCoverPhoto).length
              ) {
                const mediaId = apiData.coverMediaId || portfolio.media[0]._id;
                const ifNoCoverImg = () => {
                  update({
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
                  }).then((portfolio: any) => {
                    Api(res, {
                      message: "Portfolio updated successfully",
                      portfolio,
                    });
                  });
                };
                update({
                  table,
                  qty: "updateOne",
                  query: {
                    _id: apiData.portfolioId,
                    createdBy: apiData.userId,
                  },
                  update: { $set: { "media.$[].isCoverPhoto": false } },
                });
                if (apiData.coverMediaId)
                  update({
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
                  }).then((portfolio: any) => {
                    if (
                      !portfolio.media.filter((a: any) => a.isCoverPhoto).length
                    )
                      ifNoCoverImg();
                    else
                      Api(res, {
                        message: "Portfolio updated successfully",
                        portfolio,
                      });
                  });
                else ifNoCoverImg();
              } else
                Api(res, {
                  message: "Portfolio updated successfully",
                  portfolio,
                });
            })
            .catch((e) => {
              sendTosentry("updatePortfolio", e);
            });
        });
      } catch (e) {
        sendTosentry("updatePortfolio", e);
      }
      break;
    case "getPortfolio":
      find({
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
        .then((portfolio) => Api(res, portfolio))
        .catch((e) => {
          sendTosentry("getPortfolio", e);
        });
      break;
    case "arrangePortfolios":
      for (let index = 0; index < apiData.portfolios.length; index++) {
        const portfolio = apiData.portfolios[index];
        update({
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
              Api(res, { message: "Profile updated successfully." });
          })
          .catch((e) => {
            sendTosentry("arrangePortfolios", e);
          });
      }
      break;
    case "getPortFolios":
      try {
        let lastPortfolio: any;
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
          lastPortfolio = await find({
            table: "SocialFeeds",
            qty: "findOne",
            query: query0,
            project: { _id: 1 },
            sort: { createdAt: 1, index: 1, updatedAt: 1 },
          });
        const portfolios0 = await find({
          table: "SocialFeeds",
          qty: "find",
          query: query0,
          sort: { createdAt: -1, updatedAt: -1, index: -1 },
          limit: 12,
          skip: apiData.pageNumber * 12,
        });
        Api(res, {
          lastPortfolioId: lastPortfolio?._id,
          portfolios: portfolios0,
        });
      } catch (e) {
        sendTosentry("getPortfolios", e);
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
          Https.get(apiData.imageUrl, async (response) => {
            let imgUrl = await saveImage({
              _id: apiData.userId + "/" + portfolioId,
              folder: "portfolio",
              addToPortfolio: response,
            });
            update({
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
              Api(res, {
                message: `Profile has been updated`,
              });
          });
        }
      } catch (e) {
        sendTosentry("addPortImage", e);
      }
      break;
    case "addUploadImg":
      try {
        for (let index = 0; index < apiData.portfolioIds.length; index++) {
          const portfolioId = apiData.portfolioIds[index];
          let imageUrl = await saveImage({
            _id: portfolioId,
            ...apiData.image,
            folder: "portfolio",
          });
          update({
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
            Api(res, {
              message: `Profile has been updated`,
            });
        }
      } catch (e) {
        sendTosentry("addUploadImg", e);
      }
      break;
    case "createPOI":
      const saveFn = (imgUrl: string) =>
        save({
          table,
          data: {
            ...apiData,
            createdBy: new Mongoose.Types.ObjectId(apiData.userId),
            media: [
              {
                image: imgUrl,
              },
            ],
            type: "POI",
          },
        })
          .then((POI) => {
            Api(res, {
              message: "You have created a Point of Interest.",
              POI,
            });
          })
          .catch((e) => {
            sendTosentry("createPOI", e);
          });
      try {
        if (apiData.participatedBy === "Portfolio")
          Https.get(apiData.image, async (response) => {
            let portfolioImgUrl: any = await saveImage({
              _id: apiData.userId,
              folder: "pointOfInterest",
              addToPortfolio: response,
            });
            saveFn(portfolioImgUrl);
          });
        else
          saveImage({
            _id: apiData.userId,
            ...apiData.image,
            folder: "pointOfInterest",
          }).then((imageUrl) => saveFn(imageUrl));
      } catch (e) {
        sendTosentry("createPOI", e);
      }
      break;
    case "getPOIs":
      //make sure to create a 2dsphere index on the "location.coordinates" field in production as well
      // db.socialfeeds.createIndex({"location.coordinates": "2dsphere"})
      try {
        let qry0: any = {};
        if (apiData.type === "public") qry0 = { isPrivate: false };
        else if (apiData.type === "private")
          qry0 = {
            isPrivate: true,
            createdBy: new Mongoose.Types.ObjectId(apiData.userId),
          };
        else
          qry0 = {
            $or: [
              { isPrivate: false },
              {
                isPrivate: true,
                createdBy: new Mongoose.Types.ObjectId(apiData.userId),
              },
            ],
          };

        let POIs: any = await aggregate({
          table,
          array: [
            {
              $geoNear: {
                near: {
                  coordinates: apiData.coordinates,
                },
                key: "location.coordinates",
                distanceField: "dist.calculated",
                maxDistance: apiData.distance || 10 ** 6, // in meters
                includeLocs: "dist.location",
                spherical: true,
                query: {
                  ...qry0,
                  _id: {
                    $nin: apiData.except.map(
                      (q: any) => new Mongoose.Types.ObjectId(q)
                    ),
                  },
                  associatePOIId: {
                    $exists: false,
                  },
                  "media.reported": false,
                },
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

        let createdByIds = POIs.map((a: any) => a.createdBy);
        const poiUsers: any = await find({
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
        POIs = POIs.map((poi: any) => ({
          _id: poi._id,
          createdAt: poi.createdAt,
          location: poi.location,
          createdBy: poi.createdBy,
          media: poi.media.concat(
            poi.associatePOIIds.map((q: any) => q.media).flat()
          ),
          isPrivate: poi.isPrivate,
          approved: poi.creatapprovededAt,
          name: poi.name,
          poiCreater: poiUsers.find(
            (user: any) => user._id.toString() === poi.createdBy.toString()
          ),
        }));
        Api(res, POIs);
      } catch (e) {
        sendTosentry("getPOIs", e);
      }
      break;
    case "getAssociatePOIs":
      try {
        const qry = {
          $or: [
            { _id: new Mongoose.Types.ObjectId(apiData.associatePOIId) },
            {
              associatePOIId: new Mongoose.Types.ObjectId(
                apiData.associatePOIId
              ),
            },
          ],
        };
        let associatePOIs: any = await find({
          table,
          qty: "find",
          query: qry,
          sort: { _id: -1 },
          limit: 10,
          skip: apiData.pageNumber,
        });

        let createdbyIds: any = associatePOIs.map((a: any) => a.createdBy);
        let associateUsers: any = await find({
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

        let lastPOI: any;

        if (apiData.pageNumber === 0)
          lastPOI = await find({
            table,
            qty: "findOne",
            query: qry,
            project: {
              _id: 1,
            },
            sort: { createdAt: 1 },
          });

        let associatePois = associatePOIs.map((poi: any) => ({
          _id: poi._id,
          createdAt: poi.createdAt,
          location: poi.location,
          createdBy: poi.createdBy,
          media: poi.media,
          associatePOIId: poi.associatePOIId,
          isPrivate: poi.isPrivate,
          approved: poi.creatapprovededAt,
          name: poi.name,
          poiCreater: associateUsers.find(
            (user: any) => user._id.toString() === poi.createdBy.toString()
          ),
        }));
        Api(res, { associatePois, lastPOId: lastPOI?._id });
      } catch (e) {
        sendTosentry("associatePOIs", e);
      }
      break;
    case "reportInappropriate":
      update({
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
              createdBy: new Mongoose.Types.ObjectId(apiData.userId),
              messages: apiData.messages,
            },
          },
        },
      })
        .then((resp) => {
          // console.log(resp);
          Api(res, { message: "Thank you for reporting." });
        })
        .catch((e) => {
          sendTosentry("report", e);
        });
      //use sockets to hide the post from all devices
      break;
    case 'getId':
      Api(res, new Mongoose.Types.ObjectId())
      break;
    default:
      break;
  }
};
