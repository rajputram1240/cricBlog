import { NextResponse } from 'next/server';
import { getFanSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { predictionPurchaseSchema } from '@/lib/validators';

const FIVE_MINUTES = 5 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const fan = await getFanSession();
    if (!fan) return NextResponse.json({ error: 'User login required' }, { status: 401 });

    const input = predictionPurchaseSchema.parse(await request.json());
    const initiatedAt = new Date(input.initiatedAt);
    if (Number.isNaN(initiatedAt.getTime()) || Date.now() - initiatedAt.getTime() > FIVE_MINUTES) {
      return NextResponse.json({ error: 'The payment confirmation window expired. Start again and submit within 5 minutes.' }, { status: 400 });
    }

    const post = await prisma.predictionPost.findUnique({ where: { id: input.postId } });
    if (!post) return NextResponse.json({ error: 'Prediction post not found' }, { status: 404 });

    const purchase = await prisma.predictionPurchase.upsert({
      where: { postId_buyerId: { postId: post.id, buyerId: fan.id } },
      update: {
        utr: input.utr,
        buyerPhone: input.buyerPhone,
        buyerEmail: input.buyerEmail.toLowerCase(),
        status: 'pending',
        masterNote: null,
        approvedAt: null,
        requestedAt: new Date(),
      },
      create: {
        postId: post.id,
        buyerId: fan.id,
        masterId: post.masterId,
        utr: input.utr,
        buyerPhone: input.buyerPhone,
        buyerEmail: input.buyerEmail.toLowerCase(),
      },
    });

    return NextResponse.json({ purchase });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to submit payment proof' }, { status: 400 });
  }
}
