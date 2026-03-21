import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const posts = await getPublishedPosts({
    query: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    date: searchParams.get('date') || undefined,
  });
  return NextResponse.json({ posts });
}
