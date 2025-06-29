-- Add a generated tsvector column for full-text search
ALTER TABLE deals
  ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(marketplace,''))
  ) STORED;

-- Create a GIN index for fast full-text search
CREATE INDEX deals_search_vector_idx ON deals USING GIN (search_vector);
