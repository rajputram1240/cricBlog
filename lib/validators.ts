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
  phone: z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, 'Enter a valid phone number'),
});

export const predictionMasterLoginSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  phone: z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, 'Enter a valid phone number'),
  upiId: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/i, 'Enter a valid UPI ID'),
});

export const predictionPostSchema = z.object({
  matchTitle: z.string().trim().min(5).max(120),
  title: z.string().trim().min(5).max(140),
  content: z.string().trim().min(80).max(4000),
  slipId: z.string().trim().min(3).max(80),
  fee: z.coerce.number().positive(),
  platform: z.string().trim().min(2).max(80),
  chanceToWin: z.coerce.number().int().min(1).max(100),
});

export const predictionPurchaseSchema = z.object({
  postId: z.string().min(1),
  utr: z.string().trim().min(6).max(40),
  buyerPhone: z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, 'Enter a valid phone number'),
  buyerEmail: z.string().email(),
  initiatedAt: z.string().datetime(),
});

export const predictionApprovalSchema = z.object({
  purchaseId: z.string().min(1),
  status: z.enum(['approved', 'rejected']),
  masterNote: z.string().trim().max(240).optional().or(z.literal('')),
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
