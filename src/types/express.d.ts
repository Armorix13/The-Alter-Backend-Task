import { Request } from "express";
import { ObjectId } from "mongoose";

declare namespace Express {
    export interface Request {
        userId?: ObjectId;
    }
}

declare global {
    namespace Express {
        interface Request {
            userId?: ObjectId;
        }
    }
}

