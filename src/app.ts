import dotenv from "dotenv";
dotenv.config();
import express, { Application } from 'express'
// import Sockets from './sockets'
import cors from 'cors'
import bodyParser from 'body-parser'
import Clients from './clients'
import "./database/config";
// import { decodeBase64, getInstagramAccessToken, verifyJWT } from "./helper/auth";
import Http from 'http';
// import Modules from "./modules";
import path from "path";
import Controllers from './Controllers'
import { onRun, socketBroadCast } from "./helper";
import Sockets from './sockets'
import { verifyJWT } from "./helper/auth";
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';

const port: number = parseInt(process.env.port as string);
const app: Application = express(),
    clients = new Clients(),
    http = new Http.Server(app);
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use('/', express.static(path.join(__dirname, process.env.env === 'dev' ? '../dist/public' : '../public')));



app.use(verifyJWT);
//checking server side connection
Sockets({ http, clients })
app.post("/", (req, res) => {
    try {
        (Controllers as any)[req.body.controller]({
            data: req.body,
            res
        })
    } catch (e) {
        res.status(400);
    }

});

// Sockets({ http, clients });
http.listen(port, () => {
    console.log(`App is running on port ${port}`);
    if (process.env.env === 'prod')
        onRun()
    // console.log(generateHex())
})