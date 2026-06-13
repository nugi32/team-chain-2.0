import Joi from "joi";

// Milestone schema for milestone-type tasks
const milestoneSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().min(1).required(),
  reward: Joi.string().required(),
  deadline: Joi.string().required(),
  description: Joi.string().required(),
});

// Full task schema for GET/complete data
export const taskSchema = Joi.object({
  contractId: Joi.string().uuid().required(),
  projectName: Joi.string().min(1).required(),
  objective: Joi.string().min(1).max(120).required(),
  category: Joi.string()
    .valid(
      "Smart Contracts",
      "Frontend",
      "Backend",
      "Security Audit",
      "Design / UX",
      "Documentation"
    )
    .required(),
  effort: Joi.string()
    .valid("< 4 hrs", "4–8 hrs", "1–3 days", "1 week", "2+ weeks")
    .allow("")
    .optional(),
  minReputation: Joi.string().allow("").default("").optional(),
  roles: Joi.array().items(Joi.string()).default([]).optional(),
  skills: Joi.array()
    .items(Joi.string())
    .min(1)
    .required(),
  description: Joi.string().required(),
  milestones: Joi.array()
    .items(milestoneSchema)
    .optional()
    .allow(null),
  badges: Joi.array().items(Joi.string()).default([]).optional(),
  owner: Joi.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .required(),
});

// Schema for creating task (without owner and id - will be added by middleware/controller)
export const createTaskSchema = Joi.object({
  contractId: Joi.string().uuid().required(),
  projectName: Joi.string().min(1).required(),
  objective: Joi.string().min(1).max(120).required(),
  category: Joi.string()
    .valid(
      "Smart Contracts",
      "Frontend",
      "Backend",
      "Security Audit",
      "Design / UX",
      "Documentation"
    )
    .required(),
  effort: Joi.string()
    .valid("< 4 hrs", "4–8 hrs", "1–3 days", "1 week", "2+ weeks")
    .allow("")
    .optional(),
  minReputation: Joi.string().allow("").default("").optional(),
  roles: Joi.array().items(Joi.string()).default([]).optional(),
  skills: Joi.array()
    .items(Joi.string())
    .min(1)
    .required(),
  description: Joi.string().required(),
  milestones: Joi.array()
    .items(milestoneSchema)
    .optional()
    .default(null),
  badges: Joi.array().items(Joi.string()).default([]).optional(),
});