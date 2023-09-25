import mongoose from "mongoose";

const schema = new mongoose.Schema({
  productNumber: Number,
  title: String,
  price: Number,
  description: String,
  images: [String],
  createdAt: { type: Date, default: new Date() },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

export default mongoose.model("products_to_sell", schema);
