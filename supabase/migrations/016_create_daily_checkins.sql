-- Daily Check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  coins_rewarded INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_checkin_date ON daily_checkins(checkin_date);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_daily_checkins_updated_at ON daily_checkins;
CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
