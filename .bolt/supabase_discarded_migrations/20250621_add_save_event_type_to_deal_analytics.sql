-- Add 'save' as a valid event_type for deal_analytics
ALTER TABLE deal_analytics
  DROP CONSTRAINT IF EXISTS deal_analytics_event_type_check;

ALTER TABLE deal_analytics
  ADD CONSTRAINT deal_analytics_event_type_check
  CHECK (event_type IN ('view', 'click', 'share', 'save'));
