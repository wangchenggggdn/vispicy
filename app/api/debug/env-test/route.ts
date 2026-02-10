// Test if environment variables are loaded
console.log('[Env Test] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('[Env Test] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
console.log('[Env Test] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...');

export default function handler(req, res) {
  res.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon_key_prefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30),
    service_role_prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30),
    nextauth_url: process.env.NEXTAUTH_URL,
    nextauth_secret: process.env.NEXTAUTH_SECRET?.substring(0, 20) + '...',
  });
}
