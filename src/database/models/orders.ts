import mongoose, { Schema } from "mongoose";

const schema = new mongoose.Schema({
  goatProductId: Number,
  title: String,
  price: Number,
  createdAt: { type: Date, default: new Date() },
});

export default mongoose.model("orders", schema);
