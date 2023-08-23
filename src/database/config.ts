import mongoose from "mongoose";
mongoose.set('strictQuery', false);
mongoose.connect(process.env.mongodb_url as string)
 
