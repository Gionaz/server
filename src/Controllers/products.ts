// @ts-ignore
import SneaksAPI from "sneaks-api";
import lodash from "lodash";
import Products from "../database/models/products";
import { find } from "../database";
import { Api } from "../helper";

const sneaks = new SneaksAPI();
export default ({ res, data }: any) => {
  const { action } = data;
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
              //   console.log({ resp });
            })
            .catch((x) => {
              console.log(x);
            });
        }
      });
      break;

    case "getProductDetails":
      console.log({ datax: data });
      find({
        table: "Products",
        qty: "findOne",
        query: { goatProductId: parseInt(data.goatProductId) },
      })
        .then((product: any) => {
          Api(res, product)
        })
        .catch((e) => {
          console.log(e);
        });
      break;

    default:
      break;
  }
};