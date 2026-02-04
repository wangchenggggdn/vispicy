-- 更新测试用户为年订阅用户
-- 请将 test@vicraft.com 替换为你的实际用户邮箱

UPDATE users
SET subscription_type = 'pro',
    subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE email = 'test@vicraft.com';

-- 验证更新结果
SELECT email,
       subscription_type,
       subscription_expires_at,
       coins
FROM users
WHERE email = 'test@vicraft.com';
