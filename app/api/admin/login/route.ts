import { NextRequest, NextResponse } from 'next/server';
import { createSession, validateAdminLogin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get('email') || '');
  const password = String(form.get('password') || '');
  const admin = await validateAdminLogin(email, password);
  if (!admin) {
    return NextResponse.redirect(new URL('/admin/login?error=invalid', request.url));
  }
  await createSession(admin.id);
  return NextResponse.redirect(new URL('/admin', request.url));
}
