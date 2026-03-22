import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllSiteContent, saveSiteContent } from '@/lib/data';

export async function GET() {
  await requireAdmin();
  const content = await getAllSiteContent();
  return NextResponse.json({ content });
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const content = await saveSiteContent(body);
  return NextResponse.json({ content });
}
