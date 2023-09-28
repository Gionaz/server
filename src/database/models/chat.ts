import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
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
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: 'products'
    }
})
export default mongoose.model('chats', schema)