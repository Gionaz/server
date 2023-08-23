"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const database_1 = require("../database");
const PushNotifications_1 = __importDefault(require("./PushNotifications"));
const sendPushNotification = (notification) => {
    const query = notification.to.length === 1 && !notification.to[0] ? {} : { _id: { $in: notification.to } };
    (0, database_1.find)({
        table: 'Users',
        qty: 'find',
        query,
        project: {
            'devices.registration_id': 1,
            'devices.active': 1,
            _id: 0
        }
    }).then((users) => {
        const deviceTokens = users.map((user) => user.devices.filter((a) => a.active).map((device) => device.registration_id)).flat();
        if (deviceTokens.length)
            (0, PushNotifications_1.default)({
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: notification.data,
                android: {
                    notification: {
                        channel_id: "payment",
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            "mutable-content": 1,
                        }
                    }
                },
                // webpush: {
                //     headers: {
                //         image: JSON.stringify(Image)
                //     }
                // },
                tokens: deviceTokens,
                priority: "high",
            });
    });
};
exports.sendPushNotification = sendPushNotification;
