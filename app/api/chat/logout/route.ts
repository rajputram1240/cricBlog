import { NextResponse } from 'next/server';
import { logoutChatUser } from '@/lib/auth';

export async function POST() {
  await logoutChatUser();
  return NextResponse.json({ ok: true });
}
