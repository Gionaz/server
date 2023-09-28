"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const helper_1 = require("../helper");
const mongoose_1 = __importDefault(require("mongoose"));
const table = 'Stash';
exports.default = ({ res, data }) => {
    const { action } = data;
    switch (action) {
        case 'addStash':
            (0, database_1.save)({
                table: 'Stash',
                data
            }).then((stash) => {
                (0, helper_1.Api)(res, { message: "Stash added successfully" });
            });
            break;
        case 'getItems':
            (0, database_1.aggregate)({
                table,
                array: [
                    {
                        $match: {
                            userId: new mongoose_1.default.Types.ObjectId(data.userId)
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
    }
};
