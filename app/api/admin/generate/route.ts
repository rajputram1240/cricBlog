import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateBlogDraft } from '@/lib/openai';
import { generateSchema } from '@/lib/validators';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = generateSchema.parse(await request.json());
  const category = await prisma.category.findUnique({ where: { slug: body.category } });
  if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

  const draft = await generateBlogDraft({ category: body.category, topic: body.topic });
  const slugBase = slugify(draft.slug || draft.title);
  const count = await prisma.blogPost.count({ where: { slug: { startsWith: slugBase } } });
  const post = await prisma.blogPost.create({
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
      status: 'pending_review',
      generatedByAI: true,
      authorName: 'Sports AI Desk',
    },
    include: { category: true },
  });

  return NextResponse.json({ post });
}
