"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productProps = exports.matchProdProps = exports.peerProps = void 0;
// @ts-ignore
const sneaks_api_1 = __importDefault(require("sneaks-api"));
const helper_1 = require("../helper");
const database_1 = require("../database");
const products_1 = __importDefault(require("../database/models/products"));
const sneaks = new sneaks_api_1.default();
exports.peerProps = {
    firstName: 1,
    lastName: 1,
    userName: 1,
    image: 1
}, exports.matchProdProps = {
    silhoutte: 1,
    retailPrice: 1,
    thumbnail: 1,
    description: 1,
    releaseDate: 1,
    brand: 1
}, exports.productProps = {
    productNumber: 1,
    title: 1,
    price: 1,
    description: 1,
    images: 1
};
exports.default = ({ res, data }) => {
    const { action } = data;
    switch (action) {
        case "getSneakersData":
            sneaks.getMostPopular(100, (err, products) => {
                if (err)
                    console.log("err");
                else {
                    const newArray = products.map((product) => {
                        let { shoeName, brand, styleID, silhoutte, make, colorway, retailPrice, thumbnail, releaseDate, description, imageLinks, urlKey, resellLinks, goatProductId, resellPrices, } = product;
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
                    products_1.default.insertMany(newArray)
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
            (0, database_1.aggregate)({
                table: "ProductsToSell",
                array: [
                    {
                        $sample: { size: 15 },
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { postedById: "$postedBy" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$postedById"]
                                        }
                                    }
                                },
                                { $project: exports.peerProps }
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
                                { $project: exports.matchProdProps }
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
            }).then((products) => {
                (0, helper_1.Api)(res, products);
            });
            break;
        case "addProduct":
            (0, database_1.save)({
                table: "ProductsToSell",
                data: Object.assign(Object.assign({}, data.product), { postedBy: data.userId })
            }).then((product) => {
                (0, helper_1.Api)(res, { message: "Product has been added." });
            });
            break;
        case "getProductDetails":
            (0, database_1.find)({
                table: "Products",
                qty: "findOne",
                query: { goatProductId: data.goatProductId },
            })
                .then((product) => {
                (0, helper_1.Api)(res, product);
            })
                .catch((e) => {
                console.log(e);
            });
            break;
        case "updateProduct":
            (0, database_1.update)({
                table: "ProductsToSell",
                qty: 'updateOne',
                query: {
                    _id: data.productId
                },
                update: {
                    $set: data
                }
            }).then((resp) => {
                (0, helper_1.Api)(res, resp);
            });
            break;
        case 'searchProduct':
            console.log(data);
            (0, database_1.find)({
                table: 'Products',
                qty: 'find',
                query: {
                    silhoutte: { $regex: data.text }
                },
                project: exports.matchProdProps,
                sort: { _id: -1 },
                limit: 5
            }).then((products) => {
                (0, helper_1.Api)(res, products);
            });
            break;
        default:
            break;
    }
};
