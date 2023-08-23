import mongoose, { Schema } from "mongoose";
const SponsorSchema = new Schema({
  companyName: { type: String, required: true },
  companyLogo: { type: String, required: true },
  companyUrl: { type: String, required: true },
  offerPromo:{type: String},
  offerLink: {type: String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
export default mongoose.model("Sponsor", SponsorSchema);
