-- 创建自动删除24小时前记录的函数
CREATE OR REPLACE FUNCTION cleanup_old_generation_history()
RETURNS void AS $$
BEGIN
  DELETE FROM generation_history
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 创建pg_cron定时任务（如果已安装pg_cron扩展）
-- 注意：需要在Supabase控制台手动启用pg_cron扩展
-- 执行: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每小时执行一次清理
-- SELECT cron.schedule('cleanup-generation-history', '0 * * * *', 'SELECT cleanup_old_generation_history()');
