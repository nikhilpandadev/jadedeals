-- Add 'category' column to 'resources' table
ALTER TABLE resources ADD COLUMN category TEXT;
ALTER TABLE resources ADD COLUMN tags TEXT;