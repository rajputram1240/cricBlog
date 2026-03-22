import { NextResponse } from 'next/server';
import { loginChatUser } from '@/lib/auth';
import { chatLoginSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = chatLoginSchema.parse(await request.json());
    const user = await loginChatUser(body.name, body.phone);
    return NextResponse.json({ user: { id: user.id, name: user.name } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to join chat' }, { status: 400 });
  }
}
