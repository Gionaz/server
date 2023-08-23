<<<<<<< HEAD
// import AWS from 'aws-sdk';
// import { FCMDeviceModel } from '../models/models';
// import sequelize from '../config/postgre';
// // Set the region
// // AWS.config.update({ region: 'REGION' });

// // Create a new Pinpoint object
// const pinpoint = new AWS.Pinpoint({
//     region: process.env.AWS_REGION,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID
// });

// const PINPOINT_PROJECT_ID = process.env.PINPOINT_PROJECT_ID as string
// const USE_APNS_SANDBOX = process.env.USE_APNS_SANDBOX;


// const TEMPLATES: any = {
//     NEW_FOLLOWER: 'NEW_FOLLOWER',
//     JOINED_HOTSPOT_CHALLENGE: 'JOINED_HOTSPOT_CHALLENGE',
//     NEW_LIKE: 'NEW_LIKE',
//     NEW_DAILY_CHALLENGE: 'NEW_DAILY_CHALLENGE',
//     NEW_DAILY_CHALLENGE_ENDED: 'NEW_DAILY_CHALLENGE_ENDED',
//     DAILY_CHALLENGE_WINNER: 'DAILY_CHALLENGE_WINNER'
// };

// const DEEP_LINKS = {
//     [TEMPLATES.NEW_FOLLOWER]: 'profile/',
//     [TEMPLATES.JOINED_HOTSPOT_CHALLENGE]: 'hotspotMediaDetail/',
//     [TEMPLATES.NEW_LIKE]: 'socialPostDetail/',
//     [TEMPLATES.NEW_DAILY_CHALLENGE]: 'dailyChallenge/openModal',
//     [TEMPLATES.NEW_DAILY_CHALLENGE_ENDED]: 'dailyChallengeWinners/',
//     [TEMPLATES.DAILY_CHALLENGE_WINNER]: 'dailyChallengeWinners/'
// };

// const DEFAULT_DEEPLINK_PREFIX = 'anthology://';

// export const sendNotification = async ({
//     senderId,
//     senderUsername,
//     notificationType,
//     toUserIds,
//     payloadJSON,
//     deeplinkPrefix,
//     hotspotMediaId,
//     dailyChallengeId
// }: any) => {
//     const { QueryTypes } = sequelize.Sequelize as any;

//     const fromUserId = senderId;
//     console.log('Using legacy user ID: ', fromUserId);

//     if (!notificationType) {
//         console.error("'missing or notificationType");
//         return {
//             statusCode: 500,
//             body: JSON.stringify('missing or notificationType!')
//         };
//     }

//     const params = {
//         created_by_id: fromUserId,
//         user_ids: toUserIds,
//         type: notificationType,
//         payload: payloadJSON ? payloadJSON : '{}',
//         hotspot_media_id: hotspotMediaId
//     };

//     // const devices = await sequelize.models.FcmDevice.findAll({
//     //     where: { user_id: toUserIds }
//     // });
//     const devices = (await FCMDeviceModel(sequelize).findAll({
//         where: {
//             active: true,
//             user_id: toUserIds
//         },
//         // attributes: ['registration_id']
//     })).map((a: any) => a.dataValues)

//     console.log('Storing into db', params);
//     // const stored = await sequelize.models.PushNotification.create(params);
//     // console.log('Storing into db -result ', stored);

//     if (!devices || devices.length == 0) {
//         console.error('No devices found for userId', toUserIds);
//         return {
//             statusCode: 200,
//             body: JSON.stringify('done')
//         };
//     }

//     const template = TEMPLATES[notificationType];
//     if (!template) {
//         return {
//             statusCode: 500,
//             body: JSON.stringify('unsupported template', template)
//         };
//     }

//     const suffix = deeplinkPrefix ? deeplinkPrefix : DEFAULT_DEEPLINK_PREFIX;

//     let url: any;
//     switch (notificationType) {
//         case TEMPLATES.NEW_LIKE: {
//             if (payloadJSON) {
//                 const parsedPayload = JSON.parse(payloadJSON);
//                 url = suffix + DEEP_LINKS[template] + parsedPayload.postId;
//             }
//             break;
//         }

//         case TEMPLATES.NEW_FOLLOWER: {
//             url = suffix + DEEP_LINKS[template] + fromUserId;
//             break;
//         }

//         case TEMPLATES.JOINED_HOTSPOT_CHALLENGE: {
//             url = suffix + DEEP_LINKS[template] + hotspotMediaId;
//             break;
//         }

//         case TEMPLATES.NEW_DAILY_CHALLENGE:
//         case TEMPLATES.NEW_DAILY_CHALLENGE_ENDED:
//         case TEMPLATES.DAILY_CHALLENGE_WINNER: {
//             url = suffix + DEEP_LINKS[template];
//             break;
//         }
//     }


