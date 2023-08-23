"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const sockets_1 = __importDefault(require("./sockets"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const clients_1 = __importDefault(require("./clients"));
require("./database/config");
const auth_1 = require("./helper/auth");
const http_1 = __importDefault(require("http"));
// import "./migration";
const modules_1 = __importDefault(require("./modules"));
const helper_1 = require("./helper");
const port = 3001;
const app = (0, express_1.default)(), clients = new clients_1.default(), http = new http_1.default.Server(app);
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "50mb" }));
//configure the JWT middleware
app.use(auth_1.verifyJWT);
app.post("/", (req, res) => {
    const { module } = req.body;
    try {
        modules_1.default[module]({ apiData: req.body, res });
    }
    catch (e) {
        res.status(400);
    }
});
app.get("/instagram", (req, res) => {
    (0, auth_1.getInstagramAccessToken)(req.query.code)
        .then((resp) => {
        console.log(resp.data);
        if (resp.data)
            modules_1.default.Users({
                apiData: {
                    action: "socialConnected",
                    userId: JSON.parse((0, auth_1.decodeBase64)(req.query.state)).userId,
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
(0, sockets_1.default)({ http, clients });
http.listen(port, () => {
    console.log(`App is running on port ${port}`);
    (0, helper_1.onRun)();
    // getUserImages()
    // deleteAccounts()
});
