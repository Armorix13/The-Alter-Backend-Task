import { Schema, model } from "mongoose";

const analyticsSchema = new Schema({
  shortId: { type: String, required: true, ref: "Url" },
  timestamp: { type: Date, default: Date.now },
  userAgent: { type: String },
  osName: { type: String },
  deviceType: { type: String },
  ipAddress: { type: String },
  location: { type: String },
});

const Analytics = model("Analytics", analyticsSchema);
export default Analytics;
