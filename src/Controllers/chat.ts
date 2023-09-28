import Mongoose from "mongoose"
import { aggregate, find, save, update } from "../database"
import { Api, socketBroadCast } from "../helper"
import { matchProdProps, peerProps, productProps } from "./products"

export default ({
    data,
    res,
    clients
}: any) => {
    const { action } = data
    switch (action) {
        case 'newMessage':
            save({
                table: 'Chats',
                data: data.message
            }).then((chat: any) => {
                socketBroadCast(clients,
                    Object.assign(data, { _id: chat._id }))
            })
            break;
        case 'getMessages':
            update({
                table: "Chats",
                qty: 'updateMany',
                query: {
                    productId: data.productId,
                    from: data.peerId,
                    to: data.userId
                },
                update: { $set: { isRead: true } }
            }).then((resp) => {
                find({
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
                    Api(res, messages)
                })
            })

            break;
        case 'getChats':
            aggregate({
                table: 'Chats',
                array: [
                    {
                        $match: {
                            $or: [
                                { to: new Mongoose.Types.ObjectId(data.userId) },
                                { from: new Mongoose.Types.ObjectId(data.userId) }
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
                                        { $eq: [new Mongoose.Types.ObjectId(data.userId), '$from'] },
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
                                                { $eq: ['$to', new Mongoose.Types.ObjectId(data.userId)] },
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
                                    $project: peerProps
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
                                    $project: productProps
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
            }).then((chats: any) => {
                Api(res, chats)
            }).catch(() => {

            })
            break;
        default:
            break;
    }

}