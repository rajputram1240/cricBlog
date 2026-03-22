import { NextResponse } from 'next/server';
import { getPredictionMasterSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { predictionPostSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const master = await getPredictionMasterSession();
    if (!master) return NextResponse.json({ error: 'Prediction master login required' }, { status: 401 });

    const input = predictionPostSchema.parse(await request.json());
    const post = await prisma.predictionPost.create({
      data: {
        ...input,
        masterId: master.id,
      },
      include: { master: true },
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to publish prediction' }, { status: 400 });
  }
}
