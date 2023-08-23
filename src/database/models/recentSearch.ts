import mongoose, { Schema } from "mongoose";
const RecentSearchSchema = new Schema({
id: Number,
text: String,
updatedAt: {type: Date, default: Date.now},
createdAt: {type: Date, default: Date.now},
userId: {type: Schema.Types.ObjectId, ref: "User"},
isDelete:{type: Boolean, default:false},
userSearchedId: {
    type: Schema.Types.ObjectId, 
    ref: "User"}
});
export default mongoose.model("RecentSearch", RecentSearchSchema);