-- Migration: Create followers table for social connections
CREATE TABLE IF NOT EXISTS followers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shopper_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    promoter_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(shopper_id, promoter_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_followers_shopper_id ON followers(shopper_id);
CREATE INDEX IF NOT EXISTS idx_followers_promoter_id ON followers(promoter_id);
