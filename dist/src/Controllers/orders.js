"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const helper_1 = require("../helper");
const notifications_1 = __importDefault(require("../database/models/notifications"));
exports.default = ({ data, res }) => {
    const { action } = data;
    switch (action) {
        case "addOrder":
            (0, database_1.save)({
                table: "orders",
                data: data.order,
            }).then((order) => {
                const newNotification = new notifications_1.default({
                    sender: data.userId,
                    message: "Your order has been placed successfully",
                    notificationType: "orderCreation"
                });
                newNotification.save().then((resp) => {
                    (0, helper_1.Api)(res, resp);
                });
                (0, helper_1.Api)(res, order);
            });
            break;
        case "updateOrder":
            (0, database_1.update)({
                table: 'orders',
                qty: 'updateOne',
                query: {
                    _id: data.orderId
                },
                update: {
                    $set: data
                }
            }).then((resp) => {
                const updateNotification = new notifications_1.default({
                    sender: data.userId,
                    message: "Your order has been updated successfully",
                    notificationType: "orderUpdate"
                });
                updateNotification.save().then(() => {
                    (0, helper_1.Api)(res, resp);
                });
                (0, helper_1.Api)(res, resp);
            });
            break;
        /*case "getOrder":
        //check in the db if the product is available
        find({
          table: "ProductsToSell",
          qty: "findOne",
          query: {
            $or: [{ _id: data.productId }, { goatProductId: data.goatProductId }],
          },
          project: {
            _id: 1,
            goatProductId: 1,
          },
        }).then((order: any) => {
          if (!order) {
            save({
              table: "Orders",
              data: {
                ...data,
              },
            }).then((order: any) => {
              Api(res, order);
            });
          }
        });
        break;*/
    }
};
