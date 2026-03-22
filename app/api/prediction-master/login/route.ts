import { NextResponse } from 'next/server';
import { loginPredictionMaster } from '@/lib/auth';
import { predictionMasterLoginSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = predictionMasterLoginSchema.parse(await request.json());
    const master = await loginPredictionMaster(body.name, body.email, body.phone, body.upiId);
    return NextResponse.json({ master });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to register prediction master' }, { status: 400 });
  }
}
