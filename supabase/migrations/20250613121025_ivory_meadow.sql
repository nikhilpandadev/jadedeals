/*
  # Fix RLS Policy for User Profiles

  1. Security Updates
    - Update INSERT policy to use correct auth.uid() function
    - Update UPDATE policy to use correct auth.uid() function
    - Ensure policies allow proper user profile creation during signup

  2. Changes
    - Drop existing policies that use uid() function
    - Create new policies using auth.uid() function
    - Maintain security while allowing proper signup flow
*/

-- Drop existing policies that use incorrect uid() function
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Create new INSERT policy with correct auth.uid() function
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create new UPDATE policy with correct auth.uid() function  
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);