import Joi from "joi";

 export const userSchema = Joi.object({
  walletAddress: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .required(), // ✅ Changed to string and validate as Ethereum address
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  github: Joi.string().uri().required(),
  linkedin: Joi.string().uri().required(),
  role: Joi.string()
    .valid("Developer", "Designer", "Project Manager")
    .required(),
  profilePicture: Joi.string().uri().required(),
  description: Joi.object({
    header: Joi.string().min(3).max(100).required(),
    summary: Joi.string().max(200).required(),
    points: Joi.array()
      .items(Joi.string().min(3).max(100))
      .min(1)
      .required(),
    footer: Joi.string().max(100).required(),
  }).required(),
  skills: Joi.array().items(Joi.string().min(2).max(50)).required(),
  owner: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .required(), // ✅ Owner is required
})

// Schema for creating user (without owner - will be added by middleware)
export const createUserSchema = Joi.object({
  walletAddress: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .required(),
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  github: Joi.string().uri().required(),
  linkedin: Joi.string().uri().required(),
  role: Joi.string()
    .valid("Developer", "Designer", "Project Manager")
    .required(),
  profilePicture: Joi.string().uri().required(),
  description: Joi.object({
    header: Joi.string().min(3).max(100).required(),
    summary: Joi.string().max(200).required(),
    points: Joi.array()
      .items(Joi.string().min(3).max(100))
      .min(1)
      .required(),
    footer: Joi.string().max(100).required(),
  }).required(),
  skills: Joi.array().items(Joi.string().min(2).max(50)).required(),
})