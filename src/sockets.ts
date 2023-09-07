import WebSocket from 'ws'
// import { sendBySocket } from './functions';
// import { authSoket } from './functions/auth';
// import modules from './modules';
import Controlers from './Controllers'
export default ({ http, clients }: any) => {
    const production = process.env.Env === 'production'
    const ws = new WebSocket.Server({
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
            clientNoContextTakeover: true, // Defaults to negotiated value.
            serverNoContextTakeover: true, // Defaults to negotiated value.
            serverMaxWindowBits: 10, // Defaults to negotiated value.
            // Below options specified as default values.
            concurrencyLimit: 10, // Limits zlib concurrency for perf.
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed.
        }
    });

    ws.on('connection', (socket: any) => {
        console.log('user connected')
        socket.setMaxListeners(0);
        socket.on('message', (Data: any) => {
            const datam = JSON.parse(Data.toString())
            if (datam.module)
                (Controlers as any)[datam.module]({ data: datam, clients })
            else if (datam.action === 'userOnline') {
                socket.id = datam.userId + '_' + datam.platform;
                clients.saveClient(datam.userId + '_' + datam.platform, socket)
            }
            socket.on('close', () => {
                clients.deleteClient(socket.id)
            })
            // }).catch((e:any) => { console.log('error ' + e) })
        })

    })
    ws.on('error', (e) => {
        console.log(e)
    })
    ws.on('listening', () => {
        console.log('Listening for sockets connection')
    })

}
