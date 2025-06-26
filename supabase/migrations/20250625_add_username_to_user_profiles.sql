-- Add username field to user_profiles and enforce uniqueness
ALTER TABLE user_profiles ADD COLUMN username TEXT UNIQUE;
-- Optionally, create an index for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_idx ON user_profiles(username);
