import Joi from 'joi';

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('newest', 'oldest', 'popular').default('newest'),
  status: Joi.string().valid('published', 'draft').optional(),
  search: Joi.string().allow('').optional(),
  tag: Joi.string().allow('').optional(),
  authorId: Joi.string().hex().length(24).optional(),
});

export const adminPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow('').optional(),
});
