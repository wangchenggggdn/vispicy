import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization — avoids "supabaseUrl is required" during `next build`
// when env vars are not injected at build time.
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
  }
  return url;
}

/** Anon key client — respects RLS */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
    }
    _supabase = createClient(getSupabaseUrl(), anonKey);
  }
  return _supabase;
}

/** Service role client — bypasses RLS (server-side only) */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations');
    }
    _supabaseAdmin = createClient(getSupabaseUrl(), serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
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
  email: string;
  name?: string | null;
  image?: string | null;
  coins?: number;
  apple_id?: string;
  google_id?: string;
}) {
  // Use supabaseAdmin to bypass RLS policies
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('users')
    .insert({
      email: userData.email,
      name: userData.name,
      image: userData.image,
      coins: userData.coins ?? 0,
      subscription_type: null,
      apple_id: userData.apple_id,
      google_id: userData.google_id,
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
  apple_id?: string;
  google_id?: string;
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
  const { data, error } = await getSupabase()
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

  // Calculate 24 hours ago
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from('generation_history')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', twentyFourHoursAgo)
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

// 根据 Apple ID 查找用户
export async function getUserByAppleId(appleId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('users')
    .select('*')
    .eq('apple_id', appleId)
    .maybeSingle();

  if (error) {
    console.error('[getUserByAppleId] Error:', error);
    throw error;
  }

  return data;
}

// 根据 Google ID 查找用户
export async function getUserByGoogleId(googleId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('users')
    .select('*')
    .eq('google_id', googleId)
    .maybeSingle();

  if (error) {
    console.error('[getUserByGoogleId] Error:', error);
    throw error;
  }

  return data;
}

// Contact Message functions
export async function createContactMessage(messageData: {
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id?: string | null;
}) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('contact_messages')
    .insert({
      name: messageData.name,
      email: messageData.email,
      subject: messageData.subject,
      message: messageData.message,
      user_id: messageData.user_id,
    } as any) // 类型断言，因为 contact_messages 表可能不在类型定义中
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Check-in functions
const DAILY_REWARDS = [20, 50, 100, 60, 80, 50, 120]; // 7天奖励配置

// 获取用户本周签到记录
export async function getUserWeeklyCheckins(userId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(7);

  if (error) throw error;
  return data;
}

// 获取用户今天的签到状态
export async function getTodayCheckinStatus(userId: string) {
  const admin = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await admin
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 执行签到
export async function performDailyCheckin(userId: string) {
  const admin = getSupabaseAdmin();

  // 检查今天是否已签到
  const today = new Date().toISOString().split('T')[0];
  const existingCheckin = await getTodayCheckinStatus(userId);
  if (existingCheckin) {
    throw new Error('Already checked in today');
  }

  // 获取本周签到记录，计算今天是第几天
  const weeklyCheckins = await getUserWeeklyCheckins(userId);
  const checkedDays = weeklyCheckins.map(c => c.day_number);
  let nextDay = 1;

  // 找到第一个未签到的天数
  for (let i = 1; i <= 7; i++) {
    if (!checkedDays.includes(i)) {
      nextDay = i;
      break;
    }
  }

  // 如果7天都签完了，重新开始
  let shouldResetCycle = false;
  if (checkedDays.length >= 7) {
    nextDay = 1;
    shouldResetCycle = true;

    // 删除之前的签到记录，开始新的周期
    const { error: deleteError } = await admin
      .from('daily_checkins')
      .delete()
      .eq('user_id', userId)
      .lte('day_number', 7);

    if (deleteError) {
      console.error('Error resetting checkin cycle:', deleteError);
    }
  }

  const coinsReward = DAILY_REWARDS[nextDay - 1];

  // 开始事务
  // 1. 创建签到记录
  const { data: checkinData, error: checkinError } = await admin
    .from('daily_checkins')
    .insert({
      user_id: userId,
      checkin_date: today,
      day_number: nextDay,
      coins_rewarded: coinsReward,
    })
    .select()
    .single();

  if (checkinError) throw checkinError;

  // 2. 增加用户金币
  await addCoins(userId, 'coins', coinsReward);

  return {
    dayNumber: nextDay,
    coinsReward,
    checkin: checkinData,
  };
}

// 获取签到奖励配置
export function getDailyRewards() {
  return DAILY_REWARDS;
}

// Template functions
export async function getTemplatesByType(type: 'image' | 'video') {
  const { data, error } = await getSupabase()
    .from('templates')
    .select('*')
    .eq('type', type)
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[getTemplatesByType] Error:', error);
    throw error;
  }

  return data || [];
}

export async function getTemplatesByCategory(type: 'image' | 'video', category: string) {
  const { data, error } = await getSupabase()
    .from('templates')
    .select('*')
    .eq('type', type)
    .eq('category', category)
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[getTemplatesByCategory] Error:', error);
    throw error;
  }

  return data || [];
}

export async function getTemplateById(id: string) {
  const { data, error } = await getSupabase()
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllTemplates() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('templates')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTemplate(templateData: {
  name: string;
  description?: string;
  type: 'image' | 'video';
  category?: string;
  model_id?: string;
  model_name?: string;
  task_type: string;
  parameters?: Record<string, any>;
  prompt_template?: string;
  max_images?: number;
  example_prompt?: string;
  example_images?: string[];
  preview_image?: string;
  icon?: string;
  sort_order?: number;
  active?: boolean;
}) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('templates')
    .insert({
      name: templateData.name,
      description: templateData.description,
      type: templateData.type,
      category: templateData.category,
      model_id: templateData.model_id,
      model_name: templateData.model_name,
      task_type: templateData.task_type,
      parameters: templateData.parameters || {},
      prompt_template: templateData.prompt_template,
      max_images: templateData.max_images || 0,
      example_prompt: templateData.example_prompt,
      example_images: templateData.example_images || [],
      preview_image: templateData.preview_image,
      icon: templateData.icon,
      sort_order: templateData.sort_order || 0,
      active: templateData.active !== undefined ? templateData.active : true,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTemplate(id: string, updates: {
  name?: string;
  description?: string;
  type?: 'image' | 'video';
  category?: string;
  model_id?: string;
  model_name?: string;
  task_type?: string;
  parameters?: Record<string, any>;
  prompt_template?: string;
  max_images?: number;
  example_prompt?: string;
  example_images?: string[];
  preview_image?: string;
  icon?: string;
  sort_order?: number;
  active?: boolean;
}) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('templates' as any)
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('templates')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
