import WebSocket from 'ws'
import { authSoket } from './helper/auth';
export default ({ http, clients }: any) => {
    const ws = new WebSocket.Server({
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
            clientNoContextTakeover: true, // Defaults to negotiated value.
            serverNoContextTakeover: true, // Defaults to negotiated value.
            serverMaxWindowBits: 10, // Defaults to negotiated value.
            // Below options specified as default values.
            concurrencyLimit: 10, // Limits zlib concurrency for perf.
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed.
        }
    });
    console.log("sockets initiated")

    ws.on('connection', (socket: any) => {
        console.log('user connected')
        socket.setMaxListeners(0);
        socket.on('message', (Data: any) => {
            const datam = JSON.parse(Data.toString())
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
            authSoket(Data.toString()).then((data: any) => {
                if (data.action === 'userOnline') {
                    socket.id = data.userId + '_' + data.platform;
                    clients.saveClient(data.userId + '_' + data.platform, socket)
                }
                socket.on('close', () => {
                    clients.deleteClient(socket.id)
                })
            }).catch(e => { console.log('error ' + e) })
        })

    })
    ws.on('error', (e) => {
        console.log(e)
    })
    ws.on('listening', () => {
        console.log('Listening for sockets connection')
    })

}

