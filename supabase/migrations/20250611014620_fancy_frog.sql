/*
  # Complete Deals Schema Migration

  1. New Tables
    - `user_profiles` - User profile information
    - `deals` - Deal listings with all required fields
    - `deal_interactions` - User interactions (helpful/not helpful, used)
    - `deal_comments` - User comments on deals
    - `deal_shares` - Deal sharing tracking
    - `user_deal_views` - Paywall functionality tracking

  2. Security
    - Enable RLS on all tables
    - Appropriate policies for each table
    - Users can only modify their own data
    - Public read access for deals and comments

  3. Features
    - Automatic counter updates via triggers
    - Performance indexes
    - Mock data for testing
*/

-- Create user_profiles table first
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('Shopper', 'promoter')),
  age_group text,
  city text,
  country text,
  zip_code text,
  income_group text,
  preferred_categories text[],
  shopping_frequency text,
  price_sensitivity text CHECK (price_sensitivity IN ('Budget', 'Mid-range', 'Premium')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) <= 120),
  description text NOT NULL CHECK (char_length(description) <= 240),
  coupon_code text,
  retail_price decimal(10,2) NOT NULL CHECK (retail_price > 0),
  current_price decimal(10,2) NOT NULL CHECK (current_price > 0),
  discount_percentage integer NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  category text NOT NULL,
  marketplace text NOT NULL,
  promoter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_link text NOT NULL,
  expiry_date timestamptz NOT NULL,
  helpful_count integer DEFAULT 0 CHECK (helpful_count >= 0),
  not_helpful_count integer DEFAULT 0 CHECK (not_helpful_count >= 0),
  comment_count integer DEFAULT 0 CHECK (comment_count >= 0),
  share_count integer DEFAULT 0 CHECK (share_count >= 0),
  usage_count integer DEFAULT 0 CHECK (usage_count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deal interactions table
CREATE TABLE IF NOT EXISTS deal_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful boolean,
  has_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

-- Create deal comments table
CREATE TABLE IF NOT EXISTS deal_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  comment text NOT NULL CHECK (char_length(comment) <= 500),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deal shares table
CREATE TABLE IF NOT EXISTS deal_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user deal views table for paywall functionality
CREATE TABLE IF NOT EXISTS user_deal_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(deal_id, user_id),
  UNIQUE(deal_id, session_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_deal_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for deals
CREATE POLICY "Anyone can view deals"
  ON deals
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Promoters can insert their own deals"
  ON deals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = promoter_id);

CREATE POLICY "Promoters can update their own deals"
  ON deals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = promoter_id)
  WITH CHECK (auth.uid() = promoter_id);

CREATE POLICY "Promoters can delete their own deals"
  ON deals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = promoter_id);

-- RLS Policies for deal interactions
CREATE POLICY "Users can view all interactions"
  ON deal_interactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own interactions"
  ON deal_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
  ON deal_interactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for deal comments
CREATE POLICY "Anyone can view comments"
  ON deal_comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON deal_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON deal_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON deal_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for deal shares
CREATE POLICY "Users can view all shares"
  ON deal_shares
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert shares"
  ON deal_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user deal views
CREATE POLICY "Users can view their own deal views"
  ON user_deal_views
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert deal views"
  ON user_deal_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);

CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_marketplace ON deals(marketplace);
CREATE INDEX IF NOT EXISTS idx_deals_promoter_id ON deals(promoter_id);
CREATE INDEX IF NOT EXISTS idx_deals_expiry_date ON deals(expiry_date);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);
CREATE INDEX IF NOT EXISTS idx_deals_discount_percentage ON deals(discount_percentage);
CREATE INDEX IF NOT EXISTS idx_deals_current_price ON deals(current_price);

