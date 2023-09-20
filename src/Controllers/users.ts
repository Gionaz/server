import { find, save, update } from "../database";
import { Api } from "../helper";
import { generateJwtToken } from "../helper/auth";

const table = 'Users'
export default ({ data, res }: any) => {
  const { action } = data;
  switch (action) {
    case "Sign Up":
      //check if in the database (email, or the username)
      find({
        table,
        qty: "findOne",
        query: {
          $or: [{ userName: data.userName }, { email: data.email }],
        },
        project: {
          email: 1,
          userName: 1,
        },
      }).then((user: any) => {
        if (!user) {
          save({
            table,
            data: {
              ...data,
            },
          }).then((user: any) => {
            res.status(201).json({
              status: "success",
              message: "User has been registered",
              user,
            });
          });
        } else
          res.status(201).json({
            status: "error",
            message:
              data.email === user.email
                ? "The email is already registed."
                : "The username is not available.",
            field: data.email === user.email ? "email" : "userName",
          });
      });
      break;

    case "Sign In":
      // Check if the username or email exists in the database
      // console.log(data)
      find({
        table,
        qty: "findOne",
        query: {
          $or: [{ userName: data.email }, { email: data.email }],
        },
      }).then((user: any) => {
        if (!user) {
          Api(res, {
            status: "error",
            message: "Invalid credentials",
            field: "email",
          });
        } else {
          if (user.validPassword(data.password, user.password)) {
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
                  status: "success",
                  User: user,
                  jwtToken
                });
              })
              .catch((err) => {

              });

          } else {
            Api(res, {
              status: "error",
              message: "Invalid password",
              field: "password",
            });
          }
        }
      });
      break;
    case 'fetchAWSCredentials':
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
