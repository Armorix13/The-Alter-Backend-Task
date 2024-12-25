import express, { Application } from "express";
import userRoutes from "./user.route";
import urlRoutes from "./url.route";

const router = express.Router();
router.use(userRoutes);
router.use(urlRoutes);


export default router;