CREATE INDEX IF NOT EXISTS idx_deal_interactions_deal_id ON deal_interactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_interactions_user_id ON deal_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_deal_comments_deal_id ON deal_comments(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_comments_user_id ON deal_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_deal_shares_deal_id ON deal_shares(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_shares_user_id ON deal_shares(user_id);

CREATE INDEX IF NOT EXISTS idx_user_deal_views_deal_id ON user_deal_views(deal_id);
CREATE INDEX IF NOT EXISTS idx_user_deal_views_user_id ON user_deal_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_deal_views_session_id ON user_deal_views(session_id);

-- Create function to update deal counters
CREATE OR REPLACE FUNCTION update_deal_counters()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
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
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_deal_counters_interactions
  AFTER INSERT OR UPDATE OR DELETE ON deal_interactions
  FOR EACH ROW EXECUTE FUNCTION update_deal_counters();

CREATE TRIGGER update_deal_counters_comments
  AFTER INSERT OR DELETE ON deal_comments
  FOR EACH ROW EXECUTE FUNCTION update_deal_counters();

CREATE TRIGGER update_deal_counters_shares
  AFTER INSERT ON deal_shares
  FOR EACH ROW EXECUTE FUNCTION update_deal_counters();

-- Insert mock promoter users and profiles
DO $$
BEGIN
  -- Insert mock promoter 1
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      '550e8400-e29b-41d4-a716-446655440001',
      'promoter1@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Tech Deals Pro"}'
    );
  END IF;

  -- Insert mock promoter 2
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      '550e8400-e29b-41d4-a716-446655440002',
      'promoter2@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Home & Beauty Deals"}'
    );
  END IF;

  -- Insert mock promoter 3
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440003') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      '550e8400-e29b-41d4-a716-446655440003',
      'promoter3@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sports & Lifestyle"}'
    );
  END IF;
END $$;

-- Insert user profiles for promoters
INSERT INTO user_profiles (id, email, user_type, age_group, city, country, zip_code, income_group, preferred_categories, shopping_frequency, price_sensitivity)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'promoter1@example.com', 'promoter', '25-34', 'New York', 'USA', '10001', '$50k-$75k', ARRAY['Electronics', 'Fashion'], 'Weekly', 'Mid-range'),
  ('550e8400-e29b-41d4-a716-446655440002', 'promoter2@example.com', 'promoter', '35-44', 'Los Angeles', 'USA', '90210', '$75k-$100k', ARRAY['Home & Garden', 'Health & Beauty'], 'Monthly', 'Premium'),
  ('550e8400-e29b-41d4-a716-446655440003', 'promoter3@example.com', 'promoter', '25-34', 'Chicago', 'USA', '60601', '$25k-$50k', ARRAY['Sports & Outdoors', 'Books & Media'], 'Weekly', 'Budget')
ON CONFLICT (id) DO NOTHING;

