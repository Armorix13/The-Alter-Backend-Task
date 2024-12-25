import Joi from "joi";
import { emailValidation, stringValidation } from "./index";

export const RegisterSchema = {
  body: Joi.object({
    token: stringValidation("token")
  }),
};
export const LoginSchema = {
  body: Joi.object({
    token: stringValidation("token")
  }),
};

export default {
  RegisterSchema,
  LoginSchema
};
