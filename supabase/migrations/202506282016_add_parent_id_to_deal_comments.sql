-- Migration: Add parent_id to deal_comments for nested replies
ALTER TABLE deal_comments ADD COLUMN parent_id uuid REFERENCES deal_comments(id) ON DELETE CASCADE;

-- Optional: Create an index for faster lookup of replies
CREATE INDEX IF NOT EXISTS idx_deal_comments_parent_id ON deal_comments(parent_id);
