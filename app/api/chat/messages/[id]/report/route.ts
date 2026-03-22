import { NextResponse } from 'next/server';
import { ChatReportStatus } from '@prisma/client';
import { getChatUserSession } from '@/lib/auth';
import { getChatRoomData } from '@/lib/chat';
import { publishChatUpdate } from '@/lib/chat-events';
import { prisma } from '@/lib/prisma';
import { chatReportSchema } from '@/lib/validators';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getChatUserSession();
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    const { id } = await params;
    const body = chatReportSchema.parse(await request.json());
    const message = await prisma.chatMessage.findUnique({ where: { id }, include: { user: true } });
    if (!message || message.isDeleted) return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    if (message.userId === user.id) return NextResponse.json({ error: 'You cannot report your own message' }, { status: 400 });

    await prisma.chatReport.upsert({
      where: { messageId_reporterId: { messageId: id, reporterId: user.id } },
      update: { reason: body.reason, status: ChatReportStatus.open, adminNote: null },
      create: { messageId: id, reporterId: user.id, reportedUserId: message.userId, reason: body.reason },
    });

    publishChatUpdate();
    const data = await getChatRoomData(user.id);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to report message' }, { status: 400 });
  }
}
