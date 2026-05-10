import Joi from "joi";

export const taskSchema = Joi.object({
  id: Joi.string().uuid().required(),
  title: Joi.string().min(3).required(),
  description: Joi.object({
    header: Joi.string().min(3).max(100).required(),
    summary: Joi.string().max(200).required(),
    points: Joi.array()
      .items(Joi.string().min(3).max(100))
      .min(1)
      .required(),
    footer: Joi.string().max(100).required(),
  }).required(),
  picture: Joi.string().uri().required(),
  owner: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .required(), // ✅ Owner is required and must be valid Ethereum address
})

// Schema for creating task (without owner - will be added by middleware)
export const createTaskSchema = Joi.object({
  id: Joi.string().uuid().required(),
  title: Joi.string().min(3).required(),
  description: Joi.object({
    header: Joi.string().min(3).max(100).required(),
    summary: Joi.string().max(200).required(),
    points: Joi.array()
      .items(Joi.string().min(3).max(100))
      .min(1)
      .required(),
    footer: Joi.string().max(100).required(),
  }).required(),
  picture: Joi.string().uri().required(),
})