-- Insert mock deals
INSERT INTO deals (id, title, description, coupon_code, retail_price, current_price, discount_percentage, category, marketplace, promoter_id, affiliate_link, expiry_date)
VALUES 
  (
    gen_random_uuid(),
    'Apple AirPods Pro (2nd Generation) with MagSafe Case',
    'Experience next-level sound with Adaptive Transparency, Personalized Spatial Audio, and longer battery life.',
    'AIRPODS20',
    249.00,
    199.00,
    20,
    'Electronics',
    'Amazon',
    '550e8400-e29b-41d4-a716-446655440001',
    'https://amazon.com/airpods-pro',
    now() + interval '48 hours'
  ),
  (
    gen_random_uuid(),
    'Nike Air Max 270 Running Shoes - Mens',
    'Comfortable running shoes with Max Air unit for exceptional cushioning and modern style.',
    'NIKE30',
    150.00,
    105.00,
    30,
    'Fashion',
    'Nike',
    '550e8400-e29b-41d4-a716-446655440001',
    'https://nike.com/air-max-270',
    now() + interval '72 hours'
  ),
  (
    gen_random_uuid(),
    'Samsung 65" 4K Smart TV QLED',
    'Stunning 4K resolution with Quantum Dot technology and smart features for the ultimate viewing experience.',
    'SAMSUNG15',
    1299.00,
    1104.15,
    15,
    'Electronics',
    'Best Buy',
    '550e8400-e29b-41d4-a716-446655440002',
    'https://bestbuy.com/samsung-qled',
    now() + interval '24 hours'
  ),
  (
    gen_random_uuid(),
    'Dyson V15 Detect Cordless Vacuum',
    'Advanced cordless vacuum with laser dust detection and powerful suction for deep cleaning.',
    null,
    749.99,
    524.99,
    30,
    'Home & Garden',
    'Dyson',
    '550e8400-e29b-41d4-a716-446655440002',
    'https://dyson.com/v15-detect',
    now() + interval '96 hours'
  ),
  (
    gen_random_uuid(),
    'Levi''s 501 Original Fit Jeans',
    'Classic straight-leg jeans with authentic styling and durable construction.',
    'LEVIS25',
    69.50,
    52.13,
    25,
    'Fashion',
    'Levi''s',
    '550e8400-e29b-41d4-a716-446655440003',
    'https://levis.com/501-jeans',
    now() + interval '120 hours'
  ),
  (
    gen_random_uuid(),
    'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    'Multi-functional kitchen appliance that pressure cooks, slow cooks, rice cooker, steamer, and more.',
    'INSTANT40',
    99.95,
    59.97,
    40,
    'Home & Garden',
    'Amazon',
    '550e8400-e29b-41d4-a716-446655440001',
    'https://amazon.com/instant-pot-duo',
    now() + interval '36 hours'
  ),
  (
    gen_random_uuid(),
    'Adidas Ultraboost 22 Running Shoes',
    'Premium running shoes with responsive BOOST midsole and Primeknit upper for ultimate comfort.',
    'ADIDAS20',
    190.00,
    152.00,
    20,
    'Sports & Outdoors',
    'Adidas',
    '550e8400-e29b-41d4-a716-446655440003',
    'https://adidas.com/ultraboost-22',
    now() + interval '60 hours'
  ),
  (
    gen_random_uuid(),
    'MacBook Air M2 13-inch Laptop',
    'Supercharged by M2 chip with 8-core CPU, up to 18 hours battery life, and stunning Liquid Retina display.',
    'APPLE10',
    1199.00,
    1079.10,
    10,
    'Electronics',
    'Apple',
    '550e8400-e29b-41d4-a716-446655440002',
    'https://apple.com/macbook-air-m2',
    now() + interval '168 hours'
  ),
  (
    gen_random_uuid(),
    'The Ordinary Niacinamide 10% + Zinc 1%',
    'High-strength vitamin and mineral blemish formula for clearer, more balanced skin.',
    'ORDINARY15',
    7.90,
    6.72,
    15,
    'Health & Beauty',
    'Sephora',
    '550e8400-e29b-41d4-a716-446655440002',
    'https://sephora.com/ordinary-niacinamide',
    now() + interval '48 hours'
  ),
  (
    gen_random_uuid(),
    'PlayStation 5 Console',
    'Next-gen gaming console with lightning-fast loading, haptic feedback, and stunning 4K graphics.',
    null,
    499.99,
    449.99,
    10,
    'Electronics',
    'GameStop',
    '550e8400-e29b-41d4-a716-446655440001',
    'https://gamestop.com/ps5-console',
    now() + interval '12 hours'
  ),
  (
    gen_random_uuid(),
    'Fitbit Charge 5 Advanced Fitness Tracker',
    'Advanced health and fitness tracker with built-in GPS, stress management, and 6+ day battery life.',
    'FITBIT35',
    179.95,
    116.97,
    35,
    'Health & Beauty',
    'Fitbit',
    '550e8400-e29b-41d4-a716-446655440003',
    'https://fitbit.com/charge-5',
    now() + interval '84 hours'
  ),
  (
    gen_random_uuid(),
    'KitchenAid Stand Mixer 5-Quart',
    'Professional-grade stand mixer with 10 speeds and multiple attachments for all your baking needs.',
    'KITCHEN20',
    379.99,
    303.99,
    20,
    'Home & Garden',
    'Williams Sonoma',
    '550e8400-e29b-41d4-a716-446655440002',
    'https://williams-sonoma.com/kitchenaid-mixer',
    now() + interval '72 hours'
  ),
  (
    gen_random_uuid(),
    'Patagonia Better Sweater Fleece Jacket',
    'Cozy fleece jacket made from recycled polyester with classic styling and superior warmth.',
    'PATAGONIA25',
    139.00,
    104.25,
    25,
    'Fashion',
    'Patagonia',
    '550e8400-e29b-41d4-a716-446655440003',
    'https://patagonia.com/better-sweater',
    now() + interval '96 hours'
  ),
  (
    gen_random_uuid(),
    'Kindle Paperwhite E-reader',
    'Waterproof e-reader with 6.8" display, adjustable warm light, and weeks of battery life.',
    'KINDLE30',
    139.99,
    97.99,
    30,
    'Books & Media',
    'Amazon',
    '550e8400-e29b-41d4-a716-446655440001',
    'https://amazon.com/kindle-paperwhite',
    now() + interval '120 hours'
  ),
  (
    gen_random_uuid(),
    'Yeti Rambler 20oz Tumbler',
    'Double-wall vacuum insulated tumbler that keeps drinks cold or hot for hours.',
    'YETI15',
    34.95,
    29.71,
    15,
    'Sports & Outdoors',
    'Yeti',
    '550e8400-e29b-41d4-a716-446655440003',
    'https://yeti.com/rambler-tumbler',
    now() + interval '48 hours'
  );