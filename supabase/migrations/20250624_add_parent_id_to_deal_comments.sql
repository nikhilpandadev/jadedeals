-- Add parent_id column to deal_comments for comment threading
ALTER TABLE deal_comments ADD COLUMN parent_id uuid REFERENCES deal_comments(id) ON DELETE CASCADE;

-- Optionally, you may want to create an index for faster lookups
CREATE INDEX IF NOT EXISTS deal_comments_parent_id_idx ON deal_comments(parent_id);
