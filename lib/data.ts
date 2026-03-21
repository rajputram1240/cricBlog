import { BlogStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { blogInputSchema } from '@/lib/validators';

export async function getPublishedPosts(params?: { category?: string; query?: string; date?: string }) {
  const where = {
    status: BlogStatus.published,
    ...(params?.category ? { category: { slug: params.category } } : {}),
    ...(params?.query
      ? {
          OR: [
            { title: { contains: params.query } },
            { summary: { contains: params.query } },
            { content: { contains: params.query } },
            { tags: { contains: params.query } },
          ],
        }
      : {}),
    ...(params?.date
      ? {
          publishedAt: {
            gte: new Date(`${params.date}T00:00:00.000Z`),
            lte: new Date(`${params.date}T23:59:59.999Z`),
          },
        }
      : {}),
  };

  return prisma.blogPost.findMany({
    where,
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug }, include: { category: true, approvedBy: true } });
}

export async function getAdminDashboardData() {
  const [categories, posts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.blogPost.findMany({ include: { category: true }, orderBy: { updatedAt: 'desc' } }),
  ]);

  return {
    categories,
    posts,
    stats: {
      total: posts.length,
      football: posts.filter((post) => post.category.slug === 'football').length,
      cricket: posts.filter((post) => post.category.slug === 'cricket').length,
      pending: posts.filter((post) => ['draft', 'pending_review'].includes(post.status)).length,
      approved: posts.filter((post) => post.status === 'approved').length,
      published: posts.filter((post) => post.status === 'published').length,
    },
  };
}

export async function saveBlogPost(input: unknown, id?: string, approvedById?: string) {
  const parsed = blogInputSchema.parse(input);
  const payload = {
    ...parsed,
    slug: slugify(parsed.slug || parsed.title),
    featureImage: parsed.featureImage || null,
    approvedById: ['approved', 'published'].includes(parsed.status) ? approvedById : null,
    publishedAt: parsed.status === 'published' ? new Date(parsed.publishedAt || new Date().toISOString()) : null,
  };

  if (id) {
    return prisma.blogPost.update({ where: { id }, data: payload, include: { category: true } });
  }

  return prisma.blogPost.create({ data: payload, include: { category: true } });
}