//     let substitutions: any = {};
//     if (senderUsername) {
//         substitutions.username = [senderUsername];
//     }

//     let badgeCountMap = [];
//     const badgeCountSelect = `
//         select count(id) as notification_count, 
//             unnest(array(select unnest(user_ids) except select unnest(seen_by_ids))) as user_id
//             from push_notification
//         group by user_id
//         order by user_id
//         `;
//     badgeCountMap = await sequelize.query(badgeCountSelect, {
//         type: QueryTypes.SELECT
//     });

//     const responses = [];
//     const chunkSize = 100;

//     const userGroupedDevices = groupBy(devices, (device: any) => device.user_id);

//     for (let i = 0; i < userGroupedDevices.length; i += 1) {
//         const userId = userGroupedDevices[i].userId;
//         const userDevices = userGroupedDevices[i].value;
//         const badgeCountWrappper: any = badgeCountMap.find(
//             (m: any) => m.user_id == userId
//         );

//         const badgeCount = badgeCountWrappper
//             ? badgeCountWrappper.notification_count
//             : 1;

//         for (let j = 0; j < userDevices.length; j += chunkSize) {
//             const max100DevicesAtOnce = userDevices.slice(j, j + chunkSize);
//             try {
//                 const res = await sendPushNotification(
//                     'DEEP_LINK',
//                     url,
//                     max100DevicesAtOnce,
//                     template,
//                     substitutions,
//                     badgeCount
//                 );
//                 responses.push(res);
//                 console.log("Notification sent", res)
//             } catch (e) {
//                 console.log("Cannot send notification ", e)
//             }
//         }
//     }

//     return responses;
// }


// // Set the parameters for the push notification
// const sendPushNotification = async (
//     action = 'OPEN_APP',
//     url = undefined,
//     pushDevices: string[],
//     pushNotificationTemplate: any,
//     substitutions = {},
//     badge = 1
// ) => {
//     const addresses = convertDeviceTokensToMap(pushDevices, {
//         ...substitutions
//     });

//     if (Object.keys(addresses).length == 0) {
//         return Promise.resolve();
//     }

//     return pinpoint
//         .sendMessages({
//             ApplicationId: PINPOINT_PROJECT_ID,
//             MessageRequest: {
//                 Addresses: addresses,
//                 MessageConfiguration: {
//                     APNSMessage: {
//                         APNSPushType: 'alert',
//                         Badge: badge,
//                         Sound: 'default',
//                         Action: action,
//                         ...(action != 'OPEN_APP'
//                             ? {
//                                 Url: url
//                             }
//                             : {})
//                     },
//                     GCMMessage: {
//                         Sound: 'default'
//                     }
//                 },
//                 TemplateConfiguration: {
//                     PushTemplate: {
//                         Name: pushNotificationTemplate
//                     }
//                 }
//             }
//         })
//         .promise();
// };

// const convertDeviceTokensToMap = (tokens: string[], substitutions: any) => {
//     return tokens.reduce((previous: any, current: any) => {
//         if (!current || !current.type) {
//             return previous;
//         }

//         let channelType = current.type.toLowerCase() === 'android' ? 'GCM' :
//             current.type.toLowerCase() === 'ios' ? (USE_APNS_SANDBOX ? 'APNS_SANDBOX' : 'APNS') : null;


//         if (channelType == null) {
//             // console.error('unknown device type', current.type);
//             return previous;
//         }

//         if (!current.registration_id) {
//             console.error('no registration id', current);
//             return previous;
//         }

//         previous[current.registration_id] = {
//             ChannelType: channelType,
//             Substitutions: substitutions
//         };
//         return previous;
//     }, {});
// };
// const groupBy = (list: any, keyGetter: any) => {
//     const map = new Map();
//     list.forEach((item: any) => {
//         const key = keyGetter(item);
//         const collection = map.get(key);
//         if (!collection) {
//             map.set(key, [item]);
//         } else {
//             collection.push(item);
//         }
//     });
//     return Array.from(map, ([name, value]) => ({ userId: name, value }));
// }

// export default sendPushNotification

=======
import { find } from "../database";
import { PushNotificationProps } from "../types";

import sendNotification from './PushNotifications';


export const sendPushNotification = (notification: PushNotificationProps) => {
    const query = notification.to.length === 1 && !notification.to[0] ? {} : { _id: { $in: notification.to } }
    find({
        table: 'Users',
        qty: 'find',
        query,
        project: {
            'devices.registration_id': 1,
            'devices.active': 1,
            _id: 0
        }
    }).then((users: any) => {
        const deviceTokens = users.map((user: any) => user.devices.filter((a: any) => a.active).map((device: any) => device.registration_id)).flat()
        if (deviceTokens.length)
            sendNotification({
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
    })
}
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
