import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBlogDraft } from '@/lib/openai';
import { slugify } from '@/lib/utils';

async function createDraft(categorySlug: 'football' | 'cricket', topic: string) {
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return null;
  const draft = await generateBlogDraft({ category: categorySlug, topic });
  const slugBase = slugify(draft.slug || draft.title);
  const count = await prisma.blogPost.count({ where: { slug: { startsWith: slugBase } } });
  return prisma.blogPost.create({
    data: {
      title: draft.title,
      slug: count ? `${slugBase}-${count + 1}` : slugBase,
      categoryId: category.id,
      summary: draft.summary,
      outline: draft.outline,
      content: draft.content,
      tags: draft.tags,
      metaTitle: draft.metaTitle,
      metaDescription: draft.metaDescription,
      generatedByAI: true,
      status: 'pending_review',
      authorName: 'Sports AI Desk',
    },
  });
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (!process.env.SESSION_SECRET || secret !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const [football, cricket] = await Promise.all([
    createDraft('football', `Daily football briefing for ${today}`),
    createDraft('cricket', `Daily cricket briefing for ${today}`),
  ]);

  return NextResponse.json({ ok: true, created: [football?.id, cricket?.id].filter(Boolean) });
}
