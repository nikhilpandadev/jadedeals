/*
  # Add Promoter Profile Fields

  1. Schema Updates
    - Add `bio` field to user_profiles table for promoter descriptions
    - Add `website` field for promoter website links
    - Add `social_links` JSONB field for social media links
    
  2. Notes
    - Uses IF NOT EXISTS to avoid errors if columns already exist
    - JSONB type allows flexible storage of social media links
*/

-- Add bio field for promoter descriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bio text;
  END IF;
END $$;

-- Add website field for promoter websites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN website text;
  END IF;
END $$;

-- Add social_links JSONB field for social media links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN social_links jsonb DEFAULT '{}';
  END IF;
END $$;