import { find, save, update } from "../database";
import { Api, deleteS3BucketImage } from "../helper";
import { generateJwtToken } from "../helper/auth";
import { UserProps } from "../types/types";

const table = 'Users'
export default ({ data, res }: any) => {
  const { action } = data;
  const updateUserLogin = (user: UserProps) => {
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
  }
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
            updateUserLogin(user)
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
            updateUserLogin(user)


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
    case 'updateUserImage':
      update({
        table,
        qty: 'findOneAndUpdate',
        query: {
          _id: data.userId
        },
        update: {
          $set: {
            image: data.image
          }
        },
        options: {
          returnOriginal: true,
          projection: { image: 1, _id: 0 }
        }
      }).then((user: any) => {
        if (user.image)
          deleteS3BucketImage(user.image)
        //
        Api(res, { status: "success", message: "Profile has been updated" })
        //if remove profile image, delete the old one from AWS
      })
      break;
    default:
      break;
  }
};
