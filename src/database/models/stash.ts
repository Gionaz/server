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

export default mongoose.model('stash', schema)