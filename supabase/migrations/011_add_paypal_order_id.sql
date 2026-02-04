-- 添加 paypal_order_id 字段到 orders 表
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paypal_order_id TEXT UNIQUE;

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id);

-- 添加注释
COMMENT ON COLUMN orders.paypal_order_id IS 'PayPal 订单 ID，用于关联 PayPal 支付';
