-- ============================================================================
-- NEW WORLD KIDS - STELLAR AGENTIC COCKPIT
-- Initial Database Schema for Supabase
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- Extended user profiles (complements Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User perks and rewards
CREATE TABLE IF NOT EXISTS public.user_perks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  perk_type TEXT NOT NULL,
  perk_name TEXT NOT NULL,
  perk_description TEXT,
  value JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_perks_user_id ON public.user_perks(user_id);
CREATE INDEX idx_user_perks_expires_at ON public.user_perks(expires_at);

-- ============================================================================
-- STELLAR AGENTS (Sirius, Andromeda, Vega, Rigel, Cassiopeia, Betelgeuse)
-- ============================================================================

-- Agent registry
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- e.g., "Sirius", "Andromeda"
  display_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('voice', 'coding', 'browsing', 'orchestrator', 'hybrid')),
  description TEXT,
  capabilities JSONB, -- Array of capabilities
  model_config JSONB, -- Model settings (provider, model, temperature, etc.)
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'busy', 'error', 'offline')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent sessions (tracks each agent invocation)
CREATE TABLE IF NOT EXISTS public.agent_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  error_message TEXT,
  metadata JSONB
);

CREATE INDEX idx_agent_sessions_agent_id ON public.agent_sessions(agent_id);
CREATE INDEX idx_agent_sessions_user_id ON public.agent_sessions(user_id);
CREATE INDEX idx_agent_sessions_status ON public.agent_sessions(status);

-- Agent logs (observability)
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.agent_sessions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  log_level TEXT DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'critical')),
  message TEXT NOT NULL,
  tool_call TEXT,
  thought_process TEXT,
  screenshot_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_session_id ON public.agent_logs(session_id);
CREATE INDEX idx_agent_logs_created_at ON public.agent_logs(created_at DESC);

-- ============================================================================
-- AI CONVERSATIONS & VOICE
-- ============================================================================

-- AI Conversations (multi-agent chat history)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  agent_type TEXT NOT NULL,
  session_id UUID REFERENCES public.agent_sessions(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  input_type TEXT DEFAULT 'text' CHECK (input_type IN ('text', 'voice', 'image', 'multimodal')),
  output_type TEXT DEFAULT 'text' CHECK (output_type IN ('text', 'voice', 'code', 'multimodal')),
  voice_audio_url TEXT,
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_session_id ON public.ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);

-- Voice sessions (OpenAI Realtime & ElevenLabs)
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.agent_sessions(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai_realtime', 'elevenlabs', 'gemini')),
  voice_id TEXT,
  input_audio_url TEXT,
  output_audio_url TEXT,
  transcript TEXT,
  response_text TEXT,
  duration_seconds DECIMAL(10, 2),
  cost_usd DECIMAL(10, 6),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_sessions_user_id ON public.voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_session_id ON public.voice_sessions(session_id);

-- ============================================================================
-- DONATIONS & BLOCKCHAIN
-- ============================================================================

-- Donations feed (real-time)
CREATE TABLE IF NOT EXISTS public.donations_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  wallet_address TEXT NOT NULL,
  amount DECIMAL(20, 10) NOT NULL,
  currency TEXT NOT NULL,
  usd_value DECIMAL(10, 2),
  blockchain TEXT DEFAULT 'solana',
  transaction_hash TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  nft_minted BOOLEAN DEFAULT FALSE,
  nft_mint_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_feed_user_id ON public.donations_feed(user_id);
CREATE INDEX idx_donations_feed_created_at ON public.donations_feed(created_at DESC);
CREATE INDEX idx_donations_feed_usd_value ON public.donations_feed(usd_value DESC);

-- ============================================================================
-- BROWSER AUTOMATION & COMPUTER USE
-- ============================================================================

-- Browser automation sessions (Playwright + Gemini Computer Use)
CREATE TABLE IF NOT EXISTS public.browser_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('playwright', 'gemini_computer_use', 'chrome_devtools')),
  url TEXT,
  task_description TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  screenshots JSONB, -- Array of screenshot URLs
  actions_taken JSONB, -- Array of actions
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB
);

