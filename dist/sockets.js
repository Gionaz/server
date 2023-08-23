"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const auth_1 = require("./helper/auth");
exports.default = ({ http, clients }) => {
    const ws = new ws_1.default.Server({
        server: http,
        perMessageDeflate: {
            zlibDeflateOptions: {
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
            clientNoContextTakeover: true,
            serverNoContextTakeover: true,
            serverMaxWindowBits: 10,
            // Below options specified as default values.
            concurrencyLimit: 10,
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed.
        }
    });
    console.log("sockets initiated");
    ws.on('connection', (socket) => {
        console.log('user connected');
        socket.setMaxListeners(0);
        socket.on('message', (Data) => {
            const datam = JSON.parse(Data.toString());
            // if (datam.action === 'userClicked')
            //     sendBySocket(JSON.parse(Data.toString()).userId, clients, JSON.parse(Data.toString()))
            // else if (datam.action === 'developerOnline') {
            //     let socketId = Buffer.from(Date.now().toString()).toString("base64"),
            //         SocketId = datam.socketId || socketId
            //     socket.id = SocketId;
            //     devClients.saveClient(SocketId + '_web', socket);
            //     sendBySocket(SocketId, devClients, { action: 'socketId', socketId }, 'web')
            // }
            // else
            (0, auth_1.authSoket)(Data.toString()).then((data) => {
                if (data.action === 'userOnline') {
                    socket.id = data.userId + '_' + data.platform;
                    clients.saveClient(data.userId + '_' + data.platform, socket);
                }
                socket.on('close', () => {
                    clients.deleteClient(socket.id);
                });
            }).catch(e => { console.log('error ' + e); });
        });
    });
    ws.on('error', (e) => {
        console.log(e);
    });
    ws.on('listening', () => {
        console.log('Listening for sockets connection');
    });
};
