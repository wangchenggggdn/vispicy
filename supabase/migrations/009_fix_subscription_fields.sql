-- 添加 rights_type 字段用于存储订阅等级 (lite/pro/max)
ALTER TABLE users ADD COLUMN IF NOT EXISTS rights_type VARCHAR(20) CHECK (rights_type IN ('lite', 'pro', 'max'));

-- 修改 subscription_type 字段的约束，改为只存储计费周期 (week/year)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_type_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_type_check
  CHECK (subscription_type IN ('week', 'year', NULL));

-- 迁移现有数据：如果 subscription_type 是 'lite'/'pro'/'max'，移动到 rights_type
UPDATE users
SET
  rights_type = subscription_type,
  subscription_type = NULL
WHERE subscription_type IN ('lite', 'pro', 'max');

-- 同时更新 orders 表的约束，使其与 users 表一致
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_subscription_type_check;
ALTER TABLE orders ADD CONSTRAINT orders_subscription_type_check
  CHECK (subscription_type IN ('week', 'year', NULL));

-- 添加注释说明字段的用途
COMMENT ON COLUMN users.rights_type IS '订阅等级：lite(轻量), pro(专业), max(顶级)';
COMMENT ON COLUMN users.subscription_type IS '计费周期：week(周付), year(年付)';

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_users_rights_type ON users(rights_type);
CREATE INDEX IF NOT EXISTS idx_users_subscription_type ON users(subscription_type);
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires ON users(subscription_expires_at);
