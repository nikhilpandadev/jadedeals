-- Migration: Create archive tables and archiving function

-- 1. Archive tables
CREATE TABLE IF NOT EXISTS archived_deals (LIKE deals INCLUDING ALL);
CREATE TABLE IF NOT EXISTS archived_deal_comments (LIKE deal_comments INCLUDING ALL);
CREATE TABLE IF NOT EXISTS archived_deal_interactions (LIKE deal_interactions INCLUDING ALL);
CREATE TABLE IF NOT EXISTS archived_deal_shares (LIKE deal_shares INCLUDING ALL);
CREATE TABLE IF NOT EXISTS archived_deal_saves (LIKE deal_saves INCLUDING ALL);
CREATE TABLE IF NOT EXISTS archived_deal_analytics (LIKE deal_analytics INCLUDING ALL);

-- 2. Archiving function
CREATE OR REPLACE FUNCTION archive_expired_deals()
RETURNS void AS $$
DECLARE
  expired_deal_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO expired_deal_ids
  FROM deals
  WHERE expiry_date < (now() - interval '30 days');

  IF expired_deal_ids IS NULL THEN
    RETURN;
  END IF;

  -- Archive interactions
  INSERT INTO archived_deal_interactions SELECT * FROM deal_interactions WHERE deal_id = ANY(expired_deal_ids);
  DELETE FROM deal_interactions WHERE deal_id = ANY(expired_deal_ids);

  -- Archive comments
  INSERT INTO archived_deal_comments SELECT * FROM deal_comments WHERE deal_id = ANY(expired_deal_ids);
  DELETE FROM deal_comments WHERE deal_id = ANY(expired_deal_ids);

  -- Archive shares
  INSERT INTO archived_deal_shares SELECT * FROM deal_shares WHERE deal_id = ANY(expired_deal_ids);
  DELETE FROM deal_shares WHERE deal_id = ANY(expired_deal_ids);

  -- Archive saves
  INSERT INTO archived_deal_saves SELECT * FROM deal_saves WHERE deal_id = ANY(expired_deal_ids);
  DELETE FROM deal_saves WHERE deal_id = ANY(expired_deal_ids);

  -- Archive analytics
  INSERT INTO archived_deal_analytics SELECT * FROM deal_analytics WHERE deal_id = ANY(expired_deal_ids);
  DELETE FROM deal_analytics WHERE deal_id = ANY(expired_deal_ids);

  -- Archive deals
  INSERT INTO archived_deals SELECT * FROM deals WHERE id = ANY(expired_deal_ids);
  DELETE FROM deals WHERE id = ANY(expired_deal_ids);
END;
$$ LANGUAGE plpgsql;
