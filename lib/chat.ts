import { ChatReportStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const CLEANUP_KEY = 'daily-chat-reset';

function todayCleanupTargetUtc(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 0, 0, 0));
}

export async function ensureDailyChatCleanup(now = new Date()) {
  const target = todayCleanupTargetUtc(now);
  if (now < target) return;

  const state = await prisma.chatCleanupState.upsert({
    where: { key: CLEANUP_KEY },
    update: {},
    create: { key: CLEANUP_KEY },
  });

  if (state.lastCleanupAt && state.lastCleanupAt >= target) return;

  await prisma.$transaction([
    prisma.chatReport.deleteMany({}),
    prisma.chatMessage.deleteMany({}),
    prisma.chatCleanupState.update({ where: { id: state.id }, data: { lastCleanupAt: now } }),
  ]);
}

export async function getChatRoomData(userId?: string) {
  await ensureDailyChatCleanup();

  const [messages, reports] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { isDeleted: false },
      include: { user: true, reports: { where: { status: ChatReportStatus.open }, select: { id: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.chatReport.count({ where: { status: ChatReportStatus.open } }),
  ]);

  return {
    messages: messages.map((message) => ({
      id: message.id,
      text: message.text,
      createdAt: message.createdAt,
      userId: message.userId,
      reportCount: message.reports.length,
      user: {
        id: message.user.id,
        name: message.user.name,
      },
      canReport: userId ? message.userId !== userId : false,
    })),
    openReports: reports,
  };
}

export async function getAdminChatData() {
  await ensureDailyChatCleanup();

  const [users, messages, reports] = await Promise.all([
    prisma.chatUser.findMany({
      orderBy: [{ isBlocked: 'desc' }, { updatedAt: 'desc' }],
      include: {
        _count: { select: { messages: true, reportsOnMe: true, reportsMade: true } },
      },
    }),
    prisma.chatMessage.findMany({
      include: {
        user: true,
        reports: {
          include: {
            reporter: true,
            reportedUser: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    prisma.chatReport.findMany({
      include: {
        message: { include: { user: true } },
        reporter: true,
        reportedUser: true,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 50,
    }),
  ]);

  return { users, messages, reports };
}
