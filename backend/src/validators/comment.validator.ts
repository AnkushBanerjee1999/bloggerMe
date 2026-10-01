import Joi from 'joi';

export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  postId: Joi.string().hex().length(24).required(),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
}).min(1);

export const commentIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const postIdParamSchema = Joi.object({
  postId: Joi.string().hex().length(24).required(),
});

export const commentStatusSchema = Joi.object({
  status: Joi.string().valid('visible', 'hidden').required(),
});
