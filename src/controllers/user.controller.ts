import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../model/user.model";
import { UserModel } from "../types/Database/types";
import { UserRequest } from "../types/API/User/types";
import { TryCatch } from "../utils/helper";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const Register = TryCatch(
  async (
    req: Request<{}, {}, UserRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token not provided",
      });
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log("ticket", ticket);

      const payload = ticket.getPayload();
      console.log("payload", payload);

      if (!payload) {
        return res.status(400).json({
          success: false,
          message: "Invalid Google token",
        });
      }
      const existingUser = await User.findOne({ socialId: payload.sub });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
      const newUser: UserModel = new User({
        name: payload.name,
        email: payload.email,
        socialId: payload.sub,
      });

      await newUser.save();

      const jwtToken = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      return res.status(201).json({
        message: "User registered successfully",
        token: jwtToken,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Error during registration",
        error: err.message,
      });
    }
  }
);

const Login = TryCatch(
  async (
    req: Request<{}, {}, UserRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token not provided",
      });
    }
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log("ticket", ticket);
      const payload = ticket.getPayload();
      console.log("payload", payload);
      if (!payload) {
        return res.status(400).json({
          success: false,
          message: "Invalid Google token",
        });
      }

      const existingUser = await User.findOne({ socialId: payload.sub });
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: "User not found. Please register.",
        });
      }

      const jwtToken = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        token: jwtToken,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Error during login",
        error: err.message,
      });
    }
  }
);

export default {
  Register,
  Login,
};
