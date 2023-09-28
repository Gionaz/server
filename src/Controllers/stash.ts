import { aggregate, find, save } from "../database"
import { Api } from "../helper"
import mongoose from 'mongoose'
import { matchProdProps } from "./products"
const table = 'Stash'
export default ({ res, data }: any) => {
    const { action } = data
    console.log(data)
    switch (action) {
        case 'addStash':
            save({
                table: 'Stash',
                data
            }).then((stash: any) => {
                Api(res, { message: "Stash added successfully" })
            })
            break;
        case 'getItems':
            aggregate({
                table,
                array: [
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(data.userId)
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
                                        silhoutte:1,
                                        thumbnail:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$product"
                    },
                    {
                        $project:{
                            productId:0
                        }
                    }
                ]
            }).then((items: any) => {
                Api(res, items)
            })
            break;
    }

}