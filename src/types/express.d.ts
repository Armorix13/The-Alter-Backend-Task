import { Request } from "express";
import { ObjectId } from "mongoose";

// declare namespace Express {
//     export interface Request {
//         userId?: ObjectId | any;
//     }
// }

declare global {
    namespace Express {
        interface Request {
            userId?: ObjectId | any;
        }
    }
}

