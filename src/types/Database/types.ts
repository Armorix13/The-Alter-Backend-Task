import { ObjectId } from "mongoose";
import { Document, mongo, Schema } from "mongoose";

export interface UserModel extends Document {
  name: string;
  email: string;
  socialId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface URLModel extends Document {
  userId: ObjectId
  longUrl: string;
  shortId: string;
  topic: string;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
