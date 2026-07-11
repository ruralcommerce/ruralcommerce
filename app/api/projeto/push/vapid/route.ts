import { NextResponse } from 'next/server';
import { getVapidPublicKey, isPushConfigured } from '@/lib/project-push';

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey(),
  });
}
