import Joi from "joi";
import { stringValidation } from "./index";

const shortenUrlSchema = {
  body: Joi.object({
    longUrl: stringValidation("Long URL"),
    customAlias: stringValidation("Custom Alias", false),
    topic: stringValidation("topic", false),
  }),
};

const redirectToOrignalURLSchema = {
  params: Joi.object({
    shortId: stringValidation("URL Short ID"),
  }),
};

export default {
  shortenUrlSchema,
  redirectToOrignalURLSchema
};
