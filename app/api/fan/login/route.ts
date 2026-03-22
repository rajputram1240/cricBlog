import { NextResponse } from 'next/server';
import { loginFan } from '@/lib/auth';
import { fanLoginSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = fanLoginSchema.parse(await request.json());
    const fan = await loginFan(body.name, body.email, body.phone);
    return NextResponse.json({ fan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to login' }, { status: 400 });
  }
}
