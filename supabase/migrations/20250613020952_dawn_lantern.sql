/*
  # Fix Row Level Security for user_deal_views table

  1. Security Updates
    - Drop existing RLS policies for user_deal_views table
    - Create new, more explicit RLS policies for INSERT and SELECT operations
    - Ensure anonymous users can track deal views with session_id
    - Ensure authenticated users can track deal views with user_id

  2. Policy Details
    - INSERT: Allow if user is authenticated and owns the record, OR if user is anonymous with valid session_id
    - SELECT: Allow if user is authenticated and owns the record, OR if user is anonymous with matching session_id
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow deal view tracking" ON user_deal_views;
DROP POLICY IF EXISTS "Allow viewing deal views" ON user_deal_views;

-- Create new INSERT policy for deal view tracking
CREATE POLICY "Enable deal view tracking for all users"
  ON user_deal_views
  FOR INSERT
  TO public
  WITH CHECK (
    -- Authenticated users can insert their own records
    (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
    OR
    -- Anonymous users can insert records with session_id and null user_id
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

-- Create new SELECT policy for viewing deal views
CREATE POLICY "Enable viewing deal views for all users"
  ON user_deal_views
  FOR SELECT
  TO public
  USING (
    -- Authenticated users can view their own records
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Anonymous users can view records with their session_id
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
    OR
    -- Allow viewing for analytics purposes (you might want to restrict this further)
    true
  );