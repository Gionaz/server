// @ts-ignore
import SneaksAPI from "sneaks-api";
import lodash from "lodash";
import Products from "../database/models/products";
import { Api } from "../helper";
import { aggregate, find, save, update } from "../database";
import products from "../database/models/products";

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
              console.log({ resp });
            })
            .catch((x) => {
              console.log(x);
            });
        }
      });
      break;
    case "getProductsToSellData":
      aggregate({
        table: "ProductsToSell",
        array: [
          {
            $sample: { size: 3 },
          },
        ],
      }).then((products: any) => {
        //console.log({data})
        Api(res, products);
      });
      break;

    case "addProducts":
      save({
        table: "products",
        data: data.products,
      }).then((products: any) => {
        Api(res, products);
      });
      break;

    case "updateProduct":
        console.log({data})
        update({
            table: "ProductsToSell",
            qty: 'updateOne',
            query: {
                _id:data.productId
            },
            update:{
                $set:data
                
            }
        }).then((resp:any) => {
            Api(res, resp)
        })
        break;

    default:
      break;
  }
};