
import mongoose from "mongoose";

const activationSchema = new mongoose.Schema<any>({
    userId: { required: true, type: mongoose.Types.ObjectId, ref: 'Users' },
    code: { required: true, type: String },
    type:{type:String, default:'Sign up'},
    expiresAt: { type: Date, required: true }
})
export default mongoose.model('activations', activationSchema)
/** Run this command
 * db.activations.createIndex(
   { "expiresAt": 1 },
   { expireAfterSeconds: 0 }
)
 */