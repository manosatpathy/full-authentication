import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshTokens: [
    {
      token: String,
      expiresAt: Date,
    },
  ],
  otp: {
    type: String,
    max: 6,
  },
  otpExpires: { type: Date },
  email_verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  if (this.isModified("otp") && this.otp) {
    this.otp = await bcrypt.hash(this.otp, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
