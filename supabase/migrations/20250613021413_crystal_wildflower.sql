/*
  # Remove Deal View Tracking

  1. Changes
    - Drop user_deal_views table if it exists
    - Clean up any related policies safely

  2. Notes
    - Uses IF EXISTS to avoid errors if table doesn't exist
    - Policies are automatically dropped when table is dropped
*/

-- Drop the user_deal_views table completely (policies are automatically dropped with the table)
DROP TABLE IF EXISTS user_deal_views CASCADE;