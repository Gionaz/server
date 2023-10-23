
import { aggregate, find, remove, save, update } from "../database"
import { Api } from "../helper"
import mongoose from 'mongoose'
import { matchProdProps } from "./products"
const table = 'Stash'

export default async ({ res, data }: any) => {
    const { action } = data
    switch (action) {
        case 'addStash':
            const similarStashItem: any = await find({
                table,
                qty: 'findOne',
                query: {
                    productId: data.productId,
                    userId: data.userId
                }
            })
            const item = {
                size: data.size,
                quantity: data.quantity,
                price: data.price
            }
            if (!similarStashItem)
                save({
                    table,
                    data: {
                        ...data,
                        items: [
                            item
                        ]
                    }
                }).then(() => {
                    Api(res, { message: "Stash added successfully" })
                })
            else if (similarStashItem.items.map((a: any) => a.size).includes(data.size) && !data.update)
                Api(res, {
                    error: {
                        field: 'size',
                        value: "Product of the same size already added."
                    }
                })
            else
                update({
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
                    Api(res, { message: "Stash added successfully" })
                })

            break;
        case 'getItems':
            aggregate({
                table,
                array: [
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(data.userId),
                            $expr: {
                                $gt: [{ $size: "$items" }, 0]  // Check if the size of "items" array is greater than 0
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
            }).then((items: any) => {
                Api(res, items)
            })
            break;
        case "deleteItem":
            update({
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
                Api(res, { message: "Stash deleted successfully" })
            }).catch((e) => { console.log(e) })
            break
        case 'getStashProduct':
            find({
                table: 'Products',
                qty: 'findOne',
                query: {
                    _id: data.productId
                },
                project: matchProdProps
            }).then((prod) => {
                Api(res, prod)
            })
            break;
        case 'stashSold':
            const itemExists: any = await find({
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
            })
            if (!itemExists)
                Api(res, {
                    error: {
                        field: 'size', value: "You do not have this item in your stash."
                    }
                })
            else {
                if (itemExists.items[0].quantity < data.quantity)
                    Api(res, {
                        error: {
                            field: 'quantity', value: "Quantity is larger than what you have in stock record."
                        }
                    })
                else {
                    update({
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
                        save( {
                            table: 'StashSells',
                            data: {
                                ...data,
                                stashId: itemExists._id
                            }
                        }).then(() => {
                            Api(res, {
                                message: "Stash updated successfully."
                            })
                        })
                        //
                    })
                }
            }
            break;
        default:
            break
    }

}
