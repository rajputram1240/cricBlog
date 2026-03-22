import { NextResponse } from 'next/server';
import { getFanSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { closeAuctionSchema } from '@/lib/validators';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const fan = await getFanSession();
    if (!fan) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const { id } = await context.params;
    const ticket = await prisma.matchTicket.findUnique({ where: { id }, include: { bids: true } });
    if (!ticket || ticket.sellerId !== fan.id) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.status !== 'open') return NextResponse.json({ error: 'Ticket is already sold' }, { status: 400 });

    const input = closeAuctionSchema.parse(await request.json());
    const selectedBid = ticket.bids.find((bid) => bid.id === input.bidId);
    if (!selectedBid) return NextResponse.json({ error: 'Selected bid was not found' }, { status: 404 });

    await prisma.$transaction([
      prisma.ticketBid.updateMany({ where: { ticketId: id }, data: { isWinningBid: false } }),
      prisma.ticketBid.update({ where: { id: input.bidId }, data: { isWinningBid: true } }),
      prisma.matchTicket.update({ where: { id }, data: { status: 'sold', soldBidId: input.bidId, soldAt: new Date(), sellerRewardNote: input.rewardNote || null } }),
    ]);

    const refreshed = await prisma.matchTicket.findUnique({
      where: { id },
      include: { seller: true, bids: { include: { bidder: true }, orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }] }, soldBid: { include: { bidder: true } } },
    });
    return NextResponse.json({ ticket: refreshed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to close auction' }, { status: 400 });
  }
}
