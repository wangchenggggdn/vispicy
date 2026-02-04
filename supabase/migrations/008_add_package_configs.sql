-- 金币包配置表
CREATE TABLE IF NOT EXISTS coin_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id VARCHAR(50) UNIQUE NOT NULL, -- pkg1, pkg2, etc.
  name VARCHAR(255) NOT NULL,
  description TEXT,
  coins INTEGER NOT NULL CHECK (coins >= 0),
  bonus_coins INTEGER DEFAULT 0 CHECK (bonus_coins >= 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(10) DEFAULT 'USD',
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订阅套餐配置表
CREATE TABLE IF NOT EXISTS subscription_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id VARCHAR(50) NOT NULL, -- lite, pro, max
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('week', 'year', 'month')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  coins INTEGER NOT NULL CHECK (coins >= 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(10) DEFAULT 'USD',
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, billing_cycle)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_coin_packages_package_id ON coin_packages(package_id);
CREATE INDEX IF NOT EXISTS idx_coin_packages_active ON coin_packages(active);
CREATE INDEX IF NOT EXISTS idx_coin_packages_sort ON coin_packages(sort_order);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_plan_cycle ON subscription_packages(plan_id, billing_cycle);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_active ON subscription_packages(active);

-- 添加注释
COMMENT ON TABLE coin_packages IS '金币购买套餐配置';
COMMENT ON TABLE subscription_packages IS '订阅套餐配置';

-- 创建触发器更新 updated_at
CREATE TRIGGER update_coin_packages_updated_at
  BEFORE UPDATE ON coin_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_packages_updated_at
  BEFORE UPDATE ON subscription_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入初始金币包数据
INSERT INTO coin_packages (package_id, name, description, coins, bonus_coins, price, popular, sort_order) VALUES
  ('pkg1', '超值大礼包', '最超值的金币礼包', 10000, 3000, 139.98, true, 1),
  ('pkg2', '豪华礼包', '丰富的金币奖励', 6000, 1500, 96.99, false, 2),
  ('pkg3', '高级礼包', '适合高级用户', 3200, 600, 55.98, false, 3),
  ('pkg4', '标准礼包', '性价比之选', 2300, 200, 41.98, false, 4),
  ('pkg5', '入门礼包', '新手推荐', 800, 0, 17.99, false, 5)
ON CONFLICT DO NOTHING;

-- 插入初始订阅套餐数据
INSERT INTO subscription_packages (plan_id, billing_cycle, name, description, coins, price, popular, sort_order) VALUES
  ('lite', 'week', 'Lite 周付', '轻量级订阅方案', 600, 7.99, false, 1),
  ('lite', 'year', 'Lite 年付', '轻量级年付优惠', 4000, 39.99, false, 2),
  ('pro', 'week', 'Pro 周付', '专业级订阅方案', 1200, 9.99, true, 3),
  ('pro', 'year', 'Pro 年付', '专业级年付优惠', 8000, 69.99, true, 4),
  ('max', 'week', 'Max 周付', '顶级订阅方案', 3500, 29.99, false, 5),
  ('max', 'year', 'Max 年付', '顶级年付优惠', 25000, 169, false, 6)
ON CONFLICT DO NOTHING;
