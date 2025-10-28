// ============================================================================
// STELLAR AGENTS - TYPE DEFINITIONS
// ============================================================================

export type AgentType = 'voice' | 'coding' | 'browsing' | 'orchestrator' | 'hybrid';

export type AgentStatus = 'idle' | 'active' | 'busy' | 'error' | 'offline';

export type SessionStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

export interface AgentConfig {
  id: string;
  name: string;
  displayName: string;
  type: AgentType;
  description?: string;
  capabilities?: string[];
  modelConfig?: ModelConfig;
}

export interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'gemini';
  model: string;
  temperature?: number;
  maxTokens?: number;
  voice?: string; // For voice agents
  [key: string]: any;
}

// ============================================================================
// TASK & EXECUTION
// ============================================================================

export interface Task {
  id?: string;
  description: string;
  type: string;
  parameters?: Record<string, any>;
  context?: Record<string, any>;
  priority?: number;
  userId?: string;
}

export interface AgentResult {
  success: boolean;
  output: any;
  tokensUsed?: number;
  cost?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SubTask extends Task {
  parentId?: string;
  assignedAgent?: string;
  dependencies?: string[];
}

// ============================================================================
// LOGGING & OBSERVABILITY
// ============================================================================

export interface AgentAction {
  sessionId: string;
  level: LogLevel;
  message: string;
  toolCall?: string;
  thoughtProcess?: string;
  screenshotUrl?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// VOICE & COMMUNICATION
// ============================================================================

export interface VoiceConfig {
  provider: 'openai_realtime' | 'elevenlabs' | 'gemini';
  voiceId?: string;
  model?: string;
  language?: string;
}

export interface VoiceCommand {
  transcript: string;
  confidence?: number;
  intent?: string;
  parameters?: Record<string, any>;
}

export interface VoiceResponse {
  text: string;
  audioUrl?: string;
  emotion?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// ORCHESTRATION
// ============================================================================

export interface Plan {
  id: string;
  goal: string;
  steps: PlanStep[];
  estimatedTime?: number;
  dependencies?: Record<string, string[]>;
}

export interface PlanStep {
  id: string;
  description: string;
  assignedAgent: string;
  type: string;
  inputs?: Record<string, any>;
  outputs?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface OrchestrationResult {
  planId: string;
  status: 'success' | 'partial' | 'failed';
  results: Record<string, AgentResult>;
  timeline: OrchestrationEvent[];
}

export interface OrchestrationEvent {
  timestamp: Date;
  agentName: string;
  action: string;
  status: string;
  details?: any;
}

// ============================================================================
// BROWSER AUTOMATION
// ============================================================================

export interface BrowserTask {
  url?: string;
  taskDescription: string;
  provider: 'playwright' | 'gemini_computer_use';
  captureScreenshots?: boolean;
  waitForSelector?: string;
  timeout?: number;
}

export interface BrowserResult {
  success: boolean;
  screenshots?: string[];
  actions?: BrowserAction[];
  extractedData?: any;
  error?: string;
}

export interface BrowserAction {
  type: 'click' | 'type' | 'navigate' | 'scroll' | 'screenshot';
  target?: string;
  value?: any;
  timestamp: Date;
}

// ============================================================================
// CODE GENERATION
// ============================================================================

export interface CodeRequest {
  description: string;
  language: string;
  framework?: string;
  context?: string;
  existingCode?: string;
}

export interface CodeResult {
  code: string;
  language: string;
  explanation?: string;
  tests?: string;
  suggestions?: string[];
}

// ============================================================================
// RESEARCH
// ============================================================================

export interface ResearchRequest {
  query: string;
  sources?: string[];
  depth?: 'quick' | 'normal' | 'deep';
  maxResults?: number;
}

export interface ResearchResult {
  summary: string;
  sources: ResearchSource[];
  keyFindings: string[];
  confidence?: number;
}

export interface ResearchSource {
  url: string;
  title: string;
  snippet: string;
  relevance?: number;
}

// ============================================================================
// DATABASE MODELS (Supabase)
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  display_name: string;
  type: AgentType;
  description?: string;
  capabilities?: string[];
  model_config?: ModelConfig;
  status: AgentStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgentSession {
  id: string;
  agent_id: string;
  user_id?: string;
  session_type: string;
  input_data?: any;
  output_data?: any;
  status: SessionStatus;
  started_at: string;
  completed_at?: string;
  tokens_used: number;
  cost_usd: number;
  error_message?: string;
  metadata?: any;
}

export interface AgentLog {
  id: string;
  session_id: string;
  agent_id: string;
  log_level: LogLevel;
  message: string;
  tool_call?: string;
  thought_process?: string;
  screenshot_url?: string;
  metadata?: any;
  created_at: string;
}
