import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";
<<<<<<< HEAD
import UsersModel from "../database/models/users";
=======
import SocialFeedsModel from "../database/models/socialFeeds";
import UsersModel from "../database/models/users";
import CategoriesModel from "../database/models/categories";
import RecentSearchModel from "../database/models/recentSearch";
import FlashChallengesModel from "../database/models/flashChallenges";
import Portfolios from "../modules/Portfolios";
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
console.log("Connecting to PostgreSQL");
client
  .connect()
  .then(() => {
    console.log("Connected to postgreSQL DB ");
    console.log("Fetching users from postgreSQL");
    client.query("SELECT * FROM accounts_user", (err, res) => {
      //the query fetches user data from account_users table in postgreSQL DB
      if (err) console.log(err);
      else {
        let users = res.rows
          .map((row) => {
            let userImage = row.profile_picture || row.profile_picture_url;
            return row.email
              ? {
                id: row.id,
                password: row.password,
                lastLogin: row.last_login,
                isSuperuser: row.is_superuser,
                fullName: row.first_name + " " + row.last_name,
                userName: row.username,
                isStaff: row.is_staff,
                isActive: Boolean(row.is_active),
                dateJoined: row.date_joined,
                status: "active",
                signUpFrom: row.sign_up_from,
                email: row.email,
                forgotPasswordToken: row.forgot_password_token,
                fbId: row.fb_id,
                isFbSyncExpired: row.is_fb_sync_expired,
                fbName: row.fb_name,
                instaId: row.insta_id,
                bio: row.bio,
                hidden: [
                  row.bio_hidden && "bio",
                  row.company_hidden && "company",
                  row.dob_hidden && "dob",
                  row.email && "email",
                  row.phone_number_hidden && "mobile",
                  row.username && "userName",
                  row.camera_hidden && "camera",
                ].filter((a) => Boolean(a)),
                isInstaSyncExpired: row.is_insta_sync_expired,
                instaName: row.insta_name,
                image: !userImage
                  ? null
                  : userImage.includes("http")
                    ? userImage
                    : "https://anthology-prod-backend.s3.amazonaws.com/" +
                    userImage,
              }
              : null;
          })
          .filter((user) => Boolean(user));
        UsersModel.insertMany(users)
          .then((resp) => {
            console.log("Finished fetching users and inserting to mongoDB");
            getPortflios();
            getFollowers();
            getRecentSearch();
            getCategories();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  })
  .catch((err) => console.error("connection error", err.stack));
// https://us-east-1.console.aws.amazon.com/ec2/v2/home?region=us-east-1#SecurityGroups:search=sg-0379c5194a0ae7fab

const getPortflios = () => {
  console.log("Fetching portfolios from postgreSQL");
  client.query("SELECT * FROM portfolio_portfolio", (err, resp) => {
    if (resp.rows) {
      resp.rows.forEach(async (row, i) => {
        //this code gets a user whose id is equal to postrgesql user_id for the row and returns an object with the mongodb id
        const user: any = await UsersModel.findOne(
          { id: row.user_id },
          { _id: 1 }
        );

        let portfolio =
          row.name && user
            ? {
              id: row.id,
              createdAt: row.created_at,
              name: row.name,
              tags: row.tags,
              location: {
                locName: row.location,
                coordinates:
                  row.latitude != null && row.longitude != null
                    ? row.latitude > 90 || row.latitude < -90
                      ? [row.latitude, row.longitude]
                      : [row.longitude, row.latitude]
                    : [0, 0],
              },
              createdBy: user._id,
              isDelete: row.is_delete,
              type: "portfolio",
            }
            : null;
        if (portfolio) {
          const newPortfolio = new SocialFeedsModel(portfolio);

          newPortfolio.save().then(() => {
            if (i === resp.rows.length - 1) {
              console.log("Portfolios fetched and inserted to mongoDB");
              getPortfolioMedia();
            }
          });
        }
      });
    }
  });
};
const getPortflioLikes = () => {
  console.log("Fetching portfolio likes from postgreSQL");
  client.query(
    `SELECT portfolio_id, 
    jsonb_agg(jsonb_build_object(
      'likedBy', created_by_id,
      'createdAt', created_at
    ))as likers 
    FROM like_social_feed_item GROUP BY portfolio_id`,
    (err, res) => {
      if (err) console.log(err);
      else {
        res.rows.map(async (row, i) => {
          if (i === 0) {
            let users: any = await UsersModel.find(
              { id: { $in: row.likers.map((a: any) => a.likedBy) } },
              { _id: 1, id: 1 }
            );
            let portfolios = await SocialFeedsModel.aggregate([
              {
                $project: {
                  media: 1,
                  id: 1,
                },
              },
              {
                $match: {
                  id: row.portfolio_id,
                },
              },
              {
                $unwind: "$media",
              },
              {
                $limit: 1,
              },
              {
                $project: {
                  "media._id": 1,
                  _id: 0,
                },
              },
            ]);
            const firstMediaId = portfolios[0]?.media?._id;
            users = users.map((x: any) => {
              return {
                likedBy: x._id,
                likedImages: [firstMediaId],
                createdAt: new Date(
                  row.likers.find((a: any) => a.likedBy === x.id)?.createdAt
                ),
              };
            });
            await SocialFeedsModel.updateOne(
              {
                id: row.portfolio_id,
              },
              {
                $set: {
                  likes: users,
                },
              }
            );
          }
        });
      }
    }
  );
  console.log("Portfolio likes fetched and updated to mongoDB");
  fetchPOIs();
};

const getPortfolioMedia = () => {
  console.log("Fetching portfolio media from postgreSQL");
  client.query(
    `SELECT portfolio_id, 
    jsonb_agg(jsonb_build_object(
      'image', image_url, 
      'priority', priority, 
      'isDeleted', is_delete, 
      'socialMediaType', social_media_type, 
      'socialMediaUrl', social_media_url, 
      'isCoverPhoto', is_cover_image, 
      'thumbnailUrl', thumbnail_url)) as items
    FROM portfolio_portfoliomedia
    GROUP BY portfolio_id;`,
    (err, res) => {
      if (err) console.log(err);
      else
        res.rows.forEach(async (row, i) => {
          0;
          // if (i === 0) console.log(row.items[0].image);
          let res = await SocialFeedsModel.updateOne(
            { id: row.portfolio_id },
            {
              $set: { media: row.items, coverImageUrl: row.items[0].image },
            }
          );
          // console.log(res);
        });
    }
  );
  console.log("Portfolio media fetched and updated to mongoDB");
  getPortflioLikes();

};
const getCategories = () => {
  //Fetching categories from postgresql db
  console.log("Fetching categories from postgreSQL");
  client.query("SELECT * FROM commons_category", (err, res) => {
    if (err) {
      console.log(err);
    } else {
      // console.log(res.rows);
    }
    res.rows.forEach(async (row, i) => {
      //the code gets the category creator whose id is equal to ...
      //postgresql created_by_id for the row and returns an object with the mongodb id.
      const catCreator: any = await UsersModel.findOne(
        { id: row.created_by_id },
        { _id: 1 }
      );
      let category =
        row.text && catCreator
          ? {
            id: row.id,
            text: row.text,
            status: row.status ? parseInt(row.status) : 0,
            createdAt: row.created_at,
            createdBy: catCreator._id,
            slug: row.slug,
            image: row.image_url,
          }
          : null;
      if (category) {
        const newCategory = new CategoriesModel(category);
        newCategory.save();
      }
    });
    console.log("Categories fetched and updated to mongoDB");
  });
};
const getFollowers = () => {
  console.log("Fetching followers from postgreSQL");

  client.query(
    "SELECT follow_to_id as user_id, array_agg(followed_by_id) as followers FROM accounts_userfollowing GROUP BY follow_to_id",
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        let groups = res.rows;
        groups.forEach(async (group) => {
          let followers = await (
            await UsersModel.find({ id: { $in: group.followers } }, { _id: 1 })
          ).map((a) => a._id);
          let resp = await UsersModel.updateOne(
            { id: group.user_id },
            { $set: { followers: followers } }
          );
        });
      }
    }
  );
  console.log("Followers fetched and updated to mongoDB");
};
const getRecentSearch = () => {
  console.log("Fetching user recent searches from postgreSQL");
  client.query("SELECT * FROM accounts_userrecentsearch", (err, res) => {
    if (err) {
      console.log(err);
    }
    res.rows.forEach(async (row, i) => {
      const user: any = await UsersModel.findOne(
        { id: row.user_id },
        { _id: 1 }
      );
      const searchedUser: any = await UsersModel.findOne(
        { id: row.user_searched_id_id },
        { _id: 1 }
      );
      let recentSearch =
        user && searchedUser
          ? {
            id: row.id,
            text: row.text,
            updatedAt: row.updated_at,
            createdAt: row.created_at,
            userId: user._id,
            isDelete: row.is_delete,
            userSearchedId: searchedUser._id,
          }
          : null;
      if (recentSearch) {
        const newRecentSearch = new RecentSearchModel(recentSearch);
        newRecentSearch.save();
      }
    });
  });
  console.log("Recent searches fetched and updated to mongoDB");
};
const fetchPOIs = () => {
  console.log("Fetching point of interests from PostgreSQl");
  client.query("SELECT * FROM poi_and_hotspot", (err, res) => {
    if (err) {
      console.log(err);
    } else {
      res.rows.forEach(async (row, i) => {
        const user: any = await UsersModel.findOne(
          { id: row.created_by_id },
          { _id: 1 }
        );

        let poi =
          row.name && user
            ? {
              id: row.id,
              createdAt: row.created_at,
              name: row.name,
              location: {
                locName: row.location_name,
                coordinates:
                  row.latitude === null && row.longitude === null
                    ?
                    [0, 0] :
                    row.latitude > 90 || row.latitude < -90
                      ? [row.latitude, row.longitude]
                      : [row.longitude, row.latitude]
              },
              createdBy: user._id,
              isDelete: row.is_delete,
              isPrivate: row.is_private,
              isHotspot: row.is_hotspot,
              type: "POI",
              approved: true

            }
            : null;
        if (poi) {
          const newPOI = new SocialFeedsModel(poi);

          newPOI.save().then(() => {
            if (i === res.rows.length - 1) {
              console.log("POIs fetched and inserted to mongoDB");
              getPOIMedia();
            }
          });
        }
      });
    }
  });
};
const getPOIMedia = () => {
  console.log("Fetching POI media from postgreSQL");
  client.query(
    `SELECT point_and_hotspot_id, 
    jsonb_agg(jsonb_build_object(
      'image', image_url, 
      'poiMediaId', id,
      'isDeleted', is_delete,
      'tags', tags)) as items
    FROM poi_and_hotspot_media
    GROUP BY point_and_hotspot_id;`,
    (err, res) => {
      if (err) console.log(err);
      else
        res.rows.forEach(async (row, i) => {
          0;
          let res = await SocialFeedsModel.updateOne(
            { id: row.point_and_hotspot_id, type: "POI" },
            {
              $set: { media: row.items },
            }
          );
        });
    }
  );
  console.log("POI media inserted in mongoDB");
  fetchPOILikes();
  getFlashChallenges();

};
const fetchPOILikes = () => {
  console.log("Fetching POI likes from postgreSQL")
  client.query(
    `SELECT poi_media_id, 
    jsonb_agg(json_build_object(
      'likedBy', created_by_id,
      'createdAt', created_at
    )) as likers 
    FROM like_poi_and_hotspot_media GROUP BY poi_media_id`,
    (err, res) => {
      if (err) console.log(err);
      else {
        res.rows.map(async (row, i) => {
          let users: any = await UsersModel.find(
            { id: { $in: row.likers.map((a: any) => a.likedBy) } },
            { _id: 1, id: 1 }
          );
          let portfolios = await SocialFeedsModel.aggregate([
            {
              $project: {
                media: 1,
              }
            },
            {
              $match: { "media.poiMediaId": row.poi_media_id }
            },
            {
              $unwind: "$media"
            },
            {
              $limit: 1
            },
            {
              $project: {
                "media._id": 1,
                _id: 0
              }
            }
          ]);
          const firstMediaId = portfolios[0]?.media?._id;
          const likes: any = users.map((y: any) => {
            const createdAt: any = new Date(
              row.likers.find((liker: any) => liker.likedBy === y.id)?.createdAt
            );
            return {
              likedBy: y._id,
              likedImages: [firstMediaId],
              createdAt: createdAt
            };
          });
          const updatedLikes = await SocialFeedsModel.updateOne(
            {
              'media.poiMediaId': row.poi_media_id
            },
            {
              $set: {
                likes: likes
              }
            }
          );
          if (i === res.rows.length - 1)
            console.log("POI media likes fetched and updated to mongoDB")
        })
      }
    }
  );
};
const getFlashChallenges = () => {
  console.log("Fetching flashChallenges from postgreSQL");
  client.query(`SELECT * FROM daily_challenge`, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      res.rows.forEach(async (row, i) => {
        let flashChallenge = {
          flashId: row.id,
          topic: row.topic,
          sponsoredBy: null,
          startDate: row.start_date,
          endDate: row.end_date,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          isActive: row.is_active,
          activated: false,
          skipped: [],
          joined: [],
        };
        if (flashChallenge) {
          const fetchedChallenges = new FlashChallengesModel(flashChallenge);
          fetchedChallenges.save().then(() => {
            if (i === res.rows.length - 1) {
              console.log("Flash challenges fecthed and inserted to mongoDB");
            }
          });
        }
      });
    }
  });
  getFlashChallengeMedia();
};
const getFlashChallengeMedia = () => {
  console.log("Fetching flashChallenge media from postgreSQL");
  client.query(`SELECT * FROM daily_challenge_submission`, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      res.rows.forEach(async (row, i) => {
        const User: any = await UsersModel.findOne(
          { id: row.created_by },
          { _id: 1 }
        );
        const flashChallenge: any = await FlashChallengesModel.findOne(
          { flashId: row.daily_challenge_id },
          { _id: 1 }
        );
        let flashMedia =
          row.url && User
            ? {
              media: [{
                image: row.url,
                submissionId: row.id
              }],
              challengeId: row.daily_challenge_id,
              createdBy: User._id,
              flashChallengeId: flashChallenge._id,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              type: "flashChallenge",
            }
            : null;
        // console.log(flashMedia);
        if (flashMedia) {
          const flashPortfolios = new SocialFeedsModel(flashMedia);
          flashPortfolios.save().then(() => {
            if (i === res.rows.length - 1) {
              console.log("Flash challenge media has been inserted to mongoDB");
              fetchFlashParticipants();
              getFlashChallengeLikes();

            }
          });
        }
      });
    }
  });
};
const fetchFlashParticipants = () => {
  console.log("Fetching flash challenge participants");
  client.query("SELECT * FROM daily_challenge_participants", (err, res) => {
    if (err) {
      console.log(err);
    } else {
      res.rows.forEach(async (row, i) => {

        if (row.decision = "skipped") {
          let skippedUser: any = await UsersModel.findOne(
            { id: row.user_id },
            { _id: 1 }
          )
          await FlashChallengesModel.updateOne(
            { id: row.challenge_id },
            {
              $push: { skipped: skippedUser._id }
            }
          );
        }
        if (row.decision = "joined") {
          let joinedUser: any = await UsersModel.findOne(
            { id: row.user_id },
            { _id: 1 }
          )
          let joined: any = await FlashChallengesModel.updateOne(
            { id: row.challenge_id },
            {
              $push: { joined: joinedUser._id }
            }
          )
        }
        if (i === res.rows.length - 1) {
          console.log("Flash challenge participants inserted to mongoDB")
        }
      });
    }
  });
};
const getFlashChallengeWinners = () => {
  console.log("Fetching flash challenge winners from PostgreSQL");
  client.query("SELECT * FROM daily_challenge_winner", (err, res) => {
    if (err) {
      console.log(err);
    } else {
      res.rows.forEach(async (row, i) => {
        const winner: any = await UsersModel.findOne(
          { id: row.user_id },
          { _id: 1 }
        )
        // console.log(winner)
        const wonChallenge: any = await FlashChallengesModel.findOne(
          { id: row.challenge_id },
          { topic: 1, _id: 1 }
        )
        // console.log(wonChallenge)
      })
    }
  });

};
const getFlashChallengeLikes = () => {
  console.log("Fetching flash challenge likes");
  client.query(
    `SELECT daily_challenge_id,
    jsonb_agg(jsonb_build_object(
      'likedBy', created_by,
      'createdAt', created_at
    )) as likers
   FROM daily_challenge_submission_like GROUP BY daily_challenge_id`,
    (err, res) => {
      if (err) console.log(err);
      else {
        res.rows.map(async (row, i) => {
          // if (i === 0) {
          let users: any = await UsersModel.find(
            { id: { $in: row.likers.map((a: any) => a.likedBy) } },
            { _id: 1, id: 1 }
          );
          let portfolios = await SocialFeedsModel.aggregate([
            {
              $project: {
                media: 1,
                challengeId: 1
              }
            },
            {
              $match: {
                challengeId: row.daily_challenge_id
              }
            },
            {
              $unwind: "$media"
            },
            {
              $limit: 1
            },
            {
              $project: {
                "media._id": 1,
                _id: 0
              }
            }
          ]);
          const firstMediaId = portfolios[0]?.media?._id;
          const likes: any = users.map((a: any) => {
            const createdAt: any = new Date(
              row.likers.find((liker: any) => liker.likedBy === a.id)?.createdAt
            );
            return {
              likedBy: a._id,
              likedImages: [firstMediaId],
              createdAt: createdAt
            };
          });
          const updatedlikes: any = await SocialFeedsModel.updateOne(
            {
              challengeId: row.daily_challenge_id
            },
            {
              $set: {
                likes: likes
              }
            }
          );
          // console.log(updatedlikes)
          if (i === res.rows.length - 1)
            console.log("Flash challenge submission likes fetched and updated to mongoDB")

          // }
        });
      }
    }
  );
};