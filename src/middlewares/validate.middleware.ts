import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../utils/helper";

const removeEmptyValues = (obj: any) => {
  const newObj: any = {};
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        newObj[key] = obj[key].filter((value: any) => value !== null);
      } else {
        newObj[key] = removeEmptyValues(obj[key]);
      }
    } else if (obj[key] !== "" && obj[key] !== null) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

const validate = (schema: any) =>
  TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    req.body = removeEmptyValues(req.body);
    req.query = removeEmptyValues(req.query);
    req.params = removeEmptyValues(req.params);

    const validationErrors: any = [];

    const validateField = (field: any, data: any) => {
      if (schema[field]) {
        const result = schema[field].validate(data, { abortEarly: false });
        if (result.error) {
          validationErrors.push(
            ...result.error.details.map((error: any) => error.message)
          );
        }
      }
    };

    validateField("params", req.params);
    validateField("query", req.query);
    validateField("body", req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors[0],
        details: validationErrors,
      });
    }

    next();
  });

export default validate;
