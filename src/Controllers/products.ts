// @ts-ignore
import SneaksAPI from "sneaks-api";
import lodash from "lodash";
import ProductsToSell from "../database/models/products_to_sell";
import { Api } from "../helper";
import { aggregate, find, save, update } from "../database";
import Products from "../database/models/products";

const sneaks = new SneaksAPI();
export const peerProps = {
  firstName: 1,
  lastName: 1,
  userName: 1,
  image: 1
}
export default ({ res, data }: any) => {
  const { action } = data;
  
  const matchProdProps = {
    silhoutte: 1,
    retailPrice: 1,
    thumbnail: 1,
    description: 1,
    releaseDate: 1,
    brand: 1
  }
  switch (action) {
    case "getSneakersData":
      sneaks.getMostPopular(100, (err: any, products: any[]) => {
        if (err) console.log("err");
        else {
          const newArray = products.map((product) => {
            let {
              shoeName,
              brand,
              styleID,
              silhoutte,
              make,
              colorway,
              retailPrice,
              thumbnail,
              releaseDate,
              description,
              imageLinks,
              urlKey,
              resellLinks,
              goatProductId,
              resellPrices,
            } = product;
            return {
              a: "c",
              shoeName,
              styleID,
              brand,
              silhoutte,
              make,
              colorway,
              retailPrice,
              thumbnail,
              releaseDate,
              description,
              imageLinks,
              urlKey,
              resellLinks,
              goatProductId,
              resellPrices,
            };
          });
          Products.insertMany(newArray)
            .then((resp) => {
              console.log({ resp });
            })
            .catch((x) => {
              console.log(x);
            });
        }
      });
      break;
    case "getProductsOnSell":
      aggregate({
        table: "ProductsToSell",
        array: [
          {
            $sample: { size: 15 },
          },
          {
            $lookup:
            {
              from: "users",
              let: { postedById: "$postedBy" },
              pipeline: [
                {
                  $match:
                  {
                    $expr:
                    {
                      $eq: ["$_id", "$$postedById"]
                    }
                  }
                },
                { $project: peerProps }
              ],
              as: "postedBy"
            }
          },
          {
            $unwind: "$postedBy"
          },
          {
            $lookup: {
              from: "products",
              let: { matchProductId: "$productNumber" },
              pipeline: [
                {
                  $sort: {
                    createdAt: -1
                  }
                },
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: [{ $ifNull: ["$goatProductId", ""] }, "$$matchProductId"] },
                        { $ne: [{ $ifNull: ["$goatProductId", ""] }, ""] }
                      ]
                    }
                  }
                },
                {
                  $limit: 1
                },
                { $project: matchProdProps }
              ],
              as: "matchProduct"
            }
          },
          {
            $unwind: {
              path: "$matchProduct",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              matchProduct: { $ifNull: ["$matchProduct", {}] }
            }
          }
        ],
      }).then((products: any) => {
        Api(res, products);
      });

      break;
    case "addProduct":
      save({
        table: "ProductsToSell",
        data: {
          ...data.product,
          postedBy: data.userId
        }
      }).then((product: any) => {
        Api(res, { message: "Product has been added." });
      });
      break;
    case "getProductDetails":
      find({
        table: "Products",
        qty: "findOne",
        query: { goatProductId: data.goatProductId },
      })
        .then((product: any) => {
          Api(res, product)
        })
        .catch((e) => {
          console.log(e);
        });
      break;

    case "updateProduct":
      update({
        table: "ProductsToSell",
        qty: 'updateOne',
        query: {
          _id: data.productId
        },
        update: {
          $set: data

        }
      }).then((resp: any) => {
        Api(res, resp)
      })
      break;

    default:
      break;
  }
};