import { Response } from "express";
import {
  ImageProps,
  PushNotesProps,
  SendEmailProps,
  SocialImageProps,
} from "../types";
import { NotificationProps } from "../types/index";
import FlashChallenges from "../modules/flashChallenges";
import AWS, { S3Outposts } from "aws-sdk";
import moment from "moment";
import { aggregate, find, remove, save, update } from "../database";
import { sendPushNotification } from "./notifications";
import Mongoose from "mongoose";
import momentTz from "moment-timezone";
import Https from "https";
import axios from "axios";
import { sendTosentry } from "../sentry";

<<<<<<< HEAD
export const Api = (res: Response, data: any) => {
    res.status(201).json(data)
},
    validateForm = (formData: any, formType: 'Login' | 'Register' | 'fgPass' | 'Reset Password') => {
        const minPasswordLength = 8;
        const maxPasswordLength = 30;
        const passwordLengthMessage = `Password must contain ${minPasswordLength}-${maxPasswordLength} characters`;
        const minNameLength = 3;
        const maxNameLength = 100;
        const nameLengthMessage = `Name must contain ${minNameLength}-${maxNameLength} characters`;
        const minUsernameLength = 3;
        const maxUsernameLength = 30;
        const usernameLengthMessage = `Username must contain ${minNameLength}-${maxNameLength} characters`;
        const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

        let error: { field: string | null, value: string | null } = { field: null, value: null };

        if (formType !== 'Reset Password' && !formData.email.trim()) {
            error.field = "email";
            error.value = "Email is required";
            return error;
        }

        if (formType !== 'Reset Password' && !emailRegex.test(formData.email)) {
            error.field = "email";
            error.value = "Invalid email address";
            return error;
        }

        if (['Login', 'Register', 'Reset Password'].includes(formType) && !formData.password.trim()) {
            error.field = "password";
            error.value = "Password is required";
            return error;
        }

        if (formType === "Register") {
            if (!formData.fullName) {
                error.field = "fullName";
                error.value = "Full name is required";
                return error;
            }

            if (formData.fullName.length < minNameLength || formData.fullName.length > maxNameLength) {
                error = {
                    field: 'fullName',
                    value: nameLengthMessage,
                };
            } else if (formData.userName.length < minUsernameLength || formData.userName.length > maxUsernameLength) {
                error = {
                    field: 'userName',
                    value: usernameLengthMessage,
                };
            } else if (formData.password.length < minPasswordLength || formData.password.length > maxPasswordLength) {
                error = {
                    field: 'password',
                    value: passwordLengthMessage,
                };
            }
        }
        if (formType === 'Reset Password') {
            if (formData.confirmPass !== formData.password) {
                error = {
                    field: 'confirmPass',
                    value: 'Passwords do not match'
                }
            }
            else if (formData.password.length < minPasswordLength || formData.password.length > maxPasswordLength) {
                error = {
                    field: 'password',
                    value: passwordLengthMessage,
                };
            }
        }

        return error;
    },
    generate = (n: any): string => {
        var add = 1,
            max = 12 - add;

        if (n > max) {
            return generate(max) + generate(n - max);
        }
        max = Math.pow(10, n + add);
        var min = max / 10; // Math.pow(10, n) basically
        var number = Math.floor(Math.random() * (max - min + 1)) + min;
        return ("" + number).substring(add);
    }
