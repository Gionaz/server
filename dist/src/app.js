"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
// import Sockets from './sockets'
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const clients_1 = __importDefault(require("./clients"));
require("./database/config");
// import { decodeBase64, getInstagramAccessToken, verifyJWT } from "./helper/auth";
const http_1 = __importDefault(require("http"));
// import Modules from "./modules";
const path_1 = __importDefault(require("path"));
const Controllers_1 = __importDefault(require("./Controllers"));
const helper_1 = require("./helper");
const sockets_1 = __importDefault(require("./sockets"));
const auth_1 = require("./helper/auth");
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';
const port = parseInt(process.env.port);
const app = (0, express_1.default)(), clients = new clients_1.default(), http = new http_1.default.Server(app);
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "50mb" }));
app.use('/', express_1.default.static(path_1.default.join(__dirname, process.env.env === 'dev' ? '../dist/public' : '../public')));
app.use(auth_1.verifyJWT);
//checking server side connection
(0, sockets_1.default)({ http, clients });
app.post("/", (req, res) => {
    try {
        Controllers_1.default[req.body.controller]({
            data: req.body,
            res
        });
    }
    catch (e) {
        res.status(400);
    }
});
// Sockets({ http, clients });
http.listen(port, () => {
    console.log(`App is running on port ${port}`);
    if (process.env.env === 'prod')
        (0, helper_1.onRun)();
    // console.log(generateHex())
});
