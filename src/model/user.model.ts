import { Schema, model } from "mongoose";
import { UserModel } from "../types/Database/types";

const userSchema = new Schema<UserModel>(
  {
    name: { type: String },
    email: { type: String },
    socialId: { type: String },
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
