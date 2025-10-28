-- ============================================================================
-- PUBLIC IMPACT TRACKING - Transparency Dashboard
-- Additional tables for donation tracking and impact visualization
-- ============================================================================

-- Impact Projects (what donations fund)
CREATE TABLE IF NOT EXISTS public.impact_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('education', 'technology', 'agriculture', 'community', 'research')),
  location TEXT, -- e.g., "Seattle, WA"
  partner_organization TEXT, -- e.g., "Paul Allen Institute", "Microsoft"
  goal_amount DECIMAL(10, 2),
  current_funding DECIMAL(10, 2) DEFAULT 0,
  impact_metrics JSONB, -- {"kids_served": 150, "meals_provided": 500}
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'paused')),
  start_date DATE,
  completion_date DATE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donation to Project Mapping (transparency)
CREATE TABLE IF NOT EXISTS public.donation_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES public.donations_feed(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.impact_projects(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  allocation_percentage DECIMAL(5, 2), -- e.g., 25.50 means 25.5%
  allocated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donation_allocations_donation_id ON public.donation_allocations(donation_id);
CREATE INDEX idx_donation_allocations_project_id ON public.donation_allocations(project_id);

-- Impact Milestones (trackable outcomes)
CREATE TABLE IF NOT EXISTS public.impact_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.impact_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  metric_name TEXT, -- e.g., "students_enrolled", "meals_served"
  metric_value INTEGER,
  target_value INTEGER,
  achieved_at TIMESTAMPTZ,
  proof_url TEXT, -- Link to evidence (photo, article, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_impact_milestones_project_id ON public.impact_milestones(project_id);

-- Blog Posts (Seattle AI/nonprofit/agritech news)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('ai', 'nonprofit', 'agritech', 'seattle', 'transparency', 'technology')),
  tags TEXT[],
  author_name TEXT,
  featured_image_url TEXT,
  source_url TEXT, -- If aggregated from external source
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published);

-- Partnership Spotlights
CREATE TABLE IF NOT EXISTS public.partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  partnership_type TEXT, -- e.g., "funding", "technology", "research"
  location TEXT,
  website_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES (Public Read Access for Transparency)
-- ============================================================================

ALTER TABLE public.impact_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- Public can view all impact data (transparency!)
CREATE POLICY "Anyone can view impact projects" ON public.impact_projects
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view donation allocations" ON public.donation_allocations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view milestones" ON public.impact_milestones
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Anyone can view partnerships" ON public.partnerships
  FOR SELECT USING (active = true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_impact_projects_updated_at BEFORE UPDATE ON public.impact_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Seattle-Connected Impact Projects
-- ============================================================================

INSERT INTO public.impact_projects (name, description, category, location, partner_organization, goal_amount, current_funding, impact_metrics, status, start_date, image_url) VALUES
  (
    'AI-Powered Reading Program',
    'Teaching 500 Seattle kids to read using AI tutors developed with Paul Allen Institute research',
    'education',
    'Seattle, WA',
    'Paul Allen Institute for AI',
    50000.00,
    12500.00,
    '{"kids_enrolled": 125, "target_kids": 500, "reading_level_improvement": "2.3 grades"}'::jsonb,
    'active',
    '2025-01-01',
    '/projects/ai-reading.jpg'
  ),
  (
    'Urban Farm Tech Initiative',
    'Using Microsoft Azure AI to optimize vertical farming in underserved Seattle neighborhoods',
    'agriculture',
    'Seattle, WA',
    'Microsoft for Nonprofits',
    75000.00,
    18000.00,
    '{"farms_deployed": 3, "target_farms": 10, "pounds_produced": 2400, "families_fed": 60}'::jsonb,
    'active',
    '2024-11-15',
    '/projects/urban-farm.jpg'
  ),
  (
    'Code.org Partnership',
    'Free coding classes for 1000 underrepresented youth in Puget Sound region',
    'education',
    'Seattle, WA',
    'Code.org',
    100000.00,
    42000.00,
    '{"students_enrolled": 420, "target_students": 1000, "completion_rate": "87%"}'::jsonb,
    'active',
    '2024-09-01',
    '/projects/code-youth.jpg'
  ),
  (
    'AI Ethics Education',
    'Teaching responsible AI development to nonprofit leaders, powered by Allen Institute curriculum',
    'technology',
    'Seattle, WA',
    'Paul Allen Institute for AI',
    30000.00,
    30000.00,
    '{"leaders_trained": 150, "nonprofits_reached": 45, "workshops_held": 12}'::jsonb,
    'completed',
    '2024-06-01',
    '/projects/ai-ethics.jpg'
  ),
  (
    'Climate Data Platform',
    'Open-source climate data dashboard for Pacific Northwest farmers using Azure ML',
    'agriculture',
    'Seattle & Yakima Valley, WA',
    'Microsoft AI for Earth',
    60000.00,
    8500.00,
    '{"farmers_using": 85, "target_farmers": 500, "acres_optimized": 12000}'::jsonb,
    'active',
    '2025-02-01',
    '/projects/climate-data.jpg'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DATA: Seattle Partnerships
-- ============================================================================

INSERT INTO public.partnerships (organization_name, logo_url, description, partnership_type, location, website_url) VALUES
  (
    'Paul Allen Institute for AI (AI2)',
    '/logos/ai2.png',
    'Collaborating on open-source AI research and educational curriculum for underprivileged youth',
    'research',
    'Seattle, WA',
    'https://allenai.org'
  ),
  (
    'Microsoft for Nonprofits',
    '/logos/microsoft.png',
    'Providing Azure AI credits, technical mentorship, and cloud infrastructure for our agritech initiatives',
    'technology',
    'Redmond, WA',
    'https://www.microsoft.com/nonprofits'
  ),
  (
    'Code.org',
    '/logos/code-org.png',
    'Joint program bringing computer science education to 1000+ Seattle-area students',
    'education',
    'Seattle, WA',
    'https://code.org'
  ),
  (
    'UW Allen School of Computer Science',
    '/logos/uw-cse.png',
    'University of Washington partnership for AI curriculum development and student mentorship',
    'education',
    'Seattle, WA',
    'https://www.cs.washington.edu'
  ),
  (
    'Seattle Foundation',
    '/logos/seattle-foundation.png',
    'Funding partner supporting community-based technology initiatives across King County',
    'funding',
    'Seattle, WA',
    'https://www.seattlefoundation.org'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DATA: Blog Posts (Seattle AI/Nonprofit/Agritech News)
-- ============================================================================

INSERT INTO public.blog_posts (title, slug, excerpt, content, category, tags, author_name, source_url, published, published_at) VALUES
  (
    'Paul Allen Institute Releases Open-Source AI Model for Education',
    'ai2-open-source-education-model',
    'AI2 unveils free educational AI model helping nonprofits teach reading to underserved communities',
    '# Paul Allen Institute Releases Open-Source AI Model for Education

The Allen Institute for AI (AI2) announced today the release of Tulu 3, a new open-source language model specifically optimized for educational applications.

## Impact for Nonprofits

This model enables organizations like New World Kids to:
- Create personalized reading tutors at zero cost
- Adapt content for different learning levels
- Support multilingual education
- Track student progress with privacy-first design

## Seattle Connection

Built right here in Seattle, this represents the city''s commitment to democratizing AI for social good. We''re already integrating Tulu 3 into our reading program serving 500 local kids.

**Learn more:** [AI2 Announcement](https://allenai.org/tulu-3)',
    'ai',
    ARRAY['ai2', 'education', 'open-source', 'seattle'],
    'New World Kids Team',
    'https://allenai.org/tulu-3',
    true,
    '2025-01-15 09:00:00'
  ),
  (
    'Microsoft Azure AI Helps Seattle Nonprofits Scale Impact',
    'microsoft-azure-nonprofit-program',
    'How Microsoft''s $3500/month Azure credits are transforming local food security initiatives',
    '# Microsoft Azure AI Helps Seattle Nonprofits Scale Impact

Microsoft for Nonprofits is providing up to $3,500/month in Azure credits to qualifying organizations, and the results are remarkable.

## Case Study: Urban Farming

Our partnership uses Azure Computer Vision to:
- Monitor crop health in real-time
- Predict optimal harvest times
- Reduce water usage by 40%
- Increase yield by 60%

## By the Numbers

- **12 Seattle nonprofits** now using Azure AI
- **$42,000** in free cloud credits distributed monthly
- **250,000 meals** produced through optimized farming

This is how tech giants can drive real social impact.

**Apply here:** [Microsoft for Nonprofits](https://www.microsoft.com/nonprofits)',
    'nonprofit',
    ARRAY['microsoft', 'azure', 'nonprofit', 'technology'],
    'Tech Partnerships Team',
    'https://www.microsoft.com/nonprofits',
    true,
    '2025-01-10 14:30:00'
  ),
  (
    'Vertical Farming Meets AI: Seattle Leads Agritech Revolution',
    'seattle-vertical-farming-ai',
    'How Puget Sound nonprofits are using AI to grow food in unlikely places',
    '# Vertical Farming Meets AI: Seattle Leads Agritech Revolution

Seattle''s rainy climate and limited space make traditional farming challenging. But AI-powered vertical farms are changing the game.

## The Tech Stack

- **Computer Vision:** Monitoring plant health
- **IoT Sensors:** Real-time soil/water data
- **Machine Learning:** Predicting optimal growing conditions
- **Azure Cloud:** Processing terabytes of agricultural data

## Impact So Far

Our 3 vertical farms have:
- Produced 2,400 lbs of fresh produce
- Fed 60 families in food deserts
- Reduced transportation emissions by 95%
- Created 8 local jobs

## Open Source

All our farming algorithms are **open source** on GitHub. We believe transparency drives innovation.

**GitHub:** [NewWorldKids/AgriTech](https://github.com/newworldkids/agritech)',
    'agritech',
    ARRAY['vertical-farming', 'ai', 'sustainability', 'open-source'],
    'AgriTech Team',
    null,
    true,
    '2025-01-05 11:00:00'
  ),
  (
    'Building in Public: Our Open-Source Approach to Nonprofit Tech',
    'building-in-public-open-source',
    'Why we share our code, data, and learnings with the world',
    '# Building in Public: Our Open-Source Approach to Nonprofit Tech

Transparency isn''t just a buzzword for us—it''s our operating system.

## What We Share

- **All code:** GitHub repos are public
- **All donations:** Blockchain-tracked and visible
- **All metrics:** Real-time impact dashboard
- **All learnings:** Weekly blog posts

## Why It Matters

1. **Accountability:** Donors see exactly where money goes
2. **Collaboration:** Other nonprofits can use our tools
3. **Innovation:** Community contributions improve our work
4. **Trust:** No secrets, no surprises

## Seattle Values

This approach mirrors Seattle''s open-source culture—think Microsoft''s GitHub, Amazon''s open data initiatives, and AI2''s research transparency.

**Explore our stack:** [Impact Dashboard](/impact)',
    'transparency',
    ARRAY['open-source', 'transparency', 'seattle', 'nonprofit'],
    'New World Kids Founders',
    null,
    true,
    '2025-01-18 16:00:00'
  ),
  (
    'UW Researchers Partner with Nonprofits on AI Safety for Kids',
    'uw-ai-safety-partnership',
    'Allen School of Computer Science develops child-safe AI guidelines for educational nonprofits',
    '# UW Researchers Partner with Nonprofits on AI Safety for Kids

The University of Washington''s Paul G. Allen School of Computer Science & Engineering announced a groundbreaking partnership with 15 Seattle-area educational nonprofits.

## The Challenge

As AI becomes ubiquitous in education, ensuring child safety is paramount. Traditional AI models aren''t designed with kids in mind.

## The Solution

UW researchers developed:
- Child-appropriate content filters
- Privacy-preserving learning analytics
- Bias detection for educational AI
- Parental consent frameworks

## Real-World Testing

New World Kids is a pilot partner, testing these guidelines with 125 students in our AI reading program.

**Early results:**
- 100% parent satisfaction
- Zero privacy incidents
- 2.3 grade level improvement in reading

## Open Research

All findings will be published open-access and shared with the nonprofit community.

**Read the paper:** [arXiv:2025.01234](https://arxiv.org)',
    'ai',
    ARRAY['uw', 'ai-safety', 'education', 'research'],
    'Research Partnerships',
    'https://www.cs.washington.edu',
    true,
    '2025-01-12 10:00:00'
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VIEWS FOR PUBLIC DASHBOARD
-- ============================================================================

-- Aggregated impact metrics
CREATE OR REPLACE VIEW public.impact_overview AS
SELECT
  COUNT(DISTINCT d.id) as total_donations,
  COALESCE(SUM(d.amount), 0) as total_donated_usd,
  COUNT(DISTINCT p.id) as active_projects,
  COALESCE(SUM(p.current_funding), 0) as total_allocated,
  COUNT(DISTINCT m.id) as milestones_achieved
FROM public.donations_feed d
LEFT JOIN public.donation_allocations da ON d.id = da.donation_id
LEFT JOIN public.impact_projects p ON da.project_id = p.id AND p.status = 'active'
LEFT JOIN public.impact_milestones m ON p.id = m.project_id AND m.achieved_at IS NOT NULL;

-- Project funding status
CREATE OR REPLACE VIEW public.project_funding_status AS
SELECT
  p.id,
  p.name,
  p.category,
  p.partner_organization,
  p.goal_amount,
  p.current_funding,
  ROUND((p.current_funding / NULLIF(p.goal_amount, 0) * 100)::numeric, 2) as funding_percentage,
  p.status,
  COUNT(DISTINCT da.donation_id) as donor_count
FROM public.impact_projects p
LEFT JOIN public.donation_allocations da ON p.id = da.project_id
GROUP BY p.id, p.name, p.category, p.partner_organization, p.goal_amount, p.current_funding, p.status;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
