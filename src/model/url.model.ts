import { Schema, model } from "mongoose";
import { URLModel } from "../types/Database/types";

const urlSchema = new Schema<URLModel>(
  {
    longUrl: { type: String },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    shortId: { type: String },
    topic: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const URL = model("URL", urlSchema);
export default URL;
