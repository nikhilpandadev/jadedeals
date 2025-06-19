/*
  # Add relationship between deal_comments and user_profiles

  1. Changes
    - Add foreign key constraint linking deal_comments.user_id to user_profiles.id
    - This enables proper joins between comments and user profile data

  2. Security
    - Maintains existing RLS policies
    - No changes to existing permissions
*/

-- Add foreign key constraint to link deal_comments to user_profiles
-- Note: This assumes user_id in deal_comments should reference user_profiles.id
-- If the existing user_id references auth.users, we may need to adjust the approach

DO $$
BEGIN
  -- Check if the foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'deal_comments_user_id_profile_fkey'
    AND table_name = 'deal_comments'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE public.deal_comments 
    ADD CONSTRAINT deal_comments_user_id_profile_fkey 
    FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;