=======
export type ImageUploadProps = {
  _id: string;
  base64?: string;
  folder: string;
  ext?: string;
  addToPortfolio?: any;
  imgUrl?: string;
};
export type DuplicateImageProps = {
  sourceKey: string;
  targetKey: string;
};
type MultipleImageUploadProps = {
  _id: string;
  base64: string[];
  folder: string;
};
type PortfolioBase64 = {
  base64: string;
  ext: string;
  isCoverPhoto?: boolean;
  social?: "facebook" | "instagram";
};
type PortfolioUpload = {
  _id: string;
  folder: string;
  images: PortfolioBase64[];
};
type VotingProps = {
  _id: string;
  voted: boolean;
  userId: string;
};
const config = new AWS.Config({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
AWS.config = config;
const appId = process.env.PINPOINT_PROJECT_ID as string;

const ses = new AWS.SES();
const s3 = new AWS.S3();
export const pinpoint = new AWS.Pinpoint({
  apiVersion: "2016-12-01",
  region: process.env.AWS_REGION,
});
export const minPasswordLength = 8;
export const maxPasswordLength = 30;
export const passwordLengthMessage = `Password must contain ${minPasswordLength}-${maxPasswordLength} characters`;
const minNameLength = 3;
const maxNameLength = 100;
const nameLengthMessage = `Name must contain ${minNameLength}-${maxNameLength} characters`;
export const minUsernameLength = 3;
export const maxUsernameLength = 30;
export const usernameLengthMessage = `Username must contain ${minNameLength}-${maxNameLength} characters`;
export const emailRegex =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
export const Api = (res: Response, data: any) => {
    res.status(201).json(data);
  },
  validateForm = (
    formData: any,
    formType: "Login" | "Register" | "fgPass" | "Reset Password"
  ) => {
    let error: { field: string | null; value: string | null } = {
      field: null,
      value: null,
    };

    if (formType !== "Reset Password" && !formData.email.trim()) {
      error.field = "email";
      error.value = "Email is required";
      return error;
    }

    if (
      !["Reset Password", "Login"].includes(formType) &&
      !emailRegex.test(formData.email)
    ) {
      error.field = "email";
      error.value = "Invalid email address";
      return error;
    }

    if (
      ["Login", "Register", "Reset Password"].includes(formType) &&
      !formData.password.trim()
    ) {
      error.field = "password";
      error.value = "Password is required";
      return error;
    }

    if (formType === "Register") {
      if (!formData.fullName) {
        error.field = "fullName";
        error.value = "Full name is required";
        return error;
      }

      if (
        formData.fullName.length < minNameLength ||
        formData.fullName.length > maxNameLength
      ) {
        error = {
          field: "fullName",
          value: nameLengthMessage,
        };
      } else if (
        formData.userName.length < minUsernameLength ||
        formData.userName.length > maxUsernameLength
      ) {
        error = {
          field: "userName",
          value: usernameLengthMessage,
        };
      } else if (
        formData.password.length < minPasswordLength ||
        formData.password.length > maxPasswordLength
      ) {
        error = {
          field: "password",
          value: passwordLengthMessage,
        };
      }
    }
    if (formType === "Reset Password") {
      if (formData.confirmPass !== formData.password) {
        error = {
          field: "confirmPass",
          value: "Passwords do not match",
        };
      } else if (
        formData.password.length < minPasswordLength ||
        formData.password.length > maxPasswordLength
      ) {
        error = {
          field: "password",
          value: passwordLengthMessage,
        };
      }
    }

    return error;
  },
  generate = (n: any): string => {
    var add = 1,
      max = 12 - add;

    if (n > max) {
      return generate(max) + generate(n - max);
    }
    max = Math.pow(10, n + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;
    return ("" + number).substring(add);
  },
  sendEmail = ({
    recipients,
    text,
    subject,
    senderEmailAdress,
    html,
  }: SendEmailProps) => {
    const params = {
      Destination: {
        ToAddresses: recipients,
      },
      Message: {
        Body: {
          Html: { Data: html },
          Text: { Data: text },
        },

        Subject: { Data: subject },
      },
      Source: senderEmailAdress,
    };
    return ses.sendEmail(params).promise();
  },
  savePortfolioImages = async ({ images, folder, _id }: PortfolioUpload) => {
    let imagesToSave: any[] = [];
    for (let index = 0; index < images.length; index++) {
      const { base64, ext, isCoverPhoto } = images[index];

      let image: any = await saveImage({ folder, base64, ext, _id });
      imagesToSave.push({
        image,
        isCoverPhoto,
        priority: 1,
      });
      if (index === images.length - 1) return imagesToSave;
    }
  },
  saveSocialImage = async (
    socialImage: any,
    userId: string,
    portfolioId: string
  ) => {
    await Https.get(socialImage.image, async (response) => {
      let imgUrl = await saveImage({
        _id: userId + "/" + portfolioId,
        folder: "portfolio",
        addToPortfolio: response,
      });
      update({
        table: "SocialFeeds",
        qty: "updateOne",
        query: {
          _id: portfolioId,
        },
        update: {
          $push: {
            media: {
              image: imgUrl,
              socialUrl: socialImage.image,
              social: socialImage.social,
              isCoverPhoto: socialImage.isCoverPhoto,
            },
          },
        },
      }).then((resp) => {
        console.log(resp);
      });
    });
  },
  saveImage = async ({
    _id,
    base64,
    addToPortfolio,
    folder,
    ext,
  }: ImageUploadProps) => {
    // convert the base64 image to a buffer
    const imageBuffer =
      addToPortfolio || Buffer.from(base64 as string, "base64");
    const date = moment(new Date()).format("YYYY-MM-DD-HH-mm-s");

    // upload the original image to S3
    const originalKey = `${folder}/${_id}/${date}/image`;
    const originalParams = {
      Bucket: `anthology-${process.env.env}-backend`,
      Key: originalKey,
      Body: imageBuffer,
      ContentType: `image/${ext || "jpeg"}`,
    };
    let resp = await s3.upload(originalParams).promise();
    return resp.Location;
  },
  saveImages = async (socialImages: SocialImageProps[], _id: string) => {
    const s3Images = [];
    for (const socialImage of socialImages) {
      const response = await axios.get(socialImage.image, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data, "binary");
      const date = moment(new Date()).format("YYYY-MM-DD-HH-mm-s");
      const originalKey = `portfolios/${_id}/${date}/image`;

      const params = {
        Bucket: `anthology-${process.env.env}-backend`,
        Key: originalKey,
        Body: buffer,
        ContentType: `image/${"jpeg"}`,
      };
      let resp = await s3.upload(params).promise();

      const s3Url = resp.Location;
      s3Images.push({
        ...socialImage,
        image: s3Url,
        isUploaded: true,
        socialUrl: socialImage.image,
      });
    }
    return s3Images;
  },
  saveMultipleImages = async ({
    folder,
    _id,
    base64,
  }: MultipleImageUploadProps) => {
    let images: string[] = [];
    for (let index = 0; index < base64.length; index++) {
      let imgUrl: any = await saveImage({ folder, base64: base64[index], _id });
      images.push(imgUrl);
      if (index === base64.length - 1) return images;
    }
  },
  deleteS3BucketImage = (image: string) => {
    const bucketName = image.split(".s3")[0].split("//")[1];
    const splitImg = image.split(".com/")[1];

    let itemsToDelete = ["small", "medium", "large", "huge"].map(
      (size: string) => {
        return { Key: splitImg + "-thumbnail-" + size };
      }
    );
    itemsToDelete.push({ Key: splitImg });

    const deleteParams: any = {
      Bucket: bucketName,
      Delete: {
        Objects: itemsToDelete,
      },
    };
    s3.deleteObjects(deleteParams, (err, data) => {
      if (err) {
        console.log(`Error deleting object ${err}`);
      } else return data;
    });
  },
  duplicateImage = async ({ sourceKey, targetKey }: DuplicateImageProps) => {
    try {
      const result = await s3
        .copyObject({
          Bucket: `anthology-${process.env.env}-backend`,
          CopySource: sourceKey.split(".com")[1],
          Key: targetKey,
        })
        .promise();
      return targetKey;
    } catch (err) {
      console.error(err);
    }
  },
  getSuperUser = async () =>
    await find({
      table: "Users",
      qty: "findOne",
      query: {
        email: process.env.superUserEmail,
      },
      project: {
        _id: 1,
      },
    }),
  deleteSocialFeeds = async (query: any) => {
    let portfolios: any = await find({
      table: "SocialFeeds",
      qty: "find",
      query,
      project: {
        "media.image": 1,
        _id: 0,
      },
    });
    let images = portfolios
      .map((a: any) => a.media.map((x: any) => x.image))
      .flat();
    deleteImages(images);
    remove({
      table: "SocialFeeds",
      qty: "deleteMany",
      query,
    }).then(() => {});
  },
  deleteCategory = async (query: any) => {
    await remove({
      table: "Categories",
      qty: "deleteMany",
      query,
    });
  },
  deleteImages = async (imageUrls: string[]) => {
    for (let index = 0; index < imageUrls.length; index++) {
      deleteS3BucketImage(imageUrls[index]);
      if (index === imageUrls.length - 1)
        return imageUrls.length + " images have been deleted";
    }
  },
  saveNotifications = async (data: NotificationProps) => {
    await save({
      table: "Notifications",
      data,
    });
    sendPushNotification({
      title: data.title,
      body: data.body,
      data: {},
      to:
        data.recipients ||
        (data.recipient === "all" ? "all" : ([data.recipient] as any)),
    });
  },
  registerDeviceToken = async (
    deviceToken: string,
    device: "ios" | "android"
  ) => {
    const updateEndpointParams = {
      ApplicationId: appId,
      EndpointId: deviceToken,
      EndpointRequest: {
        Address: deviceToken,
        ChannelType: device === "android" ? "GCM" : "APNS",
      },
    };

    const pinpoint = new AWS.Pinpoint();

    pinpoint.updateEndpoint(updateEndpointParams, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Device token registered:", deviceToken);
      }
    });
  },
  SendNotificationTemp = async ({
    sender,
    recipient,
    template,
    socialFeedId,
  }: PushNotesProps) => {
    let Sender: any = { _id: "Anthology", fullName: "Anthology" };
    if (sender !== "admin")
      Sender = await find({
        table: "Users",
        qty: "findOne",
        query: {
          _id: sender,
        },
        project: {
          image: 1,
          fullName: 1,
          userName: 1,
        },
      });

    const payloads = {
      NEW_FOLLOWER: {
        title:
          (Sender.fullName.trim() || Sender.userName) +
          " just started following you!",
        body: "Open app",
        recipient,
        sender,
        message: "Started following you",
        notificationType: "following",
      },
      NEW_DAILY_CHALLENGE: {
        title: "Today's photo Challenge is Now Live!",
        body: "Make your submissions before the challenge closes to keep your streak going & be entered to win!",
        notificationType: "newFlashChallenge",
      },
      NEW_DAILY_CHALLENGE_ABOUT_TO_ENDED: {
        title: "Today's photo Challenge is about to end!",
        body: "Make your submissions before the challenge closes to keep your streak going & be entered to win!",
        notificationType: "flasChallengeAbout ToEnd",
        recipient,
      },
      NEW_DAILY_CHALLENGE_ENDED: {
        title: "Today's Challenge has Closed!",
        body: "Check out the submissions who won today's creative photo challenge!",
        notificationType: "flashChallengeEnded",
      },
      NEW_LIKE: {
        title:
          (Sender.fullName.trim() || Sender.userName) +
          " liked your recent post!",
        body: "Open the app to see more.",
        recipient,
        sender,
        message: "Liked your recent post.",
        socialFeedId,
        notificationType: "New like",
      },
      FLASH_CHALLENGE_WINNER: {
        title: "You've Won Today's Challenge!",
        body: "Congrats! Your photo has been selected as one of the winners of today's challenge!",
        notificationType: "flashChallengeWinners",
      },
    };
    saveNotifications((payloads as any)[template]);
  },
  getActiveFlashChallenge = async (
    userId?: string,
    currentChallenge?: string
  ) => {
    try {
      let challenge: any = await find({
        table: "FlashChallenges",
        qty: "findOne",
        query: userId
          ? {
              isActive: true,
              _id: { $ne: currentChallenge },
            }
          : { isActive: true, _id: { $ne: currentChallenge } },
      });
      let sponsor: any;
      if (challenge)
        sponsor = await find({
          table: "Sponsors",
          qty: "findOne",
          query: {
            _id: challenge.sponsoredBy,
          },
        });
      return challenge
        ? {
            _id: challenge._id,
            topic: challenge.topic,
            startDate: challenge.startDate,
            endDate: challenge.endDate,
            createdAt: challenge.createdAt,
            updatedAt: challenge.isActive,
            isActive: challenge.isActive,
            sponsor,
            isJoined: Boolean(
              challenge.joined.find(
                (a: string) => a.toString() === userId?.toString()
              )
            ),
            isSkipped: Boolean(
              challenge.skipped.find(
                (a: string) => a.toString() === userId?.toString()
              )
            ),
          }
        : null;
    } catch (e) {
      console.log(e);
      return e;
    }
  },
  voteForSubmission = async ({ _id, voted, userId }: VotingProps) => {
    let Update = await update({
      table: "SocialFeeds",
      qty: "findOneAndUpdate",
      query: {
        _id,
      },
      update: {
        ["$" + (voted ? "addToSet" : "pull")]: {
          votes: new Mongoose.Types.ObjectId(userId),
          likes: { likedBy: userId },
        },
      },
    });
    return Update;
  },
  onRun = () => {
    // FlashChallenges({ apiData: { action: "createEndFlashChallenge" } });
    setInterval(() => {
      const date = momentTz().tz("America/New_York");
      const time = date.format("HH:mm:ss");
      if (time === process.env.flashStartTime) {
        FlashChallenges({ apiData: { action: "createEndFlashChallenge" } });
        sendTosentry("Flashchallenge ", "Flash challenge has started.");
      } else if (time === process.env.sendFlashReminder)
        FlashChallenges({ apiData: { action: "sendFlashReminder" } });
      else if (time === process.env.flashEndTime)
        FlashChallenges({
          apiData: { action: "createEndFlashChallenge", end: true },
        });
    }, 1000);
  },
  sendBySocket = (
    receipient: string[] | string,
    clients: any,
    data: any,
    platform?: "mobile" | "web"
  ) => {
    if (typeof receipient === "string") {
      let socket = clients.list[receipient + "_" + platform];
      if (socket?.OPEN) socket.send(JSON.stringify(data));
    } else
      (receipient.length ? receipient : Object.keys(clients.list)).forEach(
        (receip: string) => {
          let socket = clients.list[receip + "_" + platform];
          if (socket?.OPEN) socket.send(JSON.stringify(data));
        }
      );
  },
  returnThumbnail = (imageUrl: string, index: number) => {
    let thumbs = ["small", "medium", "large", "huge"];
    let img = imageUrl ? imageUrl + "-thumbnail-" + thumbs[index] : "";
    return img;
  },
  reUploadImage = async ({ imgUrl, _id, folder, ext }: ImageUploadProps) => {
    try {
      const response = await axios.get(imgUrl as string, {
        responseType: "arraybuffer",
        timeout: 5000,
        maxContentLength: 50 * 1024 * 1024,
      });
      const buffer = Buffer.from(response.data, "binary");
      const date = moment(new Date()).format("YYYY-MM-DD-HH-mm-s");
      const originalKey = `${folder}/${_id}/${date}/image`;

      const params = {
        Bucket: `anthology-prod-backend`,
        Key: originalKey,
        Body: buffer,
        ContentType: `image/${ext}`,
      };

      const resp = await s3.upload(params).promise();
      const s3Url = resp.Location;
      return s3Url;
    } catch (error) {
      // console.error(`Error uploading image ${imgUrl}: `, error);
      return error;
    }
  };
 
  
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
