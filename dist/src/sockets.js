"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
// import { sendBySocket } from './functions';
// import { authSoket } from './functions/auth';
// import modules from './modules';
const Controllers_1 = __importDefault(require("./Controllers"));
exports.default = ({ http, clients }) => {
    const production = process.env.Env === 'production';
    const ws = new ws_1.default.Server({
        // [production ? 'port' : 'server']: production ? 8001 : http,
        server: http,
        perMessageDeflate: {
            zlibDeflateOptions: {
                // See zlib defaults.
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
            // Other options settable:
            clientNoContextTakeover: true,
            serverNoContextTakeover: true,
            serverMaxWindowBits: 10,
            // Below options specified as default values.
            concurrencyLimit: 10,
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed.
        }
    });
    ws.on('connection', (socket) => {
        console.log('user connected');
        socket.setMaxListeners(0);
        socket.on('message', (Data) => {
            const datam = JSON.parse(Data.toString());
            if (datam.module)
                Controllers_1.default[datam.module]({ data: datam, clients });
            else if (datam.action === 'userOnline') {
                socket.id = datam.userId + '_' + datam.platform;
                clients.saveClient(datam.userId + '_' + datam.platform, socket);
            }
            socket.on('close', () => {
                clients.deleteClient(socket.id);
            });
            // }).catch((e:any) => { console.log('error ' + e) })
        });
    });
    ws.on('error', (e) => {
        console.log(e);
    });
    ws.on('listening', () => {
        console.log('Listening for sockets connection');
    });
};
