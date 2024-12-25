import { ObjectId } from "mongoose";

declare namespace Express {
  export interface Request {
    userId?: ObjectId;
  }
}