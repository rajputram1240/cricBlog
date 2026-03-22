import { NextResponse } from 'next/server';
import { getChatUserSession } from '@/lib/auth';
import { getChatRoomData } from '@/lib/chat';
import { prisma } from '@/lib/prisma';
import { chatMessageSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const user = await getChatUserSession();
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    if (user.isBlocked) return NextResponse.json({ error: user.blockReason || 'You are blocked from chat' }, { status: 403 });

    const body = chatMessageSchema.parse(await request.json());
    await prisma.chatMessage.create({ data: { userId: user.id, text: body.text } });
    const data = await getChatRoomData(user.id);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to post message' }, { status: 400 });
  }
}
