import mongoose from "mongoose";

const schema = new mongoose.Schema({
    productId: { type: mongoose.Types.ObjectId, ref: 'products' },
    items: [
        {
            size: { type: Number, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
    userId: { type: mongoose.Types.ObjectId, ref: 'users' },
    category: { type: String, default: 'Sneakers' }
})

const sellSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'users' },
    stashId: { type: mongoose.Types.ObjectId, ref: 'stash' },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    date:{type:Date, default: new Date()}
})

export const StashSells = mongoose.model('stash_sells', sellSchema)

export default mongoose.model('stash', schema)