/*
  # Add Analytics Tracking and Deal Images

  1. New Tables
    - `deal_analytics` - Track clicks, views, and other metrics
    - `deal_saves` - Track when users save deals
    
  2. Schema Updates
    - Add `image_url` field to deals table
    - Add indexes for performance
    
  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
    
  4. Sample Data Updates
    - Update existing deals with sample images
*/

-- Add image_url field to deals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE deals ADD COLUMN image_url text;
  END IF;
END $$;

-- Create deal_analytics table for tracking metrics
CREATE TABLE IF NOT EXISTS deal_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  event_type text NOT NULL CHECK (event_type IN ('view', 'click', 'share')),
  created_at timestamptz DEFAULT now(),
  user_agent text,
  ip_address inet
);

CREATE VIEW daily_deal_analytics WITH (security_invoker=on) AS
SELECT DISTINCT event_type, deal_id, user_id, date(created_at)
FROM deal_analytics;

-- Create deal_saves table for save functionality
CREATE TABLE IF NOT EXISTS deal_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

-- Add save_count to deals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'save_count'
  ) THEN
    ALTER TABLE deals ADD COLUMN save_count integer DEFAULT 0 CHECK (save_count >= 0);
  END IF;
END $$;

-- Add view_count and click_count to deals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE deals ADD COLUMN view_count integer DEFAULT 0 CHECK (view_count >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'click_count'
  ) THEN
    ALTER TABLE deals ADD COLUMN click_count integer DEFAULT 0 CHECK (click_count >= 0);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE deal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_saves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deal_analytics
CREATE POLICY "Anyone can insert analytics"
  ON deal_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Promoters can view their deal analytics"
  ON deal_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = deal_analytics.deal_id 
      AND deals.promoter_id = auth.uid()
    )
  );

-- RLS Policies for deal_saves
CREATE POLICY "Users can manage their own saves"
  ON deal_saves
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view saves count"
  ON deal_saves
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_analytics_deal_id ON deal_analytics(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_analytics_user_id ON deal_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_analytics_event_type ON deal_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_deal_analytics_created_at ON deal_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_deal_saves_deal_id ON deal_saves(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_saves_user_id ON deal_saves(user_id);

-- Update deal counters function to include saves
CREATE OR REPLACE FUNCTION update_deal_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'deal_interactions' THEN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      UPDATE deals SET
        helpful_count = (
          SELECT COUNT(*) FROM deal_interactions 
          WHERE deal_id = NEW.deal_id AND is_helpful = true
        ),
        not_helpful_count = (
          SELECT COUNT(*) FROM deal_interactions 
          WHERE deal_id = NEW.deal_id AND is_helpful = false
        ),
        usage_count = (
          SELECT COUNT(*) FROM deal_interactions 
          WHERE deal_id = NEW.deal_id AND has_used = true
        ),
        updated_at = now()
      WHERE id = NEW.deal_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE deals SET
        helpful_count = (
          SELECT COUNT(*) FROM deal_interactions 
          WHERE deal_id = OLD.deal_id AND is_helpful = true
        ),
        not_helpful_count = (
          SELECT COUNT(*) FROM deal_interactions 
          WHERE deal_id = OLD.deal_id AND is_helpful = false
        ),
        usage_count = (
          SELECT COUNT(*) FROM deal_interactions 
          WHERE deal_id = OLD.deal_id AND has_used = true
        ),
        updated_at = now()
      WHERE id = OLD.deal_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'deal_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE deals SET
        comment_count = comment_count + 1,
        updated_at = now()
      WHERE id = NEW.deal_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE deals SET
        comment_count = GREATEST(comment_count - 1, 0),
        updated_at = now()
      WHERE id = OLD.deal_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'deal_shares' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE deals SET
        share_count = share_count + 1,
        updated_at = now()
      WHERE id = NEW.deal_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'deal_saves' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE deals SET
        save_count = save_count + 1,
        updated_at = now()
      WHERE id = NEW.deal_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE deals SET
        save_count = GREATEST(save_count - 1, 0),
        updated_at = now()
      WHERE id = OLD.deal_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'deal_analytics' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.event_type = 'view' THEN
        UPDATE deals SET
          view_count = view_count + 1,
          updated_at = now()
        WHERE id = NEW.deal_id;
      ELSIF NEW.event_type = 'click' THEN
        UPDATE deals SET
          click_count = click_count + 1,
          updated_at = now()
        WHERE id = NEW.deal_id;
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for new tables
CREATE TRIGGER update_deal_counters_saves
  AFTER INSERT OR DELETE ON deal_saves
  FOR EACH ROW EXECUTE FUNCTION update_deal_counters();

CREATE TRIGGER update_deal_counters_analytics
  AFTER INSERT ON deal_analytics
  FOR EACH ROW EXECUTE FUNCTION update_deal_counters();

-- Update existing deals with sample images
UPDATE deals SET image_url = 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE category = 'Electronics' AND image_url IS NULL;
UPDATE deals SET image_url = 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE category = 'Fashion' AND image_url IS NULL;
UPDATE deals SET image_url = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE category = 'Home & Garden' AND image_url IS NULL;
UPDATE deals SET image_url = 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE category = 'Health & Beauty' AND image_url IS NULL;
UPDATE deals SET image_url = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE category = 'Sports & Outdoors' AND image_url IS NULL;
UPDATE deals SET image_url = 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE category = 'Books & Media' AND image_url IS NULL;