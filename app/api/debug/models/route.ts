import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabase
    .from('models')
    .select('*');

  return NextResponse.json({
    count: data?.length || 0,
    data: data || [],
    error: error?.message
  });
}
