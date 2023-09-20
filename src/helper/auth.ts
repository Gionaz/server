import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from 'crypto'
import { Crypt, Rsa } from "hybrid-crypto-ts";
import fs from "fs";
import path from "path";
import { Api, validateForm } from "../helper";

const crypt = new Crypt(),
    rsa = new Rsa(),
    private_key = fs.readFileSync(path.resolve("./keys/encrypt.pem"), {
        encoding: "utf8",
    });
export const generateJwtToken = (userId: string) => {
    return jwt.sign(
        {
            data: userId,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1y" }
    );
},
    generateHex = () => {
        let hex = crypto.randomBytes(64).toString("hex")
        return hex
    },
    generateRSAKeys = () => {
        rsa.generateKeyPair().then((keyPair: any) => {
            var publicKey = keyPair.publicKey;
            var privateKey = keyPair.privateKey;
            console.log("keys", publicKey);
            console.log("keys", privateKey);
        });
    },
    verifyJWT = (req: Request, res: Response, next: NextFunction) => {
        if (Object.keys(req?.body).length) {
            let decrypted = crypt.decrypt(private_key, JSON.stringify(req.body));
            req.body = JSON.parse(decrypted.message);
            // console.log(req.body);
            const { action } = req.body;
            const whiteListEndPoints = [
                "Sign In",
                "Sign Up"
            ];
            if (whiteListEndPoints.includes(req.body.action)) {
                let error = validateForm(req.body, action);
                if (error.field)
                    Api(res, error);
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