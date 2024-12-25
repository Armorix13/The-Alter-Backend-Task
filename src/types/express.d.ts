import { ObjectId } from "mongodb";

declare global {
    namespace Express {
        interface Request {
            userId?: ObjectId | string | any;
        }
    }
}
