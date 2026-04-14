-- Calendar sharing via public links
CREATE TABLE calendar_shares (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL,
  token      UUID NOT NULL DEFAULT gen_random_uuid(),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_calendar_shares_token ON calendar_shares(token);
CREATE INDEX idx_calendar_shares_user ON calendar_shares(user_id);
