<<<<<<< HEAD
import { Api, generate } from "../helper";
import { generateJwtToken } from "../helper/auth";
import { find, remove, save, update } from "../database";
import { generatePasswordHash } from "../database/models/users";
const table = 'Users'
export default async ({
    res,
    apiData
}: any) => {

    const { action } = apiData;
    switch (action) {
        case 'Register':
            find({
                table,
                qty: 'findOne',
                query: {
                    $or: [
                        { email: apiData.email.trim() },
                        { userName: apiData.userName.trim() }
                    ]
                },
                project: {
                    email: 1,
                    password: 1,
                    userName: 1
                }
            }).then((user: any) => {
                if (user)
                    Api(res, {
                        field: user.email === apiData.email ? 'email' : 'userName',
                        error: user.email === apiData.email ? 'The email you entered is already registered!' : 'The username is not available!',
                    })
                else
                    save({ table, data: apiData }).then((user: any) => {
                        //send emails
                        const validCode = generate(4);
                        save({
                            table: 'Activations',
                            data: {
                                userId: user._id,
                                code: validCode,
                                expiresAt: new Date(Date.now() + 30 * 60000)
                            }
                        }).then(() => {
                            Api(res, {
                                status: 'success',
                                verification: true,
                                user: {
                                    _id: user._id
                                }
                            })
                        })
                    })
            })

            break;
        case 'Login':
            find({
                table,
                qty: 'findOne',
                query: {
                    $or: [
                        { email: apiData.email.trim() },
                        { userName: apiData.email.trim() }
                    ]
                },
                project: {
                    email: 1,
                    phone: 1,
                    password: 1,
                    username: 1,
                    image: 1,
                    status: 1,
                    isActive: 1
                }
            }).then((user: any) => {
                if (user?.status === 'suspended')
                    Api(res, {
                        field: 'email',
                        error: 'This account cannot be accessed at this time. Please contact support.'
                    })
                else if (!user || !user.validPassword(apiData.password, user.password))
                    Api(res, {
                        field: 'password',
                        error: 'You have entered invalid credentials'
                    })
                else {
                    if (!user.isActive)
                        Api(res, {
                            status: 'success',
                            verification: true,
                            User: {
                                _id: user._id
                            }
                        })
                    else {
                        const jwtToken = generateJwtToken(user._id)
                        const jwtRefreshToken = generateJwtToken(user._id + 'refreshToken')
                        user.jwtRefreshToken = jwtRefreshToken
                        update({
                            table,
                            qty: 'updateOne',
                            query: { _id: user._id },
                            update: { $set: { jwtRefreshToken } }
                        }).then(() => {
                            Api(res, {
                                User: Object.assign(user, { password: undefined }),
                                jwtToken
                            })
                        })
                    }
                }
            })

            break;
        case 'fgPass': //forgot password
            //check if the email email is registered
            //generate an activation code and send it through email, save it to the db
            find({
                table,
                qty: 'findOne',
                query: {
                    email: apiData.email?.trim()
                },
                project: {
                    _id: 1
                }
            }).then((user: any) => {
                if (!user)
                    Api(res, {
                        field: 'email',
                        error: 'This email is not registered.'
                    })
                else {
                    const code = generate(4)
                    remove({
                        table: 'Activations',
                        qty: 'deleteMany',
                        query: {
                            userId: user._id
                        }
                    }).then(() => {
                        save({
                            table: 'Activations',
                            data: {
                                userId: user._id,
                                code,
                                type: 'Forgot Password',
                                expiresAt: new Date(Date.now() + 30 * 60000)
                            }
                        }).then(() => {
                            Api(res, {
                                status: 'success',
                                verification: true,
                                user: {
                                    _id: user._id
                                }
                            })
                        })
                    })

                }
            })
            break;
        case 'checkUsername':
            let user = await find({
                table,
                qty: 'findOne',
                query: { userName: apiData.userName }
            })
            Api(res, user ? {
                error: 'This username is not available.'
            } : { status: 'success' })
            break;
        case 'codeVerification':
            //check the verification code
            let userToVerify: any = await find({
                table,
                qty: 'findOne',
                query: { email: apiData.email.toLowerCase() },
                project: { _id: 1 }
            })
            if (userToVerify) {
                const record = await find({
                    table: 'Activations',
                    qty: 'findOne',
                    query: {
                        userId: userToVerify._id,
                        code: apiData.code
                    },
                    project: {
                        userId: 1
                    }
                })
                Api(res, !record ? { error: 'You have entered a wrong verification code' } : {
                    status: 'success',
                    page: 'Reset Password',
                    User: userToVerify
                })
                //delete the activation

            }
            break;
        case 'Reset Password':
            const record = await find({
                table: 'Activations',
                qty: 'findOne',
                query: {
                    userId: apiData.user._id,
                    code: apiData.code
                },
                project: {
                    userId: 1
                }
            })
            if (record) {
                const updatedPassword = await generatePasswordHash(apiData.password);
                update({
                    table,
                    qty: 'updateOne',
                    query: { _id: apiData.user._id },
                    update: {
                        $set: {
                            password: updatedPassword
                        }
                    }
                }).then(() => {
                    remove({
                        table: 'Activations',
                        qty: 'deleteMany',
                        query: {
                            userId: apiData.user._id
                        }
                    })
                    Api(res, {
                        status: 'success',
                        message: 'Your password has been reset successfully.'
                    })
                }).catch((e:any) => {
                    console.log(e);
                });
            }
            else
                Api(res, {
                    error: 'Invalid request',
                    field: 'password'
                })
            break;
        default:
            break;
    }
}
=======
import { sendTosentry } from "./../sentry/index";
import {
  Api,
  deleteCategory,
  deleteS3BucketImage,
  deleteSocialFeeds,
  emailRegex,
  generate,
  maxPasswordLength,
  maxUsernameLength,
  minPasswordLength,
  minUsernameLength,
  passwordLengthMessage,
  returnThumbnail,
  saveImage,
  saveNotifications,
  sendBySocket,
  sendEmail,
  SendNotificationTemp,
  usernameLengthMessage,
} from "../helper";
import { generateJwtToken } from "../helper/auth";
import { aggregate, count, find, remove, save, update } from "../database";
import { generatePasswordHash } from "../database/models/users";
import verifyEmail from "../mailTemplates/verifyEmail";
import verifyPassCode from "../mailTemplates/verifyPassCode";
import passwordChanged from "../mailTemplates/passwordChanged";
import Mongoose from "mongoose";
import { DeviceProps, SocialFeed, UserProps } from "../types";
import { getUserImages } from "../imageOptimization";
require("dotenv").config({ path: "./src/.env" });
// import { sendTosentry } from "../sentry";
const table = "Users";
export const peerProps = {
  hidden: 1,
  email: 1,
  userName: 1,
  company: 1,
  dob: 1,
  camera: 1,
  image: 1,
  fullName: 1,
  mobile: 1,
};
export const getUsersByIds = async (userIds: string, myId?: string) => {
  try {
    let users = await find({
      table,
      qty: "find",
      query: {
        _id: {
          $in: userIds,
        },
      },
      project: myId
        ? {
          ...peerProps,
          isFollowed: {
            $in: [new Mongoose.Types.ObjectId(myId), "$followers"],
          },
        }
        : peerProps,
    });
    return users;
  } catch (e) {
    sendTosentry("getUsersByIds", e);
    return [];
  }
};
export const updateUserDevice = async (
  deviceInfo: DeviceProps,
  userId: string,
  action: "pull" | "push"
) => {
  try {
    let isDeviceSaved: any;
    let resp: any;
    if (action === "push")
      isDeviceSaved = await find({
        table,
        qty: "findOne",
        query: { _id: userId, "devices.device_id": deviceInfo.device_id },
        project: { _id: 1 },
      });
    if (!isDeviceSaved || action === "pull")
      return await update({
        table,
        qty: "updateOne",
        query: { _id: userId },
        update: {
          ["$" + action]: {
            devices: deviceInfo,
          },
        },
      });
    return resp;
  } catch (e) {
    sendTosentry("updateUserDevice", e);
    return e;
  }
};
export default async ({ res, apiData, clients }: any) => {
  const { action } = apiData;
  switch (action) {
    case "Register":
      // console.log(apiData);

      find({
        table,
        qty: "findOne",
        query: {
          $or: [
            { email: apiData.email.trim() },
            { userName: apiData.userName.trim() },
          ],
        },
        project: {
          email: 1,
          password: 1,
          userName: 1,
        },
      })
        .then((user: any) => {
          if (user)
            Api(res, {
              field: user.email === apiData.email ? "email" : "userName",
              error:
                user.email === apiData.email
                  ? "The email you entered is already registered!"
                  : "The username is not available!",
            });
          else {
            save({ table, data: apiData }).then((user: any) => {
              const code = apiData.isTest
                ? (process.env.testCode as string)
                : generate(4);
              //send emails
              sendEmail({
                recipients: [apiData.email?.trim()],
                text: "Email Verification",
                subject: "Email Verification",
                senderEmailAdress: process.env.senderEmail as string,
                html: verifyEmail({
                  code,
                  userName: apiData.userName || apiData.fullName,
                }),
              });
              save({
                table: "Activations",
                data: {
                  userId: user._id,
                  code,
                  expiresAt: new Date(Date.now() + 30 * 60000),
                },
              }).then(() => {
                Api(res, {
                  status: "success",
                  verification: true,
                  verificationType: "email",
                  user: Object.assign(user, { password: undefined }),
                });
              });
            });
          }
        })
        .catch((e) => {
          sendTosentry("Register", e);
        });
      break;
    case "Login":
      // let url = returnThumbnail(
      //   "https://anthology-prod-backend.s3.amazonaws.com/profile/9/2022-08-09-01-08-53/fc42539f-1016-471f-8434-c686d220b390",
      //   0
      // );
      find({
        table,
        qty: "findOne",
        query: {
          $or: [
            { email: apiData.email.trim().toLowerCase() },
            { userName: apiData.email.trim() },
          ],
        },
      })
        .then((user: any) => {
          if (user?.status === "suspended")
            Api(res, {
              field: "email",
              error:
                "This account cannot be accessed at this time. Please contact support.",
            });
          else if (
            !user ||
            !user.validPassword(apiData.password, user.password)
          )
            Api(res, {
              field: !user ? "email" : "password",
              error: !user
                ? "Email or username is not registered."
                : "You have entered invalid credentials",
            });
          else {
            let User = Object.assign(user, {
              password: undefined,
              followers: undefined,
            });

            if (!user.isActive) {
              const code = apiData.isTest
                ? (process.env.testCode as string)
                : generate(4);
              sendEmail({
                recipients: [apiData.email?.trim()],
                text: "Email Verification",
                subject: "Email Verification",
                senderEmailAdress: process.env.senderEmail as string,
                html: verifyEmail({
                  code,
                  userName: apiData.userName || apiData.fullName,
                }),
              });
              save({
                table: "Activations",
                data: {
                  userId: user._id,
                  code,
                  expiresAt: new Date(Date.now() + 30 * 60000),
                },
              })
                .then(() => {
                  Api(res, {
                    status: "success",
                    verification: true,
                    verificationType: "email",
                    User,
                  });
                })
                .catch((err) => {
                  console.log({ err });
                });
            } else {
              const jwtToken = generateJwtToken(user._id);
              const jwtRefreshToken = generateJwtToken(
                user._id + "refreshToken"
              );
              update({
                table,
                qty: "updateOne",
                query: { _id: user._id },
                update: { $set: { jwtRefreshToken, lastLogin: new Date() } },
              })
                .then(() => {
                  Api(res, {
                    User,
                    jwtToken,
                  });
                })
                .catch((err) => {
                  sendTosentry("Login", err); // check this update
                });
            }
          }
        })
        .catch((e) => {
          sendTosentry("Login", e);
        });
      break;
    case "fgPass": //forgot password
      //check if the email email is registered
      //generate an activation code and send it through email, save it to the db
      find({
        table,
        qty: "findOne",
        query: {
          email: apiData.email?.trim(),
        },
        project: {
          _id: 1,
          userName: 1,
          fullName: 1,
        },
      })
        .then((user: any) => {
          // console.log(user);
          if (!user)
            Api(res, {
              field: "email",
              error: "This email is not registered.",
            });
          else {
            const code = apiData.isTest
              ? (process.env.testCode as string)
              : generate(4);
            remove({
              table: "Activations",
              qty: "deleteMany",
              query: {
                userId: user._id,
              },
            }).then(async () => {
              sendEmail({
                recipients: [apiData.email?.trim()],
                text: "Password reset verification",
                subject: "Password reset verification",
                senderEmailAdress: process.env.senderEmail as string,
                html: verifyPassCode({
                  code,
                  userName: user.userName || user.fullName,
                }),
              });
              save({
                table: "Activations",
                data: {
                  userId: user._id,
                  code,
                  type: "Forgot Password",
                  expiresAt: new Date(Date.now() + 30 * 60000),
                },
              }).then((code) => {
                // console.log(code);
                Api(res, {
                  status: "success",
                  verification: true,
                  verificationType: "password",
                  user: {
                    _id: user._id,
                  },
                });
              });
            });
          }
        })
        .catch((e) => {
          sendTosentry("forgotPassword", e);
        });
      break;
    case "checkUsername":
      try {
        let user = await find({
          table,
          qty: "findOne",
          query: { userName: apiData.userName },
        });
        Api(
          res,
          user
            ? {
                error: "This username is not available.",
              }
            : { status: "success" }
        );
      } catch (e) {
        sendTosentry("checkUsername", e);
      }
      break;
    case "codeVerification":
      //check the verification code
      try {
        let userToVerify: any = await find({
          table,
          qty: "findOne",
          query: { email: apiData.email.toLowerCase().trim() },
          project:
            apiData.verificationType === "email" ? { password: 0 } : { _id: 1 },
        });
        if (userToVerify) {
          const record = await find({
            table: "Activations",
            qty: "findOne",
            query: {
              userId: userToVerify._id,
              code: apiData.code,
            },
            project: {
              userId: 1,
            },
          });
          // console.log(record);
          if (apiData.verificationType === "email") {
            const jwtToken = generateJwtToken(userToVerify._id);
            const jwtRefreshToken = generateJwtToken(
              userToVerify._id + "refreshToken"
            );
            update({
              table,
              qty: "updateOne",
              query: { _id: userToVerify._id },
              update: { $set: { jwtRefreshToken, isActive: true } },
            })
              .then(() => {
                Api(res, {
                  User: Object.assign(userToVerify, { jwtToken }),
                });
                remove({
                  table: "Activations",
                  qty: "deleteMany",
                  query: {
                    userId: userToVerify._id,
                  },
                });
              })
              .catch((e) => {
                sendTosentry("codeVerification", e);
              });
          } else
            Api(
              res,
              !record
                ? { error: "You have entered a wrong verification code" }
                : {
                    status: "success",
                    User: userToVerify,
                  }
            );
        } else res.status(403);
      } catch (e) {
        sendTosentry("codeVerification", e);
      }
      break;
    case "Reset Password":
      try {
        const record = await find({
          table: "Activations",
          qty: "findOne",
          query: {
            userId: apiData.user._id,
            code: apiData.code,
          },
          project: {
            userId: 1,
          },
        });
        if (record) {
          const updatedPassword = await generatePasswordHash(apiData.password);
          update({
            table,
            qty: "findOneAndUpdate",
            query: { _id: apiData.user._id },
            update: {
              $set: {
                password: updatedPassword,
              },
            },
            options: { returnOriginal: true, projection: { email: 1, _id: 0 } },
          })
            .then((user: any) => {
              remove({
                table: "Activations",
                qty: "deleteMany",
                query: {
                  userId: apiData.user._id,
                },
              });
              sendEmail({
                recipients: [user.email],
                text: "Password changed",
                subject: "Password changed",
                senderEmailAdress: process.env.senderEmail as string,
                html: passwordChanged(),
              });

              Api(res, {
                status: "success",
                message: "Your password has been reset successfully.",
                passwordReset: true,
              });
            })
            .catch((e: any) => {
              console.log(e);
              sendTosentry("resetPassword", e);
            });
        } else
          Api(res, {
            error: "Invalid request",
            field: "password",
          });
      } catch (e) {
        sendTosentry("resetPassword", e);
      }
      break;
    case "resendCode":
      find({
        table,
        qty: "findOne",
        query: { email: apiData.email.toLowerCase().trim() },
        project: { _id: 1, userName: 1, fullName: 1 },
      })
        .then((user: any) => {
          let code = apiData.isTest
            ? (process.env.testCode as string)
            : generate(4);
          let text =
            apiData.verificationType === "email"
              ? "Email Verification"
              : "Password reset verification";
          let obj = { code, userName: user.userName || user.fullName };
          sendEmail({
            recipients: [apiData.email?.trim()],
            text,
            subject: text,
            senderEmailAdress: process.env.senderEmail as string,
            html:
              apiData.verificationType === "email"
                ? verifyEmail(obj)
                : verifyPassCode(obj),
          });
          update({
            table: "Activations",
            qty: "updateOne",
            query: { userId: user._id },
            update: { $set: { code } },
          }).then((resp) => {
            Api(res, {
              status: "success",
            });
          });
        })
        .catch((e) => {
          sendTosentry("resendCode", e);
        });
      break;
    case "getUserData":
      // try {
      let isFollowing;
      let User: any = await find({
        table,
        qty: "findOne",
        query: {
          _id: apiData.peerId || apiData.userId,
        },
        project: {
          followers: 1,
          _id: 1,
        },
      });
      let followings = await count({
        table,
        query: {
          followers: apiData.peerId || apiData.userId,
        },
      });
      if (apiData.peerId)
        isFollowing = Boolean(
          await find({
            table,
            qty: "findOne",
            query: {
              _id: apiData.peerId,
              followers: new Mongoose.Types.ObjectId(apiData.userId),
            },
            project: { _id: 1 },
          })
        );
      //get Portfolios
      const portfolios = await find({
        table: "SocialFeeds",
        qty: "find",
        query: {
          createdBy: apiData.peerId || apiData.userId,
          type: "portfolio",
        },
        sort: { index: 1, updatedAt: -1, createdAt: -1 },
        limit: 12,
        project: {
          name: 1,
          media: { $elemMatch: { isCoverPhoto: true } },
          mediaLength: { $size: "$media" },
        },
      });
      let lastPortfolio: any = await find({
        table: "SocialFeeds",
        qty: "findOne",
        query: {
          createdBy: apiData.peerId || apiData.userId,
          type: "portfolio",
        },
        sort: { index: 1, updatedAt: -1, createdAt: -1 },
      });

      Api(res, {
        user: {
          followings,
          followers: User?.followers?.length,
        },
        isFollowing,
        portfolios,
        lastPortfolioId: lastPortfolio?._id,
      });
      // } catch (e){
      //   sendTosentry("getUserData", e)
      // }
      break;
    case "getFollows":
      try {
        let users;
        const getUsers = async (query: any) => {
          query = apiData.searchValue
            ? {
                ...query,
                $or: [
                  {
                    fullName: {
                      $regex: apiData.searchValue,
                      $options: "i",
                    },
                  },
                  {
                    userName: {
                      $regex: apiData.searchValue,
                      $options: "i",
                    },
                  },
                ],
              }
            : query;

          let peersSize: any;
          if (apiData.pageNumber === 0)
            peersSize = await count({ table, qty: "find", query });
          const result = await find({
            table,
            qty: "find",
            query,
            project: peerProps,
            sort: {
              fullName: 1,
              userName: 1,
            },
            limit: 10,
            skip: apiData.pageNumber,
          });
          return {
            peersSize,
            peers: result,
          };
        };
        if (apiData.type === "Following")
          users = await getUsers({
            followers: apiData.peerId || apiData.userId,
          });
        else {
          let user: any = await find({
            table,
            qty: "findOne",
            query: {
              _id: apiData.peerId || apiData.userId,
            },
            project: {
              followers: 1,
            },
          });
          users = await getUsers({ _id: { $in: user.followers } });
        }
        Api(res, users);
      } catch (e) {
        sendTosentry("getFollows", e);
      }
      break;
    case "removeFollow":
      update({
        table,
        qty: "updateOne",
        query: {
          _id: apiData.type === "Following" ? apiData.peerId : apiData.userId,
        },
        update: {
          $pull: {
            followers: new Mongoose.Types.ObjectId(
              apiData.type === "Following" ? apiData.userId : apiData.peerId
            ),
          },
        },
      })
        .then((resp) => {
          Api(res, {
            status: "success",
          });
        })
        .catch((e) => {
          sendTosentry("removeFollows", e);
        });
      break;
    case "followUnfollow":
      update({
        table,
        qty: "updateOne",
        query: {
          _id: apiData.peerId,
        },
        update: {
          [apiData.isFollowing ? "$pull" : "$addToSet"]: {
            followers: new Mongoose.Types.ObjectId(apiData.userId),
          },
        },
      })
        .then(async (resp) => {
          if (!apiData.isFollowing) {
            await SendNotificationTemp({
              sender: apiData.userId,
              recipient: apiData.peerId,
              template: "NEW_FOLLOWER",
            });
          }
          Api(res, { status: "success" });
        })
        .catch((e) => {
          sendTosentry("followUnfollow", e);
        });
      break;
    case "updateUser":
      //check if username or email is taken
      find({
        table,
        qty: "findOne",
        query: {
          _id: { $ne: apiData.userId },
          $or: [{ email: apiData.email }, { userName: apiData.userName }],
        },
        project: {
          email: 1,
          userName: 1,
        },
      })
        .then((user: any) => {
          //
          if (!user) {
            let error: any;
            if (!emailRegex.test(apiData.email))
              //if the email is invalid
              error = {
                error: "Please enter a valid email address.",
                field: "email",
              };
            else if (
              apiData.userName.length < minUsernameLength ||
              apiData.userName.length > maxUsernameLength
            )
              error = {
                field: "userName",
                error: usernameLengthMessage,
              };

            if (error) Api(res, error);
            else {
              // console.log("saveUser");
              delete apiData.password;
              update({
                table,
                qty: "findOneAndUpdate",
                query: {
                  _id: apiData.userId,
                },
                update: {
                  $set: apiData,
                },
                options: {
                  returnOriginal: false,
                  projection: {
                    followers: 0,
                    password: 0,
                  },
                },
              }).then((resp) => {
                Api(res, {
                  status: "success",
                  message: "Profile has been updated.",
                  user: resp,
                });
              });
            }
            // if(emailRegex.)
          } else {
            let error =
              (apiData.email === user.email ? "Email" : "Username") +
              " is already taken.";
            let field = apiData.email === user.email ? "email" : "userName";
            Api(res, {
              error,
              field,
            });
          }
        })
        .catch((e) => {
          sendTosentry("updateUser", e);
        });
      break;
    case "updateProfPic":
      const updateUser = (image?: string) =>
        update({
          table,
          qty: "findOneAndUpdate",
          query: {
            _id: apiData.userId,
          },
          update: {
            $set: {
              image: image || null,
            },
          },
          options: {
            returnOriginal: true,
            projection: {
              image: 1,
              _id: 0,
            },
          },
        })
          .then((user: any) => {
            if (user.image) deleteS3BucketImage(user.image);
            setTimeout(() => {
              Api(res, image || null);
            }, 2000);
          })
          .catch((e) => {
            sendTosentry("updateUser", e);
          });

      if (!apiData.newImage) updateUser();
      else {
        try {
          let image = await saveImage({
            _id: apiData.userId,
            folder: "profile",
            base64: apiData.newImage,
          });
          updateUser(image as any);
        } catch (e) {
          sendTosentry("updateUser", e);
        }
      }
      break;
    case "deleteAccount":
      //delete user personal information/details
      //delete followers
      //delete all categories created by user
      //delete all user portfolios
      try {
        const userToDelete: any = await remove({
          table,
          qty: "findOneAndDelete",
          query: {
            _id: apiData.userId,
          },
          projection: {
            image: 1,
          },
        });
        if (userToDelete?.image) deleteS3BucketImage(userToDelete.image);
        await update({
          table,
          qty: "updateMany",
          query: {
            followers: new Mongoose.Types.ObjectId(apiData.userId),
          },
          update: {
            $pull: {
              followers: new Mongoose.Types.ObjectId(apiData.userId),
            },
          },
        });
        await deleteCategory({ createdBy: apiData.userId });
        await deleteSocialFeeds({ createdBy: apiData.userId });
        if (res)
          Api(res, { message: "Account has been deleted.", status: "success" });
      } catch (e) {
        sendTosentry("deleteAccount", e);
      }
      break;
    case "changePass":
      try {
        let error: any;
        //check if new password is equal to confirm password
        if (
          apiData.newPass.length < minPasswordLength ||
          apiData.newPass.length > maxPasswordLength
        )
          error = { field: "newPass", value: passwordLengthMessage };
        else if (apiData.newPass !== apiData.cPass)
          error = { field: "cPass", value: "Password did not match" };

        if (error) Api(res, { error });
        else {
          const userToChange: any = await find({
            table,
            qty: "findOne",
            query: {
              _id: apiData.userId,
            },
            project: {
              password: 1,
              email: 1,
              _id: 0,
            },
          });
          if (
            !userToChange.validPassword(apiData.oldPass, userToChange.password)
          )
            Api(res, {
              error: {
                field: "oldPass",
                value: "Please enter a valid password",
              },
            });
          else {
            const newPass = await generatePasswordHash(apiData.newPass);
            // console.log(newPass);
            update({
              table,
              qty: "updateOne",
              query: {
                _id: apiData.userId,
              },
              update: {
                $set: {
                  password: newPass,
                },
              },
            })
              .then((user) => {
                Api(res, { message: "Password changed successfully!" });
                sendEmail({
                  recipients: [userToChange.email],
                  text: "Password changed",
                  subject: "Password changed",
                  senderEmailAdress: process.env.senderEmail as string,
                  html: passwordChanged(),
                });
              })
              .catch((e) => {
                sendTosentry("changePass", e);
              });
          }
        }
      } catch (e) {
        sendTosentry("changePass", e);
      }
      break;
    case "userFeedBack":
      save({
        table: "FeedBacks",
        data: {
          ...apiData,
          createdBy: new Mongoose.Types.ObjectId(apiData.userId),
        },
      })
        .then((feedback: any) => {
          Api(res, { message: "Feedback sent successfully" });
        })
        .catch((e) => {
          sendTosentry("userFeedback", e);
        });
      break;
    case "search":
      const limit = 6; //apiData.selectedOption === "All" ? 5 : 10;
      const searchUsers = async () => {
        try {
          let users = await aggregate({
            table,
            array: [
              !apiData.searchValue ? { $sample: { size: 5 } } : null,
              {
                $match: !apiData.searchValue
                  ? {
                      image: { $exists: true },
                    }
                  : {
                      $or: [
                        {
                          fullName: {
                            $regex: apiData.searchValue,
                            $options: "i",
                          },
                        },
                        {
                          userName: {
                            $regex: apiData.searchValue,
                            $options: "i",
                          },
                        },
                      ],
                    },
              },
              {
                $project: {
                  userName: 1,
                  fullName: 1,
                  image: 1,
                  hidden: 1,
                },
              },
              {
                $sort: {
                  fullName: 1,
                  userName: 1,
                },
              },
              {
                $skip: limit * apiData.pageNumber,
              },
              {
                $limit: limit,
              },
            ].filter((a) => a !== null),
          });
          return users;
        } catch (e) {
          sendTosentry("search", e);
        }
      };
      const searchPortfolios = async () => {
        try {
          const portfolios: any = await aggregate({
            table: "SocialFeeds",
            array: [
              !apiData.searchValue ? { $sample: { size: 5 } } : null,
              {
                $match: !apiData.searchValue
                  ? {
                      type: "portfolio",
                    }
                  : {
                      type: "portfolio",
                      $or: [
                        {
                          name: {
                            $regex: apiData.searchValue,
                            $options: "i",
                          },
                        },
                        {
                          categories: {
                            $regex: apiData.searchValue,
                            $options: "i",
                          },
                        },
                      ],
                    },
              },
              {
                $sort: {
                  name: 1,
                  categories: 1,
                },
              },
              {
                $skip: limit * apiData.pageNumber,
              },
              {
                $limit: limit,
              },
              {
                $project: {
                  name: 1,
                  mediaLength: { $size: "$media" },
                  createdBy: 1,
                  media: {
                    $filter: {
                      input: "$media",
                      as: "media",
                      cond: { $eq: ["$$media.isCoverPhoto", true] },
                    },
                  },
                },
              },
            ].filter((a) => a !== null),
          });
          const createdByIds = portfolios.map((a: any) => a.createdBy);
          const users: any = await getUsersByIds(createdByIds);
          return portfolios.map((portfolio: any) =>
            Object.assign(portfolio, {
              createdBy: users.find(
                (user: UserProps) =>
                  user._id.toString() === portfolio.createdBy.toString()
              ),
            })
          );
        } catch (e) {
          sendTosentry("search", e);
        }
      };
      try {
        let returnObj =
          apiData.selectedOption === "All"
            ? {
                profiles: await searchUsers(),
                portfolios: await searchPortfolios(),
              }
            : apiData.selectedOption === "Profile"
            ? {
                profiles: await searchUsers(),
              }
            : {
                portfolios: await searchPortfolios(),
              };
        Api(res, returnObj);
      } catch (e) {
        sendTosentry("search", e);
      }
      break;
    case "getNotifications":
      try {
        let lastNotification: any;
        let Qry = {
          recipient: apiData.userId,
        };
        if (apiData.pageNumber === 0)
          lastNotification = await find({
            table: "Notifications",
            qty: "findOne",
            query: Qry,
            sort: { createdAt: 1 },
            project: { _id: 1 },
          });
        let notifications: any = await find({
          table: "Notifications",
          qty: "find",
          query: Qry,
          sort: {
            createdAt: -1,
          },
          skip: apiData.pageNumber * 15,
          limit: 15,
          project: {
            recipient: 0,
            _id: 0,
            __v: 0,
          },
        });
        const senderIds = notifications.map((a: any) => a.sender);
        const Users: any = await find({
          table,
          qty: "find",
          query: { _id: { $in: senderIds } },
          project: {
            fullName: 1,
            userName: 1,
            image: 1,
            _id: 1,
            isFollowed: {
              $in: [new Mongoose.Types.ObjectId(apiData.userId), "$followers"],
            },
          },
        });

        const SocialFeedsIds = notifications
          .map((a: any) => a.socialFeedId)
          .filter((q: string) => Boolean(q));
        let SociaFeeds: any = [];
        if (SocialFeedsIds.length)
          SociaFeeds = await find({
            table: "SocialFeeds",
            qty: "find",
            query: {
              _id: { $in: SocialFeedsIds },
            },
            project: {},
          });

        let Notifications: any = notifications.map((a: any) => {
          let social = SociaFeeds.find(
            (SocialFeed: SocialFeed) =>
              SocialFeed._id.toString() === a.socialFeedId?.toString()
          );
          return {
            socialFeedId: a.socialFeedId,
            message: a.message,
            read: a.read,
            viewed: a.viewed,
            notificationType: a.notificationType,
            createdAt: a.createdAt,
            socialItem: social
              ? {
                  _id: social?._id,
                  liked: social.likes
                    .map((a: any) => a.likedBy?.toString())
                    .includes(apiData.userId),
                  likes: social.likes.length,
                  type: social.type,
                  flashChallengeId: social.flashChallengeId,
                  createdAt: social.createdAt,
                  coverImageUrl: social.media[0].image,
                }
              : null,
            sender: Users.find(
              (User: UserProps) => User._id.toString() === a.sender.toString()
            ),
          };
        });
        Api(res, { Notifications, lastNotificationId: lastNotification?._id });
      } catch (e) {
        sendTosentry("getNotification", e);
      }
      break;
    case "regenerateJwtToken":
      find({
        table,
        qty: "findOne",
        query: {
          _id: apiData.userId,
          jwtRefreshToken: apiData.jwtToken,
        },
      })
        .then((user: any) => {
          const jwtToken = generateJwtToken(user._id);
          const jwtRefreshToken = generateJwtToken(user._id + "refreshToken");
          if (user) {
            update({
              table,
              qty: "updateOne",
              query: { _id: user._id },
              update: { $set: { jwtRefreshToken } },
            }).then(() => {
              Api(res, {
                User,
                jwtToken,
              });
            });
          } else {
            Api(res, {
              message: "You are required to logout all previous sessions",
              jwtRefreshToken,
              jwtToken,
            });
          }
        })
        .catch((e) => {
          sendTosentry("regenerateJwtToken", e);
        });
      break;
    case "socialConnected":
      update({
        table,
        qty: "updateOne",
        query: { _id: apiData.userId },
        update: {
          $set: apiData.data
            ? {
                [apiData.social]: apiData.data,
              }
            : {
                [apiData.social + ".connected"]: false,
                [apiData.social + ".lastDisconnect"]: new Date(),
              },
        },
      })
        .then((resp: any) => {
          if (apiData.data.ig_user_id)
            sendBySocket(
              apiData.userId,
              clients,
              {
                token: apiData.data.token,
                ig_user_id: apiData.data.ig_user_id,
                action: "connectedToInstagram",
              },
              "mobile"
            );
          else
            Api(res, {
              message: `You have successfully ${
                apiData.data ? "connected to" : "disconnected from"
              } ${apiData.social}`,
            });
        })
        .catch((e) => {
          sendTosentry("socialConnect", e);
        });
      break;
    case "isSocialConnected":
      try {
        const userSocial: any = await find({
          table,
          qty: "findOne",
          query: { _id: apiData.userId },
          project: { [apiData.social]: 1 },
        });

        const socialToken = userSocial[apiData.social];
        let responseMessage;
        if (!socialToken?.connected) responseMessage = "Not connected";
        else if (new Date() > new Date(socialToken.expiry)) {
          responseMessage = "Token expired";
        } else {
          responseMessage = socialToken.token;
        }
        Api(res, responseMessage);
      } catch (e) {
        sendTosentry("isSocialConnect", e);
      }
      break;
    case "getConnectedSocials":
      try {
        const connectedSocials: any = await find({
          table,
          qty: "findOne",
          query: { _id: apiData.userId },
          project: {
            "facebook.connected": 1,
            "instagram.connected": 1,
            _id: 0,
          },
        });
        Api(
          res,
          [
            connectedSocials.facebook.connected ? "Facebook" : null,
            connectedSocials.instagram.connected ? "Instagram" : null,
          ].filter((q) => q !== null)
        );
      } catch (e) {
        sendTosentry("getConnectedSocials", e);
      }
      break;
    case "fetchAWSCredentials":
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = process.env.AWS_REGION;
      Api(res, {
        accessKeyId,
        secretAccessKey,
        region,
      });
      break;
    default:
      break;
  }
};
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
