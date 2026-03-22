import { NextResponse } from 'next/server';
import { getFanSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeTicketForViewer } from '@/lib/tickets';
import { rewardBidSchema } from '@/lib/validators';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const fan = await getFanSession();
    if (!fan) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const { id } = await context.params;
    const ticket = await prisma.matchTicket.findUnique({ where: { id } });
    if (!ticket || ticket.sellerId !== fan.id) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.status !== 'sold') return NextResponse.json({ error: 'Reward bidders after the auction is sold' }, { status: 400 });

    const input = rewardBidSchema.parse(await request.json());
    const bid = await prisma.ticketBid.findUnique({ where: { id: input.bidId } });
    if (!bid || bid.ticketId !== id) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    await prisma.ticketBid.update({ where: { id: input.bidId }, data: { isRewarded: true, rewardedById: fan.id } });
    const refreshed = await prisma.matchTicket.findUnique({
      where: { id },
      include: { seller: true, bids: { include: { bidder: true }, orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }] }, soldBid: { include: { bidder: true } } },
    });
    return NextResponse.json({ ticket: serializeTicketForViewer(refreshed, fan.id) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to reward bidder' }, { status: 400 });
  }
}
