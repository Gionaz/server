import mongoose, { Schema } from "mongoose";

const PortfolioSchema = new Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: true,
  },
  tags: {
    type: String,
  },
  location: {
    type: String,
  },
  cordinates: [Number],
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  is_delete: {
    type: Boolean,
    default: false,
  },
  cover_image_url: {
    type: String,
  },
  priority: {
    type: Number,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  media: [
    {
      main_thumbnail: String,
      other_thumbnails: [String],
    },
  ],
});

export default mongoose.model("Portfolio", PortfolioSchema);
