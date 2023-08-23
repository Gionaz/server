import dotenv from "dotenv";
dotenv.config();
import express, { Application } from 'express'
import Sockets from './sockets'
import cors from 'cors'
import bodyParser from 'body-parser'
import Clients from './clients'
import "./database/config";
import { decodeBase64, getInstagramAccessToken, verifyJWT } from "./helper/auth";
import Http from 'http';
import fs from 'fs'
// import "./migration";
import Modules from "./modules";
import { onRun } from "./helper";
import { deleteAccounts, getUserImages } from "./imageOptimization";
import { sendTosentry } from "./sentry";

const port: number = 3001;
const app: Application = express(),
  clients = new Clients(),
  http = new Http.Server(app);
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
//configure the JWT middleware

app.use(verifyJWT);

app.post("/", (req, res) => {
  const { module } = req.body;
  try {
    Modules[module]({ apiData: req.body, res });
  } catch (e) {
    res.status(400);
  }
});
app.get("/instagram", (req, res) => {
  getInstagramAccessToken(req.query.code as string)
    .then((resp: any) => {
      console.log(resp.data);
      if (resp.data)
        Modules.Users({
          apiData: {
            action: "socialConnected",
            userId: JSON.parse(decodeBase64(req.query.state as string)).userId,
            data: {
              token: resp.data.access_token,
              ig_user_id: resp.data.user_id,
              connected: true,
              lastConnect: new Date(),
            },
            social: "instagram",
          },
          clients,
        });
      res.status(201).json("Connected");
    })
    .catch((error) => {
      console.log({ error });
    });
});

Sockets({ http, clients });
http.listen(port, () => {
  console.log(`App is running on port ${port}`);
  onRun();
  // getUserImages()
  // deleteAccounts()
});

