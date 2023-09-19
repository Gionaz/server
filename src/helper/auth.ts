import jwt from "jsonwebtoken";
import crypto from 'crypto'

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
}