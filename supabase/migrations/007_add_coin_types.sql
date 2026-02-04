-- Add inapp_coins and sub_coins columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS inapp_coins INTEGER DEFAULT 0 CHECK (inapp_coins >= 0),
ADD COLUMN IF NOT EXISTS sub_coins INTEGER DEFAULT 0 CHECK (sub_coins >= 0);

-- Update existing orders table check constraint to support new order types
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_type_check;
ALTER TABLE orders ADD CONSTRAINT orders_type_check
CHECK (type IN ('inapp', 'subscription', 'task'));

-- Comment to document the new fields
COMMENT ON COLUMN users.coins IS 'Free coins given to new users on registration';
COMMENT ON COLUMN users.inapp_coins IS 'Coins purchased through in-app purchases';
COMMENT ON COLUMN users.sub_coins IS 'Coins given as part of subscription plans';
