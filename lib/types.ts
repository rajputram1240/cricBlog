export type BlogStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
export type CategorySlug = 'football' | 'cricket';

export interface BlogFormInput {
  title: string;
  slug: string;
  categoryId: string;
  summary: string;
  outline: string;
  content: string;
  featureImage?: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  status: BlogStatus;
  generatedByAI: boolean;
  publishedAt?: string | null;
}
