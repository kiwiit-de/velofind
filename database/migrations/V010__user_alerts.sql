-- V010__user_alerts.sql
-- VeloFind Price Drop Alert Subscriptions (UserAlerts)

CREATE TABLE IF NOT EXISTS user_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  offer_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  initial_price_cents INT NOT NULL CHECK (initial_price_cents > 0),
  target_price_cents INT CHECK (target_price_cents > 0),
  is_triggered BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_alerts_offer_id ON user_alerts(offer_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_email ON user_alerts(email);
CREATE INDEX IF NOT EXISTS idx_user_alerts_active ON user_alerts(offer_id) WHERE is_triggered = false;

-- Convenient alias view for UserAlerts table name
CREATE OR REPLACE VIEW "UserAlerts" AS SELECT * FROM user_alerts;
