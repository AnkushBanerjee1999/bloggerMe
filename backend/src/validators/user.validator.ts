import Joi from 'joi';

export const userIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  bio: Joi.string().max(300).allow('').optional(),
  avatar: Joi.string().max(2000000).allow('').optional(),
}).min(1);

export const banActionSchema = Joi.object({
  banned: Joi.boolean().required(),
});

export const updateRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'admin').required(),
});
