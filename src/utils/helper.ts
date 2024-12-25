import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";


export const connectToDB = () => mongoose.connect(process.env.MONGO_URI!);


export const TryCatch =
  (func: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(func(req, res, next)).catch();

