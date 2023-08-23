import mongoose, { Schema } from "mongoose";

const SocialFeedsSchema = new Schema({
  id: Number,
  createdAt: { type: Date, default: Date.now },
  name: { type: String },
  tags: {},
  location: {
    locName: String || null,
    coordinates: [Number],
    type: { type: String, default: "Point" },
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  isDelete: { type: Boolean, default: false },
  priority: { type: Number },
  likes: [
    {
      likedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      likedImages: [{ type: Schema.Types.ObjectId, ref: "SocialFeeds.media" }],
      createdAt: { type: Date, default: new Date() },
    },
  ],
  media: [
    {
      image: String,
      submissionId: Number,
      poiMediaId: Number, 
      isDeleted: Boolean,
      social: String,
      socialUrl: String,
      priority: Number,
      isCoverPhoto: Boolean,
      isUploaded: { type: Boolean},
      reported: { type: Boolean, default: false },
      reportedBy: [
        {
          createdBy: {
            type: Schema.Types.ObjectId,
            ref: "users",
          },
          messages: [{ type: String }],
        },
      ],
    },
  ],
  keywords: [String],
  categories: [String],
  // category: String,
  index: Number,
  type: {
    type: String,
    default: "portfolio",
  },
  flashChallengeId: { type: Schema.Types.ObjectId, ref: "FlashChallenge" },
  challengeId: Number,
  updatedAt: Date,
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isPrivate: Boolean,
  isHotspot: Boolean,
  approved: { type: Boolean, default: false },
  associatePOIId: { type: Schema.Types.ObjectId, ref: "SocialFeeds" },
});

export default mongoose.model("SocialFeeds", SocialFeedsSchema);
//make sure to add keywords in the migration
