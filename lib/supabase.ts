import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Anon key client - respects RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client - bypasses RLS (use only on server-side)
// Lazy initialization to avoid errors when env var is not set
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations');
    }
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabaseAdmin;
}

// Database helper functions
export async function getUserById(userId: string) {
  // Use supabaseAdmin to bypass RLS policies and ensure we can always fetch user data
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  // Use supabaseAdmin to bypass RLS policies and ensure we can find existing users
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle(); // 使用 maybeSingle() 而不是 single()，当没有找到用户时返回 null 而不是抛出错误

  if (error) {
    console.error('[getUserByEmail] Error:', error);
    throw error;
  }

  return data; // 如果没有找到用户，data 会是 null
}

export async function createUser(userData: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  coins?: number;
}) {
  // Use supabaseAdmin to bypass RLS policies
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('users')
    .insert({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      image: userData.image,
      coins: userData.coins ?? 0,
      subscription_type: null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(userId: string, updates: {
  name?: string;
  image?: string;
  coins?: number;
}) {
  // Use supabaseAdmin to bypass RLS policies
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update specific coin type
export async function updateUserCoinsByType(
  userId: string,
  coinType: 'coins' | 'inapp_coins' | 'sub_coins',
  amount: number
) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('users')
    .update({ [coinType]: amount })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add coins to specific type
export async function addCoins(
  userId: string,
  coinType: 'coins' | 'inapp_coins' | 'sub_coins',
  amount: number
) {
  const admin = getSupabaseAdmin();
  const user = await getUserById(userId);

  const currentAmount = (user as any)[coinType] || 0;
  const newAmount = currentAmount + amount;

  const { data, error } = await admin
    .from('users')
    .update({ [coinType]: newAmount })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Deduct coins in order: sub_coins -> coins -> inapp_coins
export async function deductCoins(userId: string, amount: number) {
  const admin = getSupabaseAdmin();
  const user = await getUserById(userId);

  let subCoins = (user as any).sub_coins || 0;
  let freeCoins = user.coins || 0;
  let inappCoins = (user as any).inapp_coins || 0;

  let remaining = amount;

  // First deduct from sub_coins
  if (remaining > 0 && subCoins > 0) {
    const deduct = Math.min(remaining, subCoins);
    subCoins -= deduct;
    remaining -= deduct;
  }

  // Then deduct from free coins
  if (remaining > 0 && freeCoins > 0) {
    const deduct = Math.min(remaining, freeCoins);
    freeCoins -= deduct;
    remaining -= deduct;
  }

  // Finally deduct from inapp_coins
  if (remaining > 0 && inappCoins > 0) {
    const deduct = Math.min(remaining, inappCoins);
    inappCoins -= deduct;
    remaining -= deduct;
  }

  if (remaining > 0) {
    throw new Error('Insufficient coins');
  }

  const { data, error } = await admin
    .from('users')
    .update({
      sub_coins: subCoins,
      coins: freeCoins,
      inapp_coins: inappCoins,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get total coins (sum of all three types)
export async function getTotalCoins(userId: string): Promise<number> {
  const user = await getUserById(userId);
  const subCoins = (user as any).sub_coins || 0;
  const freeCoins = user.coins || 0;
  const inappCoins = (user as any).inapp_coins || 0;
  return subCoins + freeCoins + inappCoins;
}

// Legacy function for backward compatibility
export async function updateUserCoins(userId: string, coins: number) {
  return updateUserCoinsByType(userId, 'coins', coins);
}

export async function getUserOrders(userId: string) {
  // Use admin client to bypass RLS policies
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createOrder(orderData: {
  user_id: string;
  type: string;
  amount: number;
  coins?: number;
  subscription_type?: string;
}) {
  // Use supabaseAdmin to bypass RLS policies
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('orders')
    .insert({
      user_id: orderData.user_id,
      type: orderData.type,
      amount: orderData.amount,
      coins: orderData.coins,
      subscription_type: orderData.subscription_type,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getModelsByType(type: string) {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('type', type)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[getModelsByType] Error:', error);
    throw error;
  }

  // 确保始终返回数组
  if (!data || !Array.isArray(data)) {
    console.warn('[getModelsByType] No models found for type:', type, 'Returning empty array');
    return [];
  }

  return data;
}

// Generation History functions
export async function createGenerationHistory(historyData: {
  user_id: string;
  task_type: string;
  model: string;
  job_id: string;
  prompt?: string;
  params?: Record<string, any>;
  price: number;
  status?: number;
}) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('generation_history')
    .insert({
      user_id: historyData.user_id,
      task_type: historyData.task_type,
      model: historyData.model,
      job_id: historyData.job_id,
      prompt: historyData.prompt,
      params: historyData.params,
      price: historyData.price,
      status: historyData.status ?? 1,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGenerationHistory(
  jobId: string,
  updates: {
    status?: number;
    result?: Record<string, any>;
    error_message?: string;
  }
) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('generation_history')
    .update(updates)
    .eq('job_id', jobId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getGenerationHistoryByUserId(userId: string, limit: number = 50) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('generation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getGenerationHistoryByJobId(jobId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('generation_history')
    .select('*')
    .eq('job_id', jobId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrder(orderId: string, updates: {
  status?: string;
  paypal_order_id?: string;
}) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('orders')
    .update(updates as any)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrderByPaypalOrderId(paypalOrderId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('orders')
    .select('*')
    .eq('paypal_order_id', paypalOrderId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubscription(userId: string, updates: {
  rights_type?: string; // lite, pro, max
  subscription_type?: string; // week, year
  subscription_expires_at?: Date;
  sub_coins?: number; // 订阅赠送的金币（直接覆盖）
}) {
  const admin = getSupabaseAdmin();
  const updateData: Record<string, any> = {};
  if (updates.rights_type !== undefined) updateData.rights_type = updates.rights_type;
  if (updates.subscription_type !== undefined) updateData.subscription_type = updates.subscription_type;
  if (updates.subscription_expires_at !== undefined) updateData.subscription_expires_at = updates.subscription_expires_at;
  if (updates.sub_coins !== undefined) updateData.sub_coins = updates.sub_coins;

  console.log('[updateSubscription] Updating user:', userId, 'with data:', JSON.stringify(updateData));

  const { data, error } = await admin
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[updateSubscription] Error:', error);
    throw error;
  }

  console.log('[updateSubscription] Update successful, result:', data);
  return data;
}

// 获取所有激活的金币包配置
export async function getActiveCoinPackages() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('coin_packages')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}

// 根据 package_id 获取金币包配置
export async function getCoinPackage(packageId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('coin_packages')
    .select('*')
    .eq('package_id', packageId)
    .eq('active', true)
    .single();

  if (error) throw error;
  return data;
}

// 获取所有激活的订阅套餐配置
export async function getActiveSubscriptionPackages() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('subscription_packages')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}

// 根据 plan_id 和 billing_cycle 获取订阅套餐配置
export async function getSubscriptionPackage(planId: string, billingCycle: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('subscription_packages')
    .select('*')
    .eq('plan_id', planId)
    .eq('billing_cycle', billingCycle)
    .eq('active', true)
    .single();

  if (error) throw error;
  return data;
}
