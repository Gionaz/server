import mongoose, { Schema } from "mongoose";


const SellItemSchema = new mongoose.Schema({
    productNumber: { type: Number },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    images: [String],
    updatedAt: Date,
    category: { type: String, required: true }
})

SellItemSchema.pre("save", function (next) {
    const sellitem = this;
    sellitem.updatedAt = new Date();
    return next();
})

export default mongoose.model("sellitem", SellItemSchema)