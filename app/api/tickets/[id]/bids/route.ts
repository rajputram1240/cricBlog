import { NextResponse } from 'next/server';
import { getFanSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bidSchema } from '@/lib/validators';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const fan = await getFanSession();
    if (!fan) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const { id } = await context.params;
    const ticket = await prisma.matchTicket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.sellerId === fan.id) return NextResponse.json({ error: 'You cannot bid on your own ticket' }, { status: 400 });
    if (ticket.status !== 'open') return NextResponse.json({ error: 'Auction already closed' }, { status: 400 });

    const input = bidSchema.parse(await request.json());
    await prisma.ticketBid.create({ data: { ...input, ticketId: id, bidderId: fan.id } });
    const refreshed = await prisma.matchTicket.findUnique({
      where: { id },
      include: { seller: true, bids: { include: { bidder: true }, orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }] }, soldBid: { include: { bidder: true } } },
    });
    return NextResponse.json({ ticket: refreshed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to place bid' }, { status: 400 });
  }
}
