import { NextResponse } from 'next/server';
import { getFanSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ticketSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const fan = await getFanSession();
    if (!fan) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    const input = ticketSchema.parse(await request.json());
    if (new Date(input.matchDate) <= new Date()) {
      return NextResponse.json({ error: 'Only upcoming matches can be listed.' }, { status: 400 });
    }

    const today = new Date();
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

    const [activeSale, dailyTicket] = await Promise.all([
      prisma.matchTicket.findFirst({ where: { sellerId: fan.id, status: 'open' } }),
      prisma.matchTicket.findFirst({ where: { sellerId: fan.id, createdAt: { gte: start, lte: end } } }),
    ]);

    if (activeSale) return NextResponse.json({ error: 'You already have one open ticket listing.' }, { status: 400 });
    if (dailyTicket) return NextResponse.json({ error: 'You can list only one ticket per day.' }, { status: 400 });

    const ticket = await prisma.matchTicket.create({
      data: { ...input, sellerId: fan.id, matchDate: new Date(input.matchDate) },
      include: { seller: true, bids: { include: { bidder: true }, orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }] }, soldBid: { include: { bidder: true } } },
    });

    return NextResponse.json({ ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to create ticket' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const fan = await getFanSession();
    if (!fan) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Ticket id is required' }, { status: 400 });
    const ticket = await prisma.matchTicket.findUnique({ where: { id } });
    if (!ticket || ticket.sellerId !== fan.id) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.status !== 'open') return NextResponse.json({ error: 'Sold tickets cannot be deleted' }, { status: 400 });
    await prisma.ticketBid.deleteMany({ where: { ticketId: id } });
    await prisma.matchTicket.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to delete ticket' }, { status: 400 });
  }
}
