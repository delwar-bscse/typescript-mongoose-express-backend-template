import { z } from 'zod';

const createPostZodSchema = z.object({
  body: z.object({
    creatorId: z.string({ required_error: 'CreatorId is required' }),
    title: z.string({ required_error: 'Name is required' }),
    description: z.string({ required_error: 'Name is required' }),
    image: z.string().optional(),
  }),
});

const updatePostZodSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const PostValidation = {
  createPostZodSchema,
  updatePostZodSchema,
};
