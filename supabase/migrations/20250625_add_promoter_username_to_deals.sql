-- Add promoter_username to deals for public linking
ALTER TABLE deals ADD COLUMN promoter_username TEXT;
-- Optionally, backfill promoter_username for existing deals
UPDATE deals d
SET promoter_username = u.username
FROM user_profiles u
WHERE d.promoter_id = u.id;
-- Optionally, add an index for faster lookups
CREATE INDEX IF NOT EXISTS deals_promoter_username_idx ON deals(promoter_username);
