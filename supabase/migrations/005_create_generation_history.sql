-- 创作记录表
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL, -- text2image, image2image, text2video, image2video
  model VARCHAR(255) NOT NULL, -- 模型 shortapi
  job_id VARCHAR(255) NOT NULL UNIQUE, -- 任务ID
  prompt TEXT,
  params JSONB, -- 模型参数
  price INTEGER NOT NULL, -- 扣费金币数
  status INTEGER DEFAULT 1, -- 1=进行中, 2=成功, 3=失败
  result JSONB, -- 结果数据（图片URL、视频URL等）
  error_message TEXT, -- 错误信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_job_id ON generation_history(job_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);

-- 启用RLS
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户只能查看自己的记录
CREATE POLICY "Users can view own generation history"
  ON generation_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS策略：用户可以插入自己的记录
CREATE POLICY "Users can insert own generation history"
  ON generation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS策略：用户可以更新自己的记录
CREATE POLICY "Users can update own generation history"
  ON generation_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 添加updated_at触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generation_history_updated_at
  BEFORE UPDATE ON generation_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
