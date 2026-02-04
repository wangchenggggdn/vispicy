-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends NextAuth users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  subscription_type VARCHAR(20) CHECK (subscription_type IN ('weekly', 'yearly')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('recharge', 'subscription', 'task')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  coins INTEGER CHECK (coins >= 0),
  subscription_type VARCHAR(20) CHECK (subscription_type IN ('weekly', 'yearly')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Models table (AI models)
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text-to-image', 'image-to-image', 'text-to-video', 'image-to-video')),
  api_model VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL DEFAULT 1 CHECK (price >= 0),
  description TEXT,
  parameters JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table (generation tasks)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('text-to-image', 'image-to-image', 'text-to-video', 'image-to-video')),
  prompt TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result_url TEXT,
  error TEXT,
  job_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_models_type ON models(type);
CREATE INDEX IF NOT EXISTS idx_models_active ON models(active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample AI models
INSERT INTO models (name, type, api_model, price, description, parameters) VALUES
  (
    'Stable Diffusion XL',
    'text-to-image',
    'stabilityai/stable-diffusion-xl-base-1.0/text-to-image',
    1,
    '高质量的文本生成图片模型，支持多种艺术风格',
    '[
      {"name": "width", "type": "select", "label": "宽度", "options": ["512", "768", "1024", "1280"], "default": "1024"},
      {"name": "height", "type": "select", "label": "高度", "options": ["512", "768", "1024", "1280"], "default": "1024"},
      {"name": "steps", "type": "select", "label": "步数", "options": ["20", "30", "50"], "default": "30"},
      {"name": "negative_prompt", "type": "text", "label": "负面提示词", "default": "ugly, blurry, low quality"}
    ]'::jsonb
  ),
  (
    'SDXL Image-to-Image',
    'image-to-image',
    'stabilityai/stable-diffusion-xl-refiner-1.0/image-to-image',
    2,
    '基于参考图片生成新的变体',
    '[
      {"name": "strength", "type": "select", "label": "变换强度", "options": ["0.3", "0.5", "0.7", "0.9"], "default": "0.7"},
      {"name": "steps", "type": "select", "label": "步数", "options": ["20", "30", "50"], "default": "30"}
    ]'::jsonb
  ),
  (
    'Vidu Text-to-Video',
    'text-to-video',
    'vidu/vidu-q2/text-to-video',
    5,
    '强大的文本生成视频模型',
    '[
      {"name": "duration", "type": "select", "label": "时长（秒）", "options": ["4", "8"], "default": "4"}
    ]'::jsonb
  ),
  (
    'Vidu Image-to-Video',
    'image-to-video',
    'vidu/vidu-q2/image-to-video',
    5,
    '将静态图片转化为动态视频',
    '[]'::jsonb
  )
ON CONFLICT DO NOTHING;
