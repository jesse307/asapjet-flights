-- Marketing Performance Tracking Schema for ASAP Jet

-- Ad campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('google', 'meta')),
  campaign_id TEXT NOT NULL UNIQUE, -- Platform's campaign ID
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'ended')),
  daily_budget NUMERIC(10, 2) NOT NULL,
  total_budget NUMERIC(10, 2),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily performance metrics
CREATE TABLE IF NOT EXISTS ad_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  spend NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ctr NUMERIC(5, 4), -- Click-through rate
  cpc NUMERIC(10, 2), -- Cost per click
  conversion_rate NUMERIC(5, 4),
  cost_per_conversion NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Ad copy variations
CREATE TABLE IF NOT EXISTS ad_copy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'meta')),
  ad_id TEXT UNIQUE, -- Platform's ad ID
  headlines TEXT[] NOT NULL, -- Array of headlines
  descriptions TEXT[] NOT NULL, -- Array of descriptions
  primary_text TEXT, -- For Meta ads
  cta TEXT, -- Call to action
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'testing')),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI optimization decisions log
CREATE TABLE IF NOT EXISTS ai_optimization_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action_type TEXT NOT NULL, -- 'budget_change', 'bid_adjustment', 'pause_campaign', 'new_ad_copy'
  campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE SET NULL,
  details JSONB NOT NULL, -- Full details of the change
  reason TEXT NOT NULL, -- AI's reasoning
  applied BOOLEAN DEFAULT false, -- Whether change was applied
  result JSONB, -- Outcome of the change
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversion tracking - link leads to campaigns
CREATE TABLE IF NOT EXISTS lead_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE SET NULL,
  platform TEXT CHECK (platform IN ('google', 'meta', 'organic', 'direct')),
  click_id TEXT, -- gclid or fbclid
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  landing_page TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_performance_campaign_date ON ad_performance(campaign_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_performance_date ON ad_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_platform ON ad_campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_lead_attribution_campaign ON lead_attribution(campaign_id);
CREATE INDEX IF NOT EXISTS idx_lead_attribution_lead ON lead_attribution(lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_optimization_timestamp ON ai_optimization_log(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_optimization_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_attribution ENABLE ROW LEVEL SECURITY;

-- Create policies (service role has full access)
CREATE POLICY "Enable all access for service role" ON ad_campaigns
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for service role" ON ad_performance
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for service role" ON ad_copy
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for service role" ON ai_optimization_log
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for service role" ON lead_attribution
  FOR ALL USING (true) WITH CHECK (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_performance_updated_at BEFORE UPDATE ON ad_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_copy_updated_at BEFORE UPDATE ON ad_copy
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
