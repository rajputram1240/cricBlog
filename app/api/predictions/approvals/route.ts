import { NextResponse } from 'next/server';
import { getPredictionMasterSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { predictionApprovalSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const master = await getPredictionMasterSession();
    if (!master) return NextResponse.json({ error: 'Prediction master login required' }, { status: 401 });

    const input = predictionApprovalSchema.parse(await request.json());
    const purchase = await prisma.predictionPurchase.findUnique({ where: { id: input.purchaseId } });
    if (!purchase || purchase.masterId !== master.id) return NextResponse.json({ error: 'Purchase request not found' }, { status: 404 });

    const updated = await prisma.predictionPurchase.update({
      where: { id: input.purchaseId },
      data: {
        status: input.status,
        masterNote: input.masterNote || null,
        approvedAt: input.status === 'approved' ? new Date() : null,
      },
    });

    return NextResponse.json({ purchase: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to update purchase approval' }, { status: 400 });
  }
}
