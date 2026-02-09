import { NextResponse } from 'next/server';
import { getActiveCoinPackages } from '@/lib/supabase';

export async function GET() {
  try {
    const packages = await getActiveCoinPackages();
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('[API] Failed to fetch coin packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coin packages' },
      { status: 500 }
    );
  }
}
