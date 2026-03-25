import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const ADMIN_COOKIE_NAME = 'sports_admin_session';
const FAN_COOKIE_NAME = 'sports_fan_session';
const PREDICTION_MASTER_COOKIE_NAME = 'sports_prediction_master_session';

function sign(value: string) {
  const secret = process.env.SESSION_SECRET || 'change-this-secret';
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function makeToken(id: string) {
  return `${id}.${sign(id)}`;
}

function readSignedId(token?: string) {
  if (!token) return null;
  const [id, signature] = token.split('.');
  if (!id || sign(id) !== signature) return null;
  return id;
}

export async function validateAdminLogin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.password);
  return valid ? admin : null;
}

export async function createSession(adminId: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, makeToken(adminId), { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSession() {
  const store = await cookies();
  const adminId = readSignedId(store.get(ADMIN_COOKIE_NAME)?.value);
  if (!adminId) return null;
  return prisma.admin.findUnique({ where: { id: adminId } });
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');
  return admin;
}

export async function loginFan(name: string, email: string, phone: string) {
  const normalizedPhone = phone.trim();
  const fan = await prisma.fanUser.upsert({
    where: { email: email.toLowerCase() },
    update: { name, phone: normalizedPhone },
    create: { name, email: email.toLowerCase(), phone: normalizedPhone },
  });

  const store = await cookies();
  store.set(FAN_COOKIE_NAME, makeToken(fan.id), { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
  return fan;
}

export async function logoutFan() {
  const store = await cookies();
  store.delete(FAN_COOKIE_NAME);
}

export async function getFanSession() {
  const store = await cookies();
  const fanId = readSignedId(store.get(FAN_COOKIE_NAME)?.value);
  if (!fanId) return null;
  return prisma.fanUser.findUnique({ where: { id: fanId } });
}



export async function loginPredictionMaster(name: string, email: string, phone: string, upiId: string) {
  const master = await prisma.predictionMaster.upsert({
    where: { email: email.toLowerCase() },
    update: { name, phone: phone.trim(), upiId: upiId.trim().toLowerCase() },
    create: { name, email: email.toLowerCase(), phone: phone.trim(), upiId: upiId.trim().toLowerCase() },
  });

  const store = await cookies();
  store.set(PREDICTION_MASTER_COOKIE_NAME, makeToken(master.id), { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
  return master;
}

export async function logoutPredictionMaster() {
  const store = await cookies();
  store.delete(PREDICTION_MASTER_COOKIE_NAME);
}

export async function getPredictionMasterSession() {
  const store = await cookies();
  const masterId = readSignedId(store.get(PREDICTION_MASTER_COOKIE_NAME)?.value);
  if (!masterId) return null;
  return prisma.predictionMaster.findUnique({ where: { id: masterId } });
}


