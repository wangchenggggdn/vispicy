-- 创建联系消息表
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(50) NOT NULL CHECK (subject IN ('general', 'support', 'sales', 'billing', 'partnership', 'feedback', 'other')),
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- 添加注释
COMMENT ON TABLE contact_messages IS '联系消息表';
COMMENT ON COLUMN contact_messages.name IS '发送者姓名';
COMMENT ON COLUMN contact_messages.email IS '发送者邮箱';
COMMENT ON COLUMN contact_messages.subject IS '消息主题';
COMMENT ON COLUMN contact_messages.message IS '消息内容';
COMMENT ON COLUMN contact_messages.status IS '消息状态：pending-待处理, in_progress-处理中, resolved-已解决, closed-已关闭';
COMMENT ON COLUMN contact_messages.user_id IS '关联的用户ID（如果发送者是已登录用户）';
