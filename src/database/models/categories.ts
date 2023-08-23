import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  id: Number,
  text: { type: String, required: true },
  status: Number,
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  image: String,
  slug: { type: String },
});
export default mongoose.model("categories", schema);
