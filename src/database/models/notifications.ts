import mongoose, { Schema } from "mongoose";
const NotificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  socialFeedId: {
    type: Schema.Types.ObjectId,
    ref: "socialfeeds"
  },
  message: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  viewed: {
    type: Boolean,
    default: false,
  },
  notificationType: {
    type: String,
    required: true,
  },
});
export default mongoose.model("Notifications", NotificationSchema);
