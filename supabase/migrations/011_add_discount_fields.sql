-- 为 subscription_packages 表添加折扣字段
ALTER TABLE subscription_packages
ADD COLUMN IF NOT EXISTS image_discount INTEGER DEFAULT 0, -- 图像功能折扣百分比 (0-100)
ADD COLUMN IF NOT EXISTS video_discount INTEGER DEFAULT 0; -- 视频功能折扣百分比 (0-100)

-- 更新现有数据的折扣值
UPDATE subscription_packages SET image_discount = 70, video_discount = 70 WHERE plan_id = 'lite' AND billing_cycle = 'week';
UPDATE subscription_packages SET image_discount = 50, video_discount = 50 WHERE plan_id = 'pro' AND billing_cycle = 'week';
UPDATE subscription_packages SET image_discount = 0, video_discount = 30 WHERE plan_id = 'max' AND billing_cycle = 'week';

-- 年付套餐的折扣（假设与周付相同）
UPDATE subscription_packages SET image_discount = 70, video_discount = 70 WHERE plan_id = 'lite' AND billing_cycle = 'year';
UPDATE subscription_packages SET image_discount = 50, video_discount = 50 WHERE plan_id = 'pro' AND billing_cycle = 'year';
UPDATE subscription_packages SET image_discount = 0, video_discount = 30 WHERE plan_id = 'max' AND billing_cycle = 'year';

-- 添加注释
COMMENT ON COLUMN subscription_packages.image_discount IS '图像功能折扣百分比，0表示免费，70表示7折（70% Off）';
COMMENT ON COLUMN subscription_packages.video_discount IS '视频功能折扣百分比，0表示免费，30表示7折（30% Off）';
