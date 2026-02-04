-- Add sort_order field to models table
-- 添加sort_order字段到models表

-- Add sort_order column
ALTER TABLE models
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN models.sort_order IS 'Display order for models (lower values appear first)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_models_sort_order ON models(sort_order);

-- Update existing models with sort_order values
-- 按照创建顺序，给每个模型分配sort_order
-- 文生图模型
UPDATE models SET sort_order = 1 WHERE name = 'Flux' AND type = 'text-to-image';
UPDATE models SET sort_order = 2 WHERE name = 'SDXL' AND type = 'text-to-image';

-- 图生图模型
UPDATE models SET sort_order = 1 WHERE name = 'SDXL Img2Img' AND type = 'image-to-image';

-- 文生视频模型
UPDATE models SET sort_order = 1 WHERE name = 'Kling' AND type = 'text-to-video';
UPDATE models SET sort_order = 2 WHERE name = 'Luma' AND type = 'text-to-video';

-- 图生视频模型
UPDATE models SET sort_order = 1 WHERE name = 'Kling Img2Vid' AND type = 'image-to-video';
UPDATE models SET sort_order = 2 WHERE name = 'Luma Img2Vid' AND type = 'image-to-video';
