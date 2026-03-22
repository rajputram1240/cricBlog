import { NextResponse } from 'next/server';
import { logoutFan } from '@/lib/auth';

export async function POST() {
  await logoutFan();
  return NextResponse.json({ ok: true });
}
