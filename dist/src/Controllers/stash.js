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
const helper_1 = require("../helper");
const mongoose_1 = __importDefault(require("mongoose"));
const products_1 = require("./products");
const table = 'Stash';
exports.default = ({ res, data }) => __awaiter(void 0, void 0, void 0, function* () {
    const { action } = data;
    switch (action) {
        case 'addStash':
            const similarStashItem = yield (0, database_1.find)({
                table,
                qty: 'findOne',
                query: {
                    productId: data.productId,
                    userId: data.userId
                }
            });
            const item = {
                size: data.size,
                quantity: data.quantity,
                price: data.price
            };
            if (!similarStashItem)
                (0, database_1.save)({
                    table,
                    data: Object.assign(Object.assign({}, data), { items: [
                            item
                        ] })
                }).then(() => {
                    (0, helper_1.Api)(res, { message: "Stash added successfully" });
                });
            else if (similarStashItem.items.map((a) => a.size).includes(data.size) && !data.update)
                (0, helper_1.Api)(res, {
                    error: {
                        field: 'size',
                        value: "Product of the same size already added."
                    }
                });
            else
                (0, database_1.update)({
                    table,
                    qty: 'updateOne',
                    query: data.update ? {
                        productId: data.productId,
                        userId: data.userId,
                        items: {
                            $elemMatch: {
                                size: data.size
                            }
                        }
                    } :
                        {
                            productId: data.productId,
                            userId: data.userId
                        },
                    update: data.update ? {
                        $set: {
                            'items.$': item
                        }
                    } : {
                        $push: {
                            items: item
                        }
                    }
                }).then(() => {
                    (0, helper_1.Api)(res, { message: "Stash added successfully" });
                });
            break;
        case 'getItems':
            (0, database_1.aggregate)({
                table,
                array: [
                    {
                        $match: {
                            userId: new mongoose_1.default.Types.ObjectId(data.userId),
                            $expr: {
                                $gt: [{ $size: "$items" }, 0] // Check if the size of "items" array is greater than 0
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            let: { 'productId': '$productId' },
                            as: 'product',
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$_id', '$$productId']
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        silhoutte: 1,
                                        thumbnail: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$product"
                    },
                    {
                        $project: {
                            productId: 0
                        }
                    }
                ]
            }).then((items) => {
                (0, helper_1.Api)(res, items);
            });
            break;
        case "deleteItem":
            (0, database_1.update)({
                table,
                qty: 'updateOne',
                query: {
                    _id: data.stashId,
                    userId: data.userId
                },
                update: {
                    $pull: {
                        items: {
                            size: data.size
                        }
                    }
                }
            }).then(resp => {
                (0, helper_1.Api)(res, { message: "Stash deleted successfully" });
            }).catch((e) => { console.log(e); });
            break;
        case 'getStashProduct':
            (0, database_1.find)({
                table: 'Products',
                qty: 'findOne',
                query: {
                    _id: data.productId
                },
                project: products_1.matchProdProps
            }).then((prod) => {
                (0, helper_1.Api)(res, prod);
            });
            break;
        case 'stashSold':
            const itemExists = yield (0, database_1.find)({
                table,
                qty: 'findOne',
                query: {
                    productId: data.productId,
                    userId: data.userId,
                    items: {
                        $elemMatch: {
                            size: data.size,
                            quantity: { $gt: 0 }
                        }
                    }
                },
                project: {
                    'items.quantity.$': 1
                }
            });
            if (!itemExists)
                (0, helper_1.Api)(res, {
                    error: {
                        field: 'size', value: "You do not have this item in your stash."
                    }
                });
            else {
                if (itemExists.items[0].quantity < data.quantity)
                    (0, helper_1.Api)(res, {
                        error: {
                            field: 'quantity', value: "Quantity is larger than what you have in stock record."
                        }
                    });
                else {
                    (0, database_1.update)({
                        table,
                        qty: 'updateOne',
                        query: {
                            productId: data.productId,
                            userId: data.userId,
                            items: {
                                $elemMatch: {
                                    size: data.size
                                }
                            }
                        },
                        update: {
                            $set: {
                                'items.$.quantity': itemExists.items[0].quantity - data.quantity
                            }
                        }
                    }).then((resp) => {
                        (0, database_1.save)({
                            table: 'StashSells',
                            data: Object.assign(Object.assign({}, data), { stashId: itemExists._id })
                        }).then(() => {
                            (0, helper_1.Api)(res, {
                                message: "Stash updated successfully."
                            });
                        });
                        //
                    });
                }
            }
            break;
        default:
            break;
    }
});
