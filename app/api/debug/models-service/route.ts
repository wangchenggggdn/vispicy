import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET() {
  if (!supabaseServiceKey) {
    return NextResponse.json({ error: 'No service role key' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('models')
    .select('*');

  return NextResponse.json({
    count: data?.length || 0,
    data: data || [],
    error: error?.message
  });
}
