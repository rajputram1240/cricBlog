import { z } from 'zod';

export const blogInputSchema = z.object({
  title: z.string().min(5),
  slug: z.string().min(3),
  categoryId: z.string().min(1),
  summary: z.string().min(20),
  outline: z.string().min(20),
  content: z.string().min(100),
  featureImage: z.string().optional().or(z.literal('')),
  tags: z.string().min(3),
  metaTitle: z.string().min(10),
  metaDescription: z.string().min(20),
  status: z.enum(['draft', 'pending_review', 'approved', 'published', 'rejected']),
  generatedByAI: z.boolean(),
  publishedAt: z.string().nullable().optional(),
});

export const generateSchema = z.object({
  category: z.enum(['football', 'cricket']),
  topic: z.string().min(5).max(160),
});
