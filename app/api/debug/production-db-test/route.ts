import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};

  // Test environment variables
  results.env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `✅ Set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...)` : '❌ Missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ Missing',
  };

  // Test Supabase connection
  try {
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    results.client_creation = 'Attempting to create client...';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    results.client_creation = '✅ Client created successfully';

    // Test connection with a simple query
    results.test_query = 'Testing connection...';
    const { data, error } = await supabase
      .from('models')
      .select('count')
      .limit(1);

    if (error) {
      results.test_query = `❌ Query failed: ${error.message}`;
      results.error_details = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      };
    } else {
      results.test_query = '✅ Query successful';
      results.models_count = data?.length || 0;
    }

    // Try to get actual models
    results.get_models = 'Fetching models...';
    const { data: models, error: modelsError } = await supabase
      .from('models')
      .select('*')
      .limit(5);

    if (modelsError) {
      results.get_models = `❌ Failed: ${modelsError.message}`;
    } else {
      results.get_models = `✅ Success - Found ${models?.length || 0} models`;
      results.sample_models = models?.map((m: any) => ({
        id: m.id,
        name: m.name,
        type: m.type,
      }));
    }

  } catch (error: any) {
    results.error = error.message;
    results.stack = error.stack;
  }

  return NextResponse.json(results);
}
