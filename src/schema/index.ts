import Joi from "joi";

export const stringValidation = (key: string, isRequired: boolean = true) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.string()
      .required()
      .messages({
        "string.empty": `${key} cannot be empty.`,
        "string.base": `${key} should be a type of text`,
        "any.required": `${key} is required`,
      });
  } else {
    schema = Joi.string()
      .optional()
      .messages({
        "string.empty": `${key} cannot be empty.`,
        "string.base": `${key} should be a type of text`,
      });
  }

  return schema;
};

export const numberValidation = (
  key: string,
  isRequired: boolean = true,
  min: number = 0
) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.number()
      .min(min)
      .required()
      .messages({
        "number.base": `${key} must be a number.`,
        "number.min": `${key} must be at least ${min}.`,
        "any.required": `${key} is required.`,
      });
  } else {
    schema = Joi.number()
      .min(min)
      .optional()
      .messages({
        "number.base": `${key} must be a number.`,
        "number.min": `${key} must be at least ${min}.`,
      });
  }
  return schema;
};

export const ObjectIdValidation = (key: string, isRequired: boolean = true) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.base": `${key} should be a type of text`,
        "string.empty": `${key} cannot be empty`,
        "string.pattern.base": `${key} must be a valid ObjectId`,
        "any.required": `${key} is required.`,
      });
  } else {
    schema = Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        "string.base": `${key} should be a type of text`,
        "string.empty": `${key} cannot be empty`,
        "string.pattern.base": `${key} must be a valid ObjectId`,
      });
  }
  return schema;
};

export const passwordValidation = () => {
  return Joi.string().min(6).max(50).required().messages({
    "string.base": "Password should be a type of text.",
    "string.empty": "Password cannot be empty.",
    "string.min": "Password should have at least 6 characters.",
    "string.max": "Password should not exceed 50 characters.",
    "any.required": "Password is required.",
  });
};

export const emailValidation = (isRequired: boolean = true) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.string().required().email().messages({
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email cannot be empty.",
      "any.required": `Email is required`,
    });
  } else {
    schema = Joi.string().optional().email().messages({
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email cannot be empty.",
    });
  }
  return schema;
};
