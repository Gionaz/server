import mongoose, {Schema} from "mongoose";

interface ISellItem extends Document {
    productNumber: string;
    title: string;
    price: number;
    description?: string;
    category: string;
    updatedAt?: Date; // Add 'updatedAt' property
}

const SellItemSchema = new mongoose.Schema<ISellItem>({
    productNumber: {type: String, required: true},
    title: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String},
    category: {type: String, required: true}
})

SellItemSchema.pre("save", function (next) {
    const sellitem = this;
    sellitem.updatedAt = new Date();

    return next();
})

export default mongoose.model("sellitem", SellItemSchema)