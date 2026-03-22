import { NextResponse } from 'next/server';
import { logoutPredictionMaster } from '@/lib/auth';

export async function POST() {
  await logoutPredictionMaster();
  return NextResponse.json({ ok: true });
}
