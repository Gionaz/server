<<<<<<< HEAD
import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import { Crypt } from 'hybrid-crypto-ts'
import fs from 'fs'
import path from 'path'
import { Api, validateForm } from '.';


const crypt = new Crypt()
const private_key = fs.readFileSync(path.resolve("./keys/dev_private.pem"), { encoding: "utf8" })
=======
import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Crypt } from "hybrid-crypto-ts";
import fs from "fs";
import path from "path";
import { Api, validateForm } from ".";
import { find } from "../database";
import { dev_jwt } from "../config";
import axios from "axios";
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915

const crypt = new Crypt();
const private_key = fs.readFileSync(path.resolve("./keys/dev_private.pem"), {
  encoding: "utf8",
});

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
<<<<<<< HEAD
    if (Object.keys(req.body).length) {
        let decrypted = crypt.decrypt(private_key, JSON.stringify(req.body));
        req.body = JSON.parse(decrypted.message);
        const { action } = req.body;
        const whiteListEndPoints = ['Register', 'Login', 'fgPass', 'codeVerification', 'Reset Password']
        if (whiteListEndPoints.includes(req.body.action)) {
            let error = validateForm(req.body, action)

            if (error.field)
                Api(res, error)
            else
                next()
        }
        else if (action === 'checkUsername')
            next()
        else {
            const authHeader: any = req.headers.authorization || req.headers.Authorization;
            if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
            const token = authHeader.split(' ')[1];
            jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET as string,
                (err: any, decoded: any) => {
                    if (err) return res.sendStatus(403); //invalid token
                    req.body.userId = decoded.UserInfo.username;
                    next();
                }
            );
            next();
        }
    }
    else
        return res.sendStatus(401)
},
    generateJwtToken = (userId: string) => {
        return jwt.sign({
            data: userId,
        }, process.env.app_jwt as string,
            { expiresIn: "7d" })
    }
=======
  // console.log(req.body.userId);
  if (process.env.isOmbati || (req.query.code && req.query.state)) next();
  else {
    if (Object.keys(req?.body).length) {
      let decrypted = crypt.decrypt(private_key, JSON.stringify(req.body));
      req.body = JSON.parse(decrypted.message);
      const { action } = req.body;
      const whiteListEndPoints = [
        "Register",
        "Login",
        "fgPass",
        "codeVerification",
        "Reset Password",
        "resendCode",
      ];
      if (whiteListEndPoints.includes(req.body.action)) {
        let error = validateForm(req.body, action);
        if (error.field) Api(res, error);
        else next();
      } else if (action === "checkUsername") next();
      else {
        const authHeader: any =
          req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
        const token = authHeader.split(" ")[1];
        jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET as string,
          (err: any, decoded: any) => {
            if (err) {
              console.log(err);
              return res.sendStatus(403); //invalid token
            } else {
              req.body.userId = decoded.data;
              next();
            }
          }
        );
      }
    } else return res.sendStatus(401);
  }
},
  generateJwtToken = (userId: string) => {
    return jwt.sign(
      {
        data: userId,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );
  },
  removeUndefined = (obj: any) => Object.entries(obj).reduce((a, [k, v]) => (v ? ((a as any)[k] = v, a) : a), {}),
  checkUserAuth = ({ token, platform }: any) => new Promise((resolve, reject) => {
    find({
      table: 'Users',
      qty: 'findOne',
      query: { [platform + 'JwtToken']: token },
      project: { status: 1, [platform + 'Token']: 1, _id: 0 }
    }).then((user: any) => resolve(user)).catch(e => reject(e))
  }),
  authSoket = (data: any) => new Promise((resolve, reject) => {
    try {
      let decrypted = crypt.decrypt(private_key, data),
        datam = JSON.parse(decrypted.message)
      // checkUserAuth({ token: datam.token, platform: datam.platform }).then((user: any) => {
      //   if (datam.action === 'developerOnline')
      //     resolve(removeUndefined(datam))
      //   else if (user)
      //     jwt.verify(datam.token, datam.platform === 'web' ? dev_jwt : user[datam.platform + 'Token'], (err: any, jwtResp: any) => {
      //       if (err)
      //         reject(err)
      //       else {
      //         datam.userId = jwtResp.data;
      //         datam.jwtToken = undefined;
      //         resolve(removeUndefined(datam))
      //       }
      //     })
      // }
      // )
      jwt.verify(
        datam.token,
        process.env.ACCESS_TOKEN_SECRET as string,
        (err: any, decoded: any) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              userId: decoded.data,
              ...datam
            })
          }
        }
      );
    } catch (e) {
      console.log('error')
    }
  }),
  decodeBase64 = (base64String: string) => {
    const decodedString = atob(base64String);
    return decodedString;
  },
  getInstagramAccessToken = async (code: string) => {
    const url = 'https://api.instagram.com/oauth/access_token';
    const params = new URLSearchParams({
      client_id: process.env.instagramAppId as string,
      client_secret: process.env.instagramSecret as string,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.instagramUrl as string
    });
    try {
      const resp = await axios.post(url, params)
      return resp
    } catch (e) {
      return e
    }
  }
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
