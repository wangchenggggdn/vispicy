-- 启用 pg_cron 扩展（用于定时任务）
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 创建函数：每日为订阅用户赠送金币
CREATE OR REPLACE FUNCTION grant_daily_subscription_coins()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  coins_to_grant INTEGER;
BEGIN
  -- 遍历所有订阅有效的用户
  FOR user_record IN
    SELECT id, rights_type, subscription_type
    FROM users
    WHERE subscription_expires_at > NOW()
      AND rights_type IS NOT NULL
      AND rights_type IN ('lite', 'pro', 'max')
      AND subscription_type IS NOT NULL
      AND subscription_type IN ('week', 'year')
  LOOP
    -- 根据用户的 rights_type 和 subscription_type 从 subscription_packages 表获取金币数量
    SELECT coins INTO coins_to_grant
    FROM subscription_packages
    WHERE plan_id = user_record.rights_type
      AND billing_cycle = user_record.subscription_type
      AND active = true
    LIMIT 1;

    -- 如果找到对应的套餐，重置并更新用户的 sub_coins
    IF coins_to_grant IS NOT NULL THEN
      UPDATE users
      SET sub_coins = coins_to_grant
      WHERE id = user_record.id;

      RAISE NOTICE 'Granted % coins to user % (rights_type: %, subscription_type: %)',
        coins_to_grant, user_record.id, user_record.rights_type, user_record.subscription_type;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 创建每日定时任务
-- 每天 UTC 00:00 (北京时间 08:00) 执行
-- 使用 pg_cron 的 schedule 函数
SELECT cron.schedule(
  'grant-daily-subscription-coins',
  '0 0 * * *', -- 每天 UTC 00:00
  'SELECT grant_daily_subscription_coins();'
);

-- 验证定时任务是否创建成功
SELECT * FROM cron.job WHERE jobname = 'grant-daily-subscription-coins';

-- 添加注释
COMMENT ON FUNCTION grant_daily_subscription_coins() IS '每日为订阅有效的用户赠送金币，重置 sub_coins 字段';
