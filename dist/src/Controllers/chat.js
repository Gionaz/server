"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../database");
const helper_1 = require("../helper");
const products_1 = require("./products");
exports.default = ({ data, res, clients }) => {
    const { action } = data;
    switch (action) {
        case 'newMessage':
            (0, database_1.save)({
                table: 'Chats',
                data: data.message
            }).then((chat) => {
                (0, helper_1.socketBroadCast)(clients, Object.assign(data, { _id: chat._id }));
            });
            break;
        case 'getMessages':
            (0, database_1.update)({
                table: "Chats",
                qty: 'updateMany',
                query: {
                    productId: data.productId,
                    from: data.peerId,
                    to: data.userId
                },
                update: { $set: { isRead: true } }
            }).then((resp) => {
                (0, database_1.find)({
                    table: 'Chats',
                    qty: 'find',
                    query: {
                        productId: data.productId,
                        $or: [
                            { from: data.userId, to: data.peerId },
                            { from: data.peerId, to: data.userId }
                        ]
                    }
                }).then((messages) => {
                    (0, helper_1.Api)(res, messages);
                });
            });
            break;
        case 'getChats':
            (0, database_1.aggregate)({
                table: 'Chats',
                array: [
                    {
                        $match: {
                            $or: [
                                { to: new mongoose_1.default.Types.ObjectId(data.userId) },
                                { from: new mongoose_1.default.Types.ObjectId(data.userId) }
                            ]
                        }
                    },
                    {
                        $sort: {
                            date: -1
                        }
                    },
                    {
                        $group: {
                            _id: {
                                peer: {
                                    $cond: [
                                        { $eq: [new mongoose_1.default.Types.ObjectId(data.userId), '$from'] },
                                        '$to',
                                        '$from'
                                    ]
                                },
                                productId: "$productId"
                            },
                            latestMessage: {
                                $first: '$$ROOT'
                            },
                            unreadCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ['$to', new mongoose_1.default.Types.ObjectId(data.userId)] },
                                                { $ne: ['$isRead', true] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            let: { peerId: "$_id.peer" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$peerId"]
                                        }
                                    }
                                },
                                {
                                    $project: products_1.peerProps
                                }
                            ],
                            as: 'peer',
                        }
                    },
                    {
                        $unwind: "$peer"
                    },
                    {
                        $lookup: {
                            from: 'products_to_sells',
                            let: { productId: "$latestMessage.productId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$productId"]
                                        }
                                    }
                                },
                                {
                                    $project: products_1.productProps
                                }
                            ],
                            as: 'product',
                        }
                    },
                    {
                        $unwind: "$product"
                    },
                    {
                        $lookup: {
                            from: "products",
                            let: { matchProductId: "$product.productNumber" },
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
                                { $project: products_1.matchProdProps }
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
                    },
                    {
                        $project: {
                            _id: 0
                        }
                    },
                    {
                        $sort: {
                            'latestMessage.date': -1
                        }
                    }
                ]
            }).then((chats) => {
                (0, helper_1.Api)(res, chats);
            }).catch(() => {
            });
            break;
        case 'deleteItem':
            console.log(data);
            break;
        default:
            break;
    }
};