CREATE INDEX idx_browser_sessions_agent_id ON public.browser_sessions(agent_id);
CREATE INDEX idx_browser_sessions_status ON public.browser_sessions(status);

-- ============================================================================
-- INFINITE AGENTIC LOOP & VARIANTS
-- ============================================================================

-- Agentic waves (iteration cycles)
CREATE TABLE IF NOT EXISTS public.agentic_waves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wave_number INTEGER NOT NULL,
  specification TEXT NOT NULL,
  acceptance_criteria JSONB NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  best_score DECIMAL(5, 2),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB
);

-- Variant results (sub-agent outputs)
CREATE TABLE IF NOT EXISTS public.variant_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wave_id UUID REFERENCES public.agentic_waves(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  directive TEXT NOT NULL,
  code_output JSONB,
  test_results JSONB,
  score DECIMAL(5, 2),
  is_top_performer BOOLEAN DEFAULT FALSE,
  kept BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_variant_results_wave_id ON public.variant_results(wave_id);
CREATE INDEX idx_variant_results_score ON public.variant_results(score DESC);

-- ============================================================================
-- SERVICES & HEALTH MONITORING
-- ============================================================================

-- Service registry (YouTube Automation, Rube MCP, Big-3, etc.)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  endpoint_url TEXT,
  health_check_url TEXT,
  status TEXT DEFAULT 'unknown' CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown', 'offline')),
  last_health_check TIMESTAMPTZ,
  version TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service health history
CREATE TABLE IF NOT EXISTS public.service_health_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_health_history_service_id ON public.service_health_history(service_id);
CREATE INDEX idx_service_health_history_checked_at ON public.service_health_history(checked_at DESC);

-- ============================================================================
-- CONTENT & TUTORIALS
-- ============================================================================

-- Tutorials (Cosmic Tutorials section)
CREATE TABLE IF NOT EXISTS public.tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time_minutes INTEGER,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tutorials_slug ON public.tutorials(slug);
CREATE INDEX idx_tutorials_published ON public.tutorials(published);
CREATE INDEX idx_tutorials_category ON public.tutorials(category);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browser_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agentic_waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_health_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Agents: Public read, admin write
CREATE POLICY "Anyone can view agents" ON public.agents
  FOR SELECT USING (true);

-- AI Conversations: Users can only see their own
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Donations Feed: Public read for transparency
CREATE POLICY "Anyone can view donations" ON public.donations_feed
  FOR SELECT USING (true);

-- Tutorials: Public read for published, admin write
CREATE POLICY "Anyone can view published tutorials" ON public.tutorials
  FOR SELECT USING (published = true OR auth.uid() = author_id);

-- Service monitoring: Public read
CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT USING (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: STELLAR AGENTS
-- ============================================================================

INSERT INTO public.agents (name, display_name, type, description, capabilities, model_config, status) VALUES
  (
    'sirius',
    'Sirius - The Navigator',
    'orchestrator',
    'The brightest star in the night sky. Plans features, coordinates agents, and navigates the development process.',
    '["planning", "coordination", "task_decomposition", "agent_orchestration"]'::jsonb,
    '{"provider": "openai", "model": "gpt-4-turbo", "temperature": 0.7}'::jsonb,
    'idle'
  ),
  (
    'andromeda',
    'Andromeda - The Coder',
    'coding',
    'Named after our nearest galaxy. Expert at generating, refactoring, and optimizing code across multiple languages.',
    '["code_generation", "refactoring", "debugging", "code_review", "testing"]'::jsonb,
    '{"provider": "anthropic", "model": "claude-3-5-sonnet-20241022", "temperature": 0.3}'::jsonb,
    'idle'
  ),
  (
    'vega',
    'Vega - The Validator',
    'browsing',
    'One of the brightest stars in the northern sky. Tests UI flows, validates designs, and ensures quality through browser automation.',
    '["browser_automation", "ui_testing", "visual_regression", "accessibility_testing"]'::jsonb,
    '{"provider": "gemini", "model": "gemini-2.0-flash-exp", "temperature": 0.2}'::jsonb,
    'idle'
  ),
  (
    'rigel',
    'Rigel - The Researcher',
    'browsing',
    'A blue supergiant in Orion. Searches the web, gathers information, and provides contextual knowledge.',
    '["web_browsing", "research", "data_extraction", "competitive_analysis"]'::jsonb,
    '{"provider": "gemini", "model": "gemini-2.0-flash-exp", "temperature": 0.5}'::jsonb,
    'idle'
  ),
  (
    'cassiopeia',
    'Cassiopeia - The Communicator',
    'voice',
    'The queen constellation. Handles voice interactions, summaries, and natural language communication.',
    '["voice_recognition", "text_to_speech", "summarization", "translation", "conversation"]'::jsonb,
    '{"provider": "openai", "model": "gpt-4o-realtime-preview", "voice": "shimmer"}'::jsonb,
    'idle'
  ),
  (
    'betelgeuse',
    'Betelgeuse - The Builder',
    'hybrid',
    'The red supergiant in Orion. Builds infrastructure, manages deployments, and handles DevOps tasks.',
    '["infrastructure", "deployment", "ci_cd", "monitoring", "scaling"]'::jsonb,
    '{"provider": "anthropic", "model": "claude-3-5-sonnet-20241022", "temperature": 0.4}'::jsonb,
    'idle'
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA: SERVICES
-- ============================================================================

INSERT INTO public.services (name, display_name, type, description, endpoint_url, health_check_url, status) VALUES
  (
    'big-3-orchestrator',
    'Big-3 Super Agent',
    'orchestrator',
    'Coordinates OpenAI Realtime (voice), Claude Code (coding), and Gemini Computer Use (browsing) agents',
    'http://localhost:3010',
    'http://localhost:3010/health',
    'unknown'
  ),
  (
    'youtube-automation',
    'YouTube Automation Service',
    'automation',
    'Automated video generation, uploads, and channel management',
    'http://localhost:3011',
    'http://localhost:3011/health',
    'unknown'
  ),
  (
    'rube-mcp',
    'Rube MCP Server',
    'mcp',
    'Model Context Protocol server for extended capabilities',
    'http://localhost:3012',
    'http://localhost:3012/health',
    'unknown'
  ),
  (
    'browser-service',
    'Playwright Browser Service',
    'automation',
    'Headless browser automation and UI testing',
    'http://localhost:3013',
    'http://localhost:3013/health',
    'unknown'
  ),
  (
    'chrome-devtools-mcp',
    'Chrome DevTools MCP',
    'mcp',
    'Chrome DevTools Protocol integration for advanced browser control',
    'http://localhost:3014',
    'http://localhost:3014/health',
    'unknown'
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA: TUTORIALS
-- ============================================================================

INSERT INTO public.tutorials (slug, title, description, content, category, tags, difficulty, estimated_time_minutes, published) VALUES
  (
    'getting-started-stellar-cockpit',
    'Getting Started with the Stellar Agentic Cockpit',
    'Learn how to use the New World Kids Stellar Cockpit to orchestrate AI agents',
    '# Getting Started\n\nWelcome to the Stellar Agentic Cockpit...',
    'getting-started',
    ARRAY['cockpit', 'agents', 'basics'],
    'beginner',
    15,
    true
  ),
  (
    'using-voice-commands',
    'Voice-Driven Workflows with Cassiopeia',
    'Master voice interactions using OpenAI Realtime API and ElevenLabs',
    '# Voice Commands\n\nCassiopeia is your voice interface...',
    'voice',
    ARRAY['voice', 'cassiopeia', 'openai'],
    'intermediate',
    20,
    true
  ),
  (
    'chrome-devtools-mcp-guide',
    'Chrome DevTools MCP Integration',
    'Use the Chrome DevTools MCP server for advanced browser automation',
    '# Chrome DevTools MCP\n\nThe Chrome DevTools MCP allows...',
    'browser-automation',
    ARRAY['mcp', 'chrome', 'devtools'],
    'advanced',
    30,
    true
  ),
  (
    'big-3-super-agent',
    'The Big-3 Super Agent',
    'Orchestrate voice, coding, and browsing agents together',
    '# Big-3 Super Agent\n\nThe Big-3 combines three powerful agents...',
    'orchestration',
    ARRAY['big-3', 'orchestration', 'agents'],
    'intermediate',
    25,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
