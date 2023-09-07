import Products from "./Controllers/products";
export const Api = (res: any, data: any, code?: number) => {
    res.status(code || 201).json(data)
},
    onRun = () => {
        Products({ data: { action: 'getSneakersData' } })
        setInterval(() => {
            Products({ data: { action: 'getSneakersData' } })
        }, 1000 * 60 * 60 * 24);
    },
    socketBroadCast = (sockets: any, data: any) => {
        let clients = sockets.list;
        Object.keys(clients).forEach((key) => {
            let socket = clients[key]
            try {
                if (socket) socket.send(JSON.stringify(data));
            } catch (e) {
                console.log(e);
            }
        });
    }