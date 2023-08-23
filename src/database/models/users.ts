<<<<<<< HEAD
import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  id: Number,
  password: { type: String },
  lastLogin: { type: Date, default: Date.now, },
  isSuperuser: { type: Boolean, default: false, },
=======
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  id: Number, // postgrel
  password: { type: String },
  lastLogin: { type: Date, default: Date.now },
  isSuperuser: { type: Boolean, default: false },
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
  fullName: { type: String, required: true },
  userName: { type: String },
  isStaff: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  dateJoined: { type: Date, default: Date.now },
<<<<<<< HEAD
  status: { type: String, default: "active", },
  signUpFrom: { type: String, default: "web", },
  email: { type: String, required: true, },
=======
  status: { type: String, default: "active" },
  signUpFrom: { type: String, default: "web" },
  email: { type: String, required: true },
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
  forgotPasswordToken: String,
  fbId: Number,
  isFbSyncExpired: { type: Boolean, default: false },
  fbName: String,
  instaId: Number,
<<<<<<< HEAD
  isInstaSyncExpired: { type: Boolean, default: false },
  instaName: String,
  bioHidden: { type: Boolean, default: false, },
  companyHidden: { type: Boolean, default: false, },
  hidden: [String],
  cameras: [String],
  image: String,//Ombati update
  imageThumbs: [String], //Ombati update
  jwtRefreshToken: String,
  devices: [
    {
      name: String,
=======
  dob: Date,
  company: String,
  mobile: String,
  bio: String,
  isInstaSyncExpired: { type: Boolean, default: false },
  instaName: String,
  hidden: [String],
  cameras: [String],
  camera: String,
  image: String, //Ombati update
  jwtRefreshToken: String,
  flashStats: {
    enteredPics: Number,
    currentStreak: Number,
    streaks: [],
    wonChallenges: Number,
  },
  devices: [
    {
      name: { type: String },
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
      active: {
        type: Boolean,
        default: false,
      },
      date_created: {
        type: Date,
        default: Date.now,
      },
      device_id: String,
      registration_id: String,
<<<<<<< HEAD
      type: String
    },
  ],
});

UserSchema.pre('save', function (next) {
  const user = this;
  user.email = user.email.trim()
  user.userName = user.userName?.trim()
  // If the password hasn't been modified, move on
  if (!user.isModified('password')) {
=======
      type: { type: String },
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  facebook: {
    token: String,
    expiry: Date,
    connected: Boolean,
    lastConnect: Date,
    lastDisconnect: Date,
  },
  instagram: {
    token: String,
    expiry: Date,
    connected: Boolean,
    lastConnect: Date,
    lastDisconnect: Date,
    ig_user_id:String
  },
});

UserSchema.pre("save", function (next) {
  const user = this;
  user.email = user.email.trim();
  user.userName = user.userName?.trim();
  // If the password hasn't been modified, move on
  if (!user.isModified("password")) {
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
    return next();
  }

  // Generate a salt and use it to hash the password
<<<<<<< HEAD
  bcrypt.genSalt(10,   (err:any, salt:any)=> {
=======
  bcrypt.genSalt(10, function (err, salt) {
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
    if (err) {
      return next(err);
    }

<<<<<<< HEAD
    bcrypt.hash(user.password as string, salt, function (err:any, hash:any) {
=======
    bcrypt.hash(user.password as string, salt, function (err, hash) {
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
      if (err) {
        return next(err);
      }
      // Replace the plaintext password with the hashed one
      user.password = hash;
      next();
    });
  });
});
UserSchema.methods.validPassword = (Password: string, pass0: string) => {
<<<<<<< HEAD
  const self: any = this
  return bcrypt.compareSync(Password, pass0)
=======
  const self: any = this;
  return bcrypt.compareSync(Password, pass0);
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
};
export const generatePasswordHash = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
<<<<<<< HEAD
}


export default mongoose.model("User", UserSchema);
=======
};

export default mongoose.model("User", UserSchema);
//db.getCollection('users').createIndex({"email": 1}, {unique: true})
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
