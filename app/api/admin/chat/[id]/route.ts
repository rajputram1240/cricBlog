import { NextResponse } from 'next/server';
import { ChatReportStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { publishChatUpdate } from '@/lib/chat-socket';
import { prisma } from '@/lib/prisma';
import { adminChatActionSchema } from '@/lib/validators';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = adminChatActionSchema.parse(await request.json());

    if (body.action === 'delete_message') {
      await prisma.chatMessage.update({ where: { id }, data: { isDeleted: true } });
      await prisma.chatReport.updateMany({ where: { messageId: id, status: ChatReportStatus.open }, data: { status: ChatReportStatus.actioned, adminNote: body.reason || 'Message deleted by admin' } });
      publishChatUpdate();
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'block_user') {
      await prisma.chatUser.update({ where: { id }, data: { isBlocked: true, blockReason: body.reason || 'Blocked by admin for abusive chat behaviour' } });
      await prisma.chatReport.updateMany({ where: { reportedUserId: id, status: ChatReportStatus.open }, data: { status: ChatReportStatus.actioned, adminNote: body.reason || 'User blocked by admin' } });
      publishChatUpdate();
      return NextResponse.json({ ok: true });
    }

    await prisma.chatReport.update({ where: { id }, data: { status: ChatReportStatus.dismissed, adminNote: body.reason || 'Dismissed by admin' } });
    publishChatUpdate();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin action failed' }, { status: 400 });
  }
}
