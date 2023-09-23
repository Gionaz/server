import Mongoose from "mongoose"
import { aggregate, find, save } from "../database"
import { Api, socketBroadCast } from "../helper"
import { peerProps } from "./products"

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
                        $sort:{
                            date:-1
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
                        $project: {
                            _id: 0
                        }
                    },
                    {
                        $sort:{
                            'latestMessage.date':-1
                        }
                    }
                ]
            }).then((chats) => {
                Api(res, chats)
            }).catch(() => {

            })
            break;
        default:
            break;
    }

}