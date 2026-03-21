import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'sports_admin_session';

function sign(value: string) {
  const secret = process.env.SESSION_SECRET || 'change-this-secret';
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export async function validateAdminLogin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.password);
  return valid ? admin : null;
}

export async function createSession(adminId: string) {
  const token = `${adminId}.${sign(adminId)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [adminId, signature] = token.split('.');
  if (!adminId || sign(adminId) !== signature) return null;
  return prisma.admin.findUnique({ where: { id: adminId } });
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');
  return admin;
}
