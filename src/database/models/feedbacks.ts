import mongoose, { Schema } from "mongoose";
const FeedbackSchema = new Schema({
fullName: {type: String, required: true},
email:{type: String, required: true},
feedBack:{type: String, required: true},
createdAt: {type: Date, default: Date.now},
createdBy: { type: Schema.Types.ObjectId, ref: "User" },

});
export default mongoose.model("Feedbacks", FeedbackSchema);