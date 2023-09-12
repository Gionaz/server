import mongoose from "mongoose";

const schema = new mongoose.Schema({
  goatProductId: Number,
  title: String,
  price: Number,
  description: String,
  matchProductId: Number,
  images: [String],
  createdAt: { type: Date, default: new Date() },
});

export default mongoose.model("ProductsToSell", schema);
