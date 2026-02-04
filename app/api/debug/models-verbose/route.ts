import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  // 查询所有数据
  const { data: allData, error: allError } = await supabase
    .from('models')
    .select('*');

  // 查询text2image类型
  const { data: text2image, error: textError } = await supabase
    .from('models')
    .select('*')
    .eq('type', 'text2image');

  // 查询所有不同的type值
  const { data: typesData } = await supabase
    .from('models')
    .select('type');

  const uniqueTypes = [...new Set(typesData?.map(m => m.type) || [])];

  return NextResponse.json({
    allCount: allData?.length || 0,
    allData: allData || [],
    allError: allError?.message,
    text2imageCount: text2image?.length || 0,
    text2imageData: text2image || [],
    textError: textError?.message,
    uniqueTypes: uniqueTypes
  });
}
