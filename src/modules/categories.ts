import Mongoose from "mongoose";
import { find, remove, save } from "../database";
import { Api, getSuperUser, saveImage } from "../helper";
import { sendTosentry } from "../sentry";

const table = "Categories";
export default async ({ apiData, res }: any) => {
  const { action } = apiData;
  const superUser: any = await getSuperUser();

  switch (action) {
    case "addCategory":
      find({
        table,
        qty: "findOne",
        query: {
          text: new RegExp(`^${apiData.text}$`, "i"),
          $or: [{ createdBy: superUser?._id }, { createdBy: apiData.userId }],
        },
        project: {
          text: 1,
          _id: 0,
        },
      })
        .then(async (category) => {
          if (category) {
            Api(res, {
              field: "text",
              error: "The category already exists.",
            });
          } else {
            let image: any;
            if (apiData.image)
              image = await saveImage({
                _id: apiData.userId,
                base64: apiData.image,
                folder: "category",
              });

            save({
              table,
              data: {
                ...apiData,
                createdBy: new Mongoose.Types.ObjectId(apiData.userId),
                image,
              },
            }).then((category) => {
              Api(res, category);
            });
          }
        })
        .catch((e) => {
          sendTosentry("addCategory", e);
        });
      break;
    case "getCategories":
      find({
        table,
        qty: "find",
        query: {
          createdBy: { $in: [apiData.userId, superUser._id] },
        },
        sort: {
          text: 1,
        },
      })
        .then((categories: any) => {
          Api(res, categories);
        })
        .catch((e) => {
          sendTosentry("getCategories", e);
        });
      break;
    case "deleteCategory":
      remove({
        table,
        qty: "findOneAndDelete",
        query: {
          $or: [
            {
              _id: apiData._id,
            },
            {
              text: apiData.text,
            },
          ],
        },
      })
        .then((delCat: any) => {
          Api(res, delCat);
        })
        .catch((e) => {
          sendTosentry("deleteCategory", e);
        });
    default:
      break;
  }
};
