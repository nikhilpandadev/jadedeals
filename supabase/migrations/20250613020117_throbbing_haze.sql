/*
  # Fix RLS policy for user_deal_views table

  1. Security Changes
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy that allows:
      - Authenticated users to insert their own views (user_id = auth.uid())
      - Unauthenticated users to insert session-based views (user_id IS NULL and session_id is provided)
    - Update SELECT policy to allow viewing session-based views for unauthenticated users

  2. Policy Details
    - INSERT: Allow if user is authenticated and user_id matches auth.uid(), OR if user is not authenticated and user_id is NULL
    - SELECT: Allow authenticated users to view their own views, and allow unauthenticated users to view session-based views
*/

-- Drop existing policies to recreate them with proper logic
DROP POLICY IF EXISTS "Anyone can insert deal views" ON user_deal_views;
DROP POLICY IF EXISTS "Users can view their own deal views" ON user_deal_views;

-- Create new INSERT policy that handles both authenticated and unauthenticated users
CREATE POLICY "Allow deal view tracking"
  ON user_deal_views
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow authenticated users to insert their own views
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Allow unauthenticated users to insert session-based views
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

-- Create new SELECT policy that handles both authenticated and unauthenticated access
CREATE POLICY "Allow viewing deal views"
  ON user_deal_views
  FOR SELECT
  TO public
  USING (
    -- Authenticated users can view their own views
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Allow viewing session-based views (for counting purposes)
    (user_id IS NULL AND session_id IS NOT NULL)
  );