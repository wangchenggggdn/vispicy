-- 给测试用户添加年订阅订单记录
-- 请将 user_id 替换为你的实际用户ID（可以在users表中查看）

-- 先获取用户ID（如果不知道的话）
SELECT id, email, subscription_type FROM users WHERE email = 'test@vicraft.com';

-- 插入订阅订单记录
INSERT INTO orders (
  user_id,
  type,
  amount,
  coins,
  subscription_type,
  status,
  created_at
) VALUES (
  (SELECT id FROM users WHERE email = 'test@vicraft.com'),  -- 自动获取user_id
  'subscription',
  299.00,  -- 年订阅价格（示例）
  0,       -- 订阅不赠送金币
  'pro',   -- 专业版
  'completed',
  NOW()
);

-- 验证插入的订单
SELECT * FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'test@vicraft.com') ORDER BY created_at DESC LIMIT 1;
