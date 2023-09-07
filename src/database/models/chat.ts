import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date()
    },
    isRead: {
        type: Boolean,
        default: false
    }
})
 export default mongoose.model('chats', schema)