import mongoose, { Schema } from "mongoose";
const FlashChallengeSchema = new Schema({
  flashId: Number,
  topic: { type: String, required: true },
  sponsoredBy: { type: Schema.Types.ObjectId, ref: "Sponsor" } || null,
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, required: true },
  activated: { type: Boolean, default: false },
  skipped: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  joined: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
export default mongoose.model("FlashChallenge", FlashChallengeSchema);
