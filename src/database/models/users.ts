import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  password: { type: String },
  lastLogin: { type: Date, default: Date.now },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String },
  isActive: { type: Boolean, default: false },
  dateJoined: { type: Date, default: Date.now },
  status: { type: String, default: "active" },
  email: { type: String, required: true },
  userVerified: Boolean,
  phone: String,
  age:String,
  zipcode: String,
  interest: String,
  confirmpass: String,
  jwtRefreshToken: String,
  devices: [
    {
      name: { type: String },
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
      type: { type: String },
    },
  ]
});

UserSchema.pre("save", function (next) {
  const user = this;
  user.email = user.email.trim();
  user.userName = user.userName?.trim();
  //user.password = user.password?.trim();
  // If the password hasn't been modified, move on
  if (!user.isModified("password")) {
    return next();
  }

  // Generate a salt and use it to hash the password
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password as string, salt, function (err, hash) {
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
  const self: any = this;
  return bcrypt.compareSync(Password, pass0);
};
export const generatePasswordHash = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export default mongoose.model("User", UserSchema);
//db.getCollection('users').createIndex({"email": 1}, {unique: true})
