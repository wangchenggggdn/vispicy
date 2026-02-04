-- 插入测试用户
INSERT INTO users (id, email, name, coins)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@vicraft.com',
  '测试用户',
  10000
)
ON CONFLICT (email) DO UPDATE SET
  coins = 10000,
  updated_at = NOW();
