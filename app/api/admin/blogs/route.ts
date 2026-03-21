import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveBlogPost } from '@/lib/data';

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing blog id' }, { status: 400 });
  if (['approved', 'published'].includes(body.status) && !body.featureImage) {
    return NextResponse.json({ error: 'Feature image is required before approval or publishing.' }, { status: 400 });
  }
  const post = await saveBlogPost(body, body.id, admin.id);
  return NextResponse.json({ post });
}

export async function DELETE(request: NextRequest) {
  await requireAdmin();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
