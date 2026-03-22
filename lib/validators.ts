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

export const fanLoginSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
});

export const ticketSchema = z.object({
  matchTitle: z.string().min(5).max(120),
  venue: z.string().min(3).max(120),
  matchDate: z.string().datetime(),
  seatDetails: z.string().min(3).max(120),
  basePrice: z.coerce.number().positive(),
  description: z.string().min(20).max(500),
});

export const bidSchema = z.object({
  amount: z.coerce.number().positive(),
  comment: z.string().min(8).max(280),
});

export const closeAuctionSchema = z.object({
  bidId: z.string().min(1),
  rewardNote: z.string().max(220).optional().or(z.literal('')),
});

export const rewardBidSchema = z.object({
  bidId: z.string().min(1),
});
