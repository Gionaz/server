import { find, save } from "../database"
import { Api, socketBroadCast } from "../helper"

export default ({
    data,
    res,
    clients
}: any) => {
    const { action } = data
    switch (action) {
        case 'newMessage':
            save({
                table: 'Chats',
                data: data.message
            }).then((chat: any) => {
                socketBroadCast(clients,
                    Object.assign(data, { _id: chat._id }))
            })
            break;
        case 'getMessages':
            find({
                table: 'Chats',
                qty: 'find',
                query: {
                    $or: [
                        { from: data.userId, to: data.peerId },
                        { from: data.peerId, to: data.userId }
                    ]
                }
            }).then((messages) => {
                Api(res, messages)
            })
            break;
        default:
            break;
    }

}