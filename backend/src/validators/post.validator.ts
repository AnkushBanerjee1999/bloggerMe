import Joi from 'joi';

export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  excerpt: Joi.string().min(1).max(500).required(),
  content: Joi.string().min(1).required(),
  coverImage: Joi.string().max(3000000).allow('').optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  status: Joi.string().valid('published', 'draft').optional(),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  excerpt: Joi.string().min(1).max(500).optional(),
  content: Joi.string().min(1).optional(),
  coverImage: Joi.string().max(3000000).allow('').optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  status: Joi.string().valid('published', 'draft').optional(),
}).min(1);

export const postSlugParamSchema = Joi.object({
  slug: Joi.string().required(),
});

export const postIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
