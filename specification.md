# 🌟 STELLAR AGENTIC COCKPIT - COMPLETE SPECIFICATION
## Product Requirements Document (PRD)

**Project:** New World Kids - Stellar Agentic Cockpit
**Version:** 1.0.0
**Date:** January 20, 2025
**Status:** Ready for Implementation

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Project Context](#project-context)
3. [Goals & Non-Goals](#goals--non-goals)
4. [User Stories](#user-stories)
5. [Stellar Agents Specification](#stellar-agents-specification)
6. [Voice Integration](#voice-integration)
7. [Browser Automation](#browser-automation)
8. [Big-3 Super Agent Orchestrator](#big-3-super-agent-orchestrator)
9. [Cockpit User Interface](#cockpit-user-interface)
10. [Observability System](#observability-system)
11. [Infinite Agentic Loop](#infinite-agentic-loop)
12. [Services Architecture](#services-architecture)
13. [Database Schema](#database-schema)
14. [API Contracts](#api-contracts)
15. [Security & Authentication](#security--authentication)
16. [Performance Requirements](#performance-requirements)
17. [Testing Strategy](#testing-strategy)
18. [Deployment](#deployment)
19. [Success Metrics](#success-metrics)

---

## 1. EXECUTIVE SUMMARY

### Vision
Transform New World Kids into a cutting-edge platform where content creators and developers orchestrate AI agents through voice commands to generate code, test UIs, create content, and build full-stack features autonomously.

### Core Innovation
Six specialized AI agents named after stellar bodies (Sirius, Andromeda, Vega, Rigel, Cassiopeia, Betelgeuse) work in concert to deliver agentic coding, voice interaction, browser automation, and self-improving development loops.

### Key Differentiators
1. **Voice-First:** Natural language commands drive everything
2. **Stellar Theme:** Cosmic naming creates memorable, cohesive brand
3. **Observable:** Every action logged, streamed, and visualizable
4. **Non-Invasive:** External cockpit, never touches existing Strapi backend
5. **Self-Improving:** Infinite agentic loop generates and evaluates variants

### Target Users
- **Content Creators:** Generate videos/posts via voice
- **Developers:** Orchestrate complex workflows through AI
- **Admins:** Monitor services, view logs, manage agents
- **Learners:** Interactive tutorials on AI coding

---

## 2. PROJECT CONTEXT

### Existing Infrastructure
```
New World Kids (Strapi-Based Multi-Tenant CMS)
├── apps/web/                  # Next.js frontend (Trail Mixx + New World Kids)
├── services/cms/              # Strapi CMS (content management)
├── services/stream/           # HLS video streaming
├── services/ai-agents/        # AI agents (Nova, Echo, Flow, Pulse)
├── services/blockchain/       # Solana NFT minting + donations
└── services/computer-control/ # Gemini Computer Use (basic)
```

### Technology Stack
- **Frontend:** Next.js 15.4.7 (App Router), React 18, Tailwind CSS 4.0.9
- **UI Library:** tweakcn-next (enhanced shadcn/ui)
- **Database:** Supabase (new) + PostgreSQL (existing Strapi)
- **CMS:** Strapi 5.12.4
- **Auth:** NextAuth + Supabase Auth
- **Blockchain:** Solana (Devnet/Mainnet)
- **Fonts:** Space Grotesk, Orbitron, Inter, JetBrains Mono (see typography-system.md)

### What We're Building
An **external cockpit** that sits alongside the existing infrastructure and orchestrates new AI agents without modifying the Strapi backend.

---

## 3. GOALS & NON-GOALS

### Primary Goals ✅

1. **Build Six Stellar Agents**
   - Each agent has unique capabilities and cosmic name
   - Agents can work independently or orchestrated together
   - All actions logged to Supabase for observability

2. **Voice-Driven Workflows**
   - OpenAI Realtime API integration
   - ElevenLabs text-to-speech
   - Voice commands routed to appropriate agents
   - Audio transcriptions stored for history

3. **Browser Automation**
   - Playwright service for local browser control
   - Gemini Computer Use model for cloud-based UI testing
   - Chrome DevTools MCP for advanced automation
   - Screenshots/videos captured and stored

4. **Big-3 Super Agent**
   - Orchestrates OpenAI Realtime (voice), Claude Code (coding), Gemini (browsing)
   - Unified command interface
   - Agent registry for discovery
   - Health monitoring for all services

5. **Cockpit Dashboard**
   - Next.js UI with tweakcn components
   - Real-time agent status
   - Service health indicators
   - Observability logs viewer
   - Donation feed widget
   - Voice command interface

6. **Infinite Agentic Loop**
   - Generate multiple implementation variants
   - Evaluate performance/quality scores
   - Keep top performers, refine spec
   - Iterate until acceptance criteria met

7. **Observability**
   - All agent actions → Supabase `agent_logs`
   - Real-time streaming to dashboard
   - Screenshots for browser agents
   - Token usage and cost tracking

8. **Tutorials System**
   - Cosmic Tutorials section in Strapi
   - Guides for using each agent
   - MCP server integration docs
   - Video tutorials (future)

### Non-Goals ❌

1. ❌ Modify existing Strapi backend code
2. ❌ Replace existing AI agents (Nova, Echo, Flow, Pulse)
3. ❌ Public access to Sora API (limited preview)
4. ❌ Mobile app (future consideration)
5. ❌ Cryptocurrency wallet creation (use existing blockchain service)
6. ❌ Video generation (wait for Sora access)

---

## 4. USER STORIES

### Content Creator
> "As a content creator, I can speak to Cassiopeia (voice agent) and say 'Generate a blog post about blockchain for kids,' and the system orchestrates Rigel (research), Andromeda (writing), and publishes to Strapi."

**Acceptance Criteria:**
- [ ] Voice command triggers agent orchestration
- [ ] Research agent gathers relevant information
- [ ] Coding agent generates well-structured content
- [ ] Content appears in Strapi CMS
- [ ] User receives voice confirmation

### Developer
> "As a developer, I can open the cockpit dashboard and see all six stellar agents with their current status, recent actions, and performance metrics."

**Acceptance Criteria:**
- [ ] Dashboard shows agent cards with status (idle/active/busy/error)
- [ ] Recent logs visible for each agent
- [ ] Click agent to view detailed session history
- [ ] Real-time updates via Supabase subscriptions

### Admin
> "As an admin, I can start/stop the Big-3 Super Agent service and monitor its health, seeing logs from all three constituent agents (OpenAI, Claude, Gemini)."

**Acceptance Criteria:**
- [ ] Start/stop buttons for Big-3 service
- [ ] Health indicator (green/yellow/red)
- [ ] Aggregated logs from all three agents
- [ ] Cost tracking (tokens × price)

### QA Tester
> "As a QA tester, I can instruct Vega (validator agent) to test the donation flow on the website, and it will automatically navigate, fill forms, and report any issues."

**Acceptance Criteria:**
- [ ] Voice or text command to Vega
- [ ] Automated browser navigation via Playwright
- [ ] Screenshots captured at each step
- [ ] Issues logged with severity levels
- [ ] Summary report generated

### Learner
> "As a learner, I can read the 'Cosmic Tutorials' section to understand how to use Chrome DevTools MCP and the seven MCP servers from BMAD."

**Acceptance Criteria:**
- [ ] Tutorials accessible in Strapi blog
- [ ] Clear step-by-step instructions
- [ ] Code examples included
- [ ] Video embeds (future)
- [ ] Community comments enabled

---

## 5. STELLAR AGENTS SPECIFICATION

### 5.1 Sirius - The Navigator (Orchestrator)

**Role:** Plans features, coordinates sub-agents, navigates complex workflows

**Capabilities:**
- Task decomposition
- Agent orchestration
- Workflow planning
- Resource allocation
- Progress tracking

**Model:** GPT-4 Turbo
**Provider:** OpenAI
**Temperature:** 0.7 (balanced creativity)

**API Interface:**
```typescript
interface SiriusAgent {
  planFeature(description: string): Promise<Plan>;
  decomposeTask(task: Task): Promise<SubTask[]>;
  orchestrate(plan: Plan): Promise<OrchestrationResult>;
  assignAgent(task: Task): Promise<AgentAssignment>;
}
```

**Input Example:**
```json
{
  "task": "Add real-time donation notifications to the cockpit",
  "context": "Use Supabase real-time subscriptions",
  "constraints": ["No backend modifications", "Use tweakcn components"]
}
```

**Output Example:**
```json
{
  "plan": {
    "steps": [
      {
        "step": 1,
        "agent": "andromeda",
        "task": "Create DonationFeedWidget component",
        "estimated_time": "15 minutes"
      },
      {
        "step": 2,
        "agent": "vega",
        "task": "Test real-time updates",
        "estimated_time": "10 minutes"
      }
    ],
    "total_time": "25 minutes",
    "confidence": 0.85
  }
}
```

**Database Tables:**
- `agents` (id, name='sirius', type='orchestrator')
- `agent_sessions` (session tracking)
- `agent_logs` (all actions logged)

**Success Metrics:**
- Plan accuracy: >80% of steps succeed
- Time estimates within ±20%
- Agent assignments appropriate

---

### 5.2 Andromeda - The Coder (Coding Agent)

**Role:** Code generation, refactoring, debugging, code review

**Capabilities:**
- Full-stack code generation (React, TypeScript, Node.js)
- Refactoring and optimization
- Bug fixing with context awareness
- Code reviews with suggestions
- Test generation

**Model:** Claude 3.5 Sonnet
**Provider:** Anthropic
**Temperature:** 0.3 (precision-focused)

**API Interface:**
```typescript
interface AndromedaAgent {
  generateCode(spec: CodeSpec): Promise<GeneratedCode>;
  refactor(code: string, goal: string): Promise<RefactoredCode>;
  debug(error: Error, context: CodeContext): Promise<Fix>;
  reviewCode(code: string): Promise<CodeReview>;
  generateTests(code: string): Promise<TestSuite>;
}
```

**Input Example:**
```json
{
  "task": "generate",
  "spec": {
    "type": "react-component",
    "name": "AgentCard",
    "props": ["agentName", "status", "lastAction"],
    "styling": "tweakcn + Tailwind",
    "requirements": [
      "Display agent icon (cosmic themed)",
      "Status indicator (idle/active/busy/error)",
      "Click to view details",
      "Responsive design"
    ]
  }
}
```

**Output Example:**
```typescript
// apps/web/src/components/cockpit/AgentCard.tsx
import { Card } from 'tweakcn-next';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agentName: string;
  status: 'idle' | 'active' | 'busy' | 'error';
  lastAction?: string;
}

export function AgentCard({ agentName, status, lastAction }: AgentCardProps) {
  const statusColors = {
    idle: 'bg-gray-500',
    active: 'bg-green-500',
    busy: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <Card className="relative overflow-hidden backdrop-blur-sm bg-slate-900/50 border-purple-500/20">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-white">
            {agentName}
          </h3>
          <div className={cn(
            "h-3 w-3 rounded-full animate-pulse",
            statusColors[status]
          )} />
        </div>
        {lastAction && (
          <p className="text-sm text-gray-400 font-mono">
            {lastAction}
          </p>
        )}
      </div>
    </Card>
  );
}
```

**Database Tables:**
- `agents` (id, name='andromeda', type='coding')
- `agent_sessions` (code generation sessions)
- `agent_logs` (generated files, refactoring actions)

**Success Metrics:**
- Code compiles/runs without errors: >95%
- Test coverage: >80%
- Type safety (TypeScript): 100%
- Performance (Lighthouse): >90

---

### 5.3 Vega - The Validator (Browser/UI Testing Agent)

**Role:** UI testing, visual regression, accessibility validation

**Capabilities:**
- Automated browser testing (Playwright)
- Visual regression detection
- Accessibility audits (WCAG 2.1 AA)
- Cross-browser testing
- Performance testing (Lighthouse)

**Model:** Gemini 2.0 Flash
**Provider:** Google
**Temperature:** 0.2 (precision)

**API Interface:**
```typescript
interface VegaAgent {
  testUI(url: string, scenario: TestScenario): Promise<TestResult>;
  visualRegression(baseline: string, current: string): Promise<DiffReport>;
  accessibilityAudit(url: string): Promise<AccessibilityReport>;
  performanceTest(url: string): Promise<LighthouseReport>;
}
```

**Input Example:**
```json
{
  "task": "test-donation-flow",
  "scenario": {
    "url": "http://localhost:3000/donate",
    "steps": [
      "Navigate to /donate",
      "Select Solana payment",
      "Enter amount: 50",
      "Click 'Donate Now'",
      "Verify transaction initiated",
      "Capture NFT receipt modal"
    ],
    "assertions": [
      "Transaction hash visible",
      "Success message displayed",
      "NFT preview shown"
    ]
  }
}
```

**Output Example:**
```json
{
  "testId": "test-donation-flow-20250120-143022",
  "status": "passed",
  "duration": "12.3s",
  "steps": [
    {
      "step": 1,
      "description": "Navigate to /donate",
      "status": "passed",
      "screenshot": "s3://screenshots/step1.png",
      "duration": "1.2s"
    },
    // ... more steps
  ],
  "issues": [],
  "performance": {
    "lighthouse_score": 92,
    "first_contentful_paint": "1.2s",
    "time_to_interactive": "2.8s"
  }
}
```

**Database Tables:**
- `agents` (id, name='vega', type='browsing')
- `browser_sessions` (test runs)
- `agent_logs` (screenshots, assertions)

**Success Metrics:**
- Test pass rate: >95%
- False positive rate: <5%
- Accessibility compliance: WCAG 2.1 AA

---

### 5.4 Rigel - The Researcher (Web Browsing Agent)

**Role:** Web research, competitive analysis, data extraction

**Capabilities:**
- Web scraping and data extraction
- Competitive analysis
- Documentation research
- API discovery
- Knowledge synthesis

**Model:** Gemini 2.0 Flash
**Provider:** Google
**Temperature:** 0.5 (balanced)

**API Interface:**
```typescript
interface RigelAgent {
  research(topic: string, sources?: string[]): Promise<ResearchReport>;
  scrapeData(url: string, schema: DataSchema): Promise<ExtractedData>;
  analyzeCompetitor(url: string): Promise<CompetitorAnalysis>;
  findAPIs(query: string): Promise<APIListing>;
}
```

**Input Example:**
```json
{
  "task": "research",
  "topic": "Best practices for real-time notifications in React",
  "sources": [
    "https://react.dev",
    "https://supabase.com/docs/guides/realtime",
    "https://vercel.com/blog"
  ],
  "format": "markdown",
  "max_sources": 10
}
```

**Output Example:**
```markdown
# Real-Time Notifications in React - Research Report

## Summary
Real-time notifications in React can be implemented using WebSockets, Server-Sent Events (SSE), or managed services like Supabase Realtime.

## Key Findings

### 1. Supabase Realtime (Recommended)
- **Pros:** Managed service, PostgreSQL integration, row-level security
- **Cons:** Vendor lock-in, requires Supabase database
- **Code Example:**
\`\`\`typescript
const subscription = supabase
  .channel('donations')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'donations_feed'
  }, (payload) => {
    toast.success(`New donation: $${payload.new.usd_value}`);
  })
  .subscribe();
\`\`\`

// ... more findings

## Recommendations
1. Use Supabase Realtime for simplicity
2. Implement exponential backoff for reconnection
3. Display offline indicator if connection drops
4. Test with slow network conditions

## Sources
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [React Best Practices](https://react.dev/learn)
```

**Database Tables:**
- `agents` (id, name='rigel', type='browsing')
- `browser_sessions` (research sessions)
- `agent_logs` (scraped data, sources)

**Success Metrics:**
- Source accuracy: >90%
- Information relevance: >85%
- Citation completeness: 100%

---

### 5.5 Cassiopeia - The Communicator (Voice Agent)

**Role:** Voice recognition, text-to-speech, natural language interaction

**Capabilities:**
- Real-time voice transcription
- Text-to-speech synthesis
- Command routing to agents
- Conversation summarization
- Multi-turn dialogue

**Model:** GPT-4o Realtime (voice), ElevenLabs (TTS)
**Provider:** OpenAI + ElevenLabs
**Voice:** Shimmer (OpenAI), Rachel (ElevenLabs)

**API Interface:**
```typescript
interface CassiopeiaAgent {
  transcribeVoice(audioStream: ReadableStream): Promise<Transcript>;
  synthesizeSpeech(text: string, voice?: string): Promise<AudioBuffer>;
  handleCommand(transcript: string): Promise<AgentDispatch>;
  summarizeConversation(messages: Message[]): Promise<Summary>;
}
```

**Input Example:**
```json
{
  "audio_url": "s3://voice-inputs/command-20250120.wav",
  "duration": 5.2,
  "sample_rate": 24000,
  "expected_language": "en-US"
}
```

**Output Example:**
```json
{
  "transcript": "Hey Sirius, plan a feature to add voice notifications when donations come in",
  "confidence": 0.94,
  "intent": "feature_planning",
  "entities": {
    "agent": "sirius",
    "action": "plan",
    "feature": "voice notifications for donations"
  },
  "response": {
    "text": "I'll help you plan voice notifications for donations. Let me break this down into implementation steps.",
    "audio_url": "s3://voice-responses/response-20250120.wav",
    "duration": 3.8
  },
  "dispatched_to": {
    "agent": "sirius",
    "task_id": "plan-voice-notifications-20250120"
  }
}
```

**Database Tables:**
- `agents` (id, name='cassiopeia', type='voice')
- `voice_sessions` (audio recordings, transcripts)
- `ai_conversations` (conversation history)

**Success Metrics:**
- Transcription accuracy: >95%
- Voice command success rate: >90%
- Response latency: <2 seconds
- Voice naturalness score: >4/5

---

### 5.6 Betelgeuse - The Builder (DevOps Agent)

**Role:** Infrastructure, deployments, CI/CD, monitoring

**Capabilities:**
- Deployment automation
- Docker container management
- CI/CD pipeline creation
- Infrastructure as code
- Monitoring and alerting

**Model:** Claude 3.5 Sonnet
**Provider:** Anthropic
**Temperature:** 0.4 (cautious)

**API Interface:**
```typescript
interface BetelgeuseAgent {
  deploy(service: string, environment: 'dev' | 'staging' | 'prod'): Promise<DeploymentResult>;
  createPipeline(config: PipelineConfig): Promise<Pipeline>;
  monitorService(service: string): Promise<HealthReport>;
  scaleService(service: string, replicas: number): Promise<ScalingResult>;
}
```

**Input Example:**
```json
{
  "task": "deploy",
  "service": "stellar-agents",
  "environment": "production",
  "confirmation_required": true,
  "dry_run": false
}
```

**Output Example:**
```json
{
  "deployment_id": "deploy-stellar-agents-prod-20250120",
  "status": "success",
  "duration": "3m 42s",
  "steps": [
    {
      "step": "build",
      "status": "success",
      "output": "Built image: newworldkids/stellar-agents:v1.2.0",
      "duration": "1m 12s"
    },
    {
      "step": "push",
      "status": "success",
      "output": "Pushed to registry",
      "duration": "45s"
    },
    {
      "step": "deploy",
      "status": "success",
      "output": "Deployed to Vercel",
      "duration": "1m 45s"
    }
  ],
  "url": "https://stellar-agents.newworldkids.com",
  "health_check": "passed"
}
```

**Database Tables:**
- `agents` (id, name='betelgeuse', type='hybrid')
- `agent_sessions` (deployment sessions)
- `agent_logs` (deployment logs, health checks)

**Success Metrics:**
- Deployment success rate: >98%
- Zero-downtime deployments: 100%
- Rollback time: <5 minutes
- Monitoring coverage: 100% of services

---

## 6. VOICE INTEGRATION

### 6.1 OpenAI Realtime API

**Purpose:** Real-time voice-to-voice interaction

**Features:**
- Speech-to-speech (no intermediate text)
- Ultra-low latency (<1 second)
- Multi-turn conversations
- Interruption handling
- Remote MCP server support

**Configuration:**
```typescript
// services/stellar-agents/src/voice/openai-realtime.ts
import { RealtimeClient } from '@openai/realtime-api-beta';

export class OpenAIRealtimeService {
  private client: RealtimeClient;

  constructor() {
    this.client = new RealtimeClient({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o-realtime-preview',
      voice: 'shimmer',
      instructions: CASSIOPEIA_SYSTEM_PROMPT,
    });
  }

  async startSession(userId: string): Promise<VoiceSession> {
    const session = await this.client.connect();

    // Store session in Supabase
    const { data } = await supabase.from('voice_sessions').insert({
      user_id: userId,
      provider: 'openai_realtime',
      voice_id: 'shimmer',
      session_id: session.id,
    }).select().single();

    return data;
  }

  async sendAudio(audioChunk: Buffer): Promise<void> {
    await this.client.sendAudio(audioChunk);
  }

  onTranscript(callback: (text: string) => void): void {
    this.client.on('transcript', callback);
  }

  onResponse(callback: (audio: Buffer) => void): void {
    this.client.on('response.audio', callback);
  }
}
```

**Cassiopeia System Prompt:**
```markdown
You are Cassiopeia, the Communicator agent in the Stellar Agentic Cockpit for New World Kids.

Your role:
- Listen to user voice commands
- Route commands to appropriate stellar agents (Sirius, Andromeda, Vega, Rigel, Betelgeuse)
- Provide voice responses confirming actions
- Summarize agent outputs in natural language

Communication style:
- Friendly, enthusiastic, encouraging
- Use cosmic/space metaphors when appropriate
- Keep responses concise (under 30 seconds)
- Confirm understanding before dispatching tasks

Available agents:
- Sirius: Feature planning and orchestration
- Andromeda: Code generation and refactoring
- Vega: UI testing and validation
- Rigel: Web research and data gathering
- Betelgeuse: Deployment and infrastructure

Example interactions:
User: "Hey Cassiopeia, ask Sirius to plan a new dashboard widget"
You: "Got it! I'm routing your request to Sirius, our Navigator. He'll plan out the dashboard widget implementation. One moment while he works his magic..."
```

---

### 6.2 ElevenLabs Text-to-Speech

**Purpose:** High-quality voice synthesis for agent responses

**Features:**
- Natural-sounding voices
- Multiple voice options
- Streaming support
- SSML support for emphasis/pauses

**Configuration:**
```typescript
// services/stellar-agents/src/voice/elevenlabs-tts.ts
import { ElevenLabsClient } from 'elevenlabs';

export class ElevenLabsTTSService {
  private client: ElevenLabsClient;
  private voiceId = 'rachel'; // or 'bella', 'antoni', etc.

  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY!,
    });
  }

  async synthesize(text: string): Promise<Buffer> {
    const audio = await this.client.textToSpeech.convert({
      voice_id: this.voiceId,
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    });

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async synthesizeSSML(ssml: string): Promise<Buffer> {
    // ElevenLabs supports SSML for advanced control
    return this.synthesize(ssml);
  }
}
```

**Voice Selection Strategy:**
```typescript
const voiceMap = {
  cassiopeia: 'rachel',       // Warm, friendly female voice
  sirius: 'adam',             // Professional male voice
  andromeda: 'bella',         // Clear, precise female voice
  vega: 'elli',               // Energetic female voice
  rigel: 'antoni',            // Calm male voice
  betelgeuse: 'josh',         // Strong, confident male voice
};
```

---

### 6.3 Voice Command Routing

**Flow:**
```
User speaks → Cassiopeia (OpenAI Realtime) → Transcribe
  ↓
Parse intent & entities
  ↓
Identify target agent (Sirius, Andromeda, Vega, Rigel, Betelgeuse)
  ↓
Dispatch task to agent via API
  ↓
Agent processes task
  ↓
Result → Cassiopeia → Synthesize response (ElevenLabs)
  ↓
Play audio to user
```

**Implementation:**
```typescript
// services/stellar-agents/src/orchestrator/voice-router.ts
export class VoiceCommandRouter {
  async route(transcript: string, userId: string): Promise<AgentDispatch> {
    // Parse command using GPT-4o
    const parsed = await this.parseCommand(transcript);

    // Identify target agent
    const targetAgent = this.identifyAgent(parsed.entities);

    // Dispatch to agent
    const result = await this.dispatchToAgent(targetAgent, parsed.task);

    // Log to database
    await supabase.from('ai_conversations').insert({
      user_id: userId,
      agent_id: targetAgent.id,
      agent_type: targetAgent.type,
      message: transcript,
      response: result.summary,
      input_type: 'voice',
      output_type: 'voice',
      tokens_used: result.tokens,
    });

    return result;
  }

  private identifyAgent(entities: Entities): Agent {
    const agentNames = ['sirius', 'andromeda', 'vega', 'rigel', 'betelgeuse'];
    const mentioned = entities.agent || this.inferFromTask(entities.task);

    if (!agentNames.includes(mentioned)) {
      return this.getDefaultAgent(entities.task);
    }

    return this.agentRegistry.get(mentioned);
  }
}
```

---

## 7. BROWSER AUTOMATION

### 7.1 Playwright Service

**Purpose:** Local headless browser automation

**Capabilities:**
- Multi-browser support (Chromium, Firefox, WebKit)
- Network interception
- Screenshots and videos
- PDF generation
- Mobile emulation

**Architecture:**
```
services/browser-service/
├── src/
│   ├── server.ts              # Express API server
│   ├── playwright/
│   │   ├── browser-pool.ts    # Browser instance pool
│   │   ├── test-runner.ts     # Test execution engine
│   │   ├── screenshot.ts      # Screenshot capture
│   │   └── video.ts           # Video recording
│   ├── scenarios/
│   │   ├── donation-flow.ts   # Pre-defined test scenarios
│   │   ├── auth-flow.ts
│   │   └── navigation.ts
│   └── types/
│       └── index.ts
├── Dockerfile
└── package.json
```

**API Endpoints:**
```typescript
// POST /api/v1/test
interface TestRequest {
  scenario: string;
  url: string;
  viewport?: { width: number; height: number };
  device?: string; // 'iPhone 13', 'iPad', etc.
  headless?: boolean;
}

// POST /api/v1/screenshot
interface ScreenshotRequest {
  url: string;
  selector?: string;
  fullPage?: boolean;
}

// POST /api/v1/navigate
interface NavigationRequest {
  url: string;
  actions: Action[];
}

interface Action {
  type: 'click' | 'fill' | 'select' | 'wait';
  selector?: string;
  value?: string;
  timeout?: number;
}
```

**Example Test:**
```typescript
// services/browser-service/src/scenarios/donation-flow.ts
import { Page } from 'playwright';

export async function testDonationFlow(page: Page, amount: number): Promise<TestResult> {
  const steps: TestStep[] = [];

  try {
    // Step 1: Navigate
    await page.goto('http://localhost:3000/donate');
    steps.push({
      step: 1,
      description: 'Navigate to /donate',
      status: 'passed',
      screenshot: await page.screenshot(),
    });

    // Step 2: Select Solana
    await page.click('[data-testid="payment-solana"]');
    steps.push({
      step: 2,
      description: 'Select Solana payment',
      status: 'passed',
      screenshot: await page.screenshot(),
    });

    // Step 3: Enter amount
    await page.fill('[data-testid="amount-input"]', amount.toString());
    steps.push({
      step: 3,
      description: `Enter amount: ${amount}`,
      status: 'passed',
      screenshot: await page.screenshot(),
    });

    // Step 4: Submit
    await page.click('[data-testid="donate-button"]');
    await page.waitForSelector('[data-testid="transaction-hash"]', { timeout: 30000 });
    steps.push({
      step: 4,
      description: 'Submit donation',
      status: 'passed',
      screenshot: await page.screenshot(),
    });

    // Verify transaction hash visible
    const txHash = await page.textContent('[data-testid="transaction-hash"]');
    if (!txHash) throw new Error('Transaction hash not found');

    return {
      status: 'passed',
      steps,
      duration: steps.reduce((sum, s) => sum + (s.duration || 0), 0),
    };
  } catch (error) {
    return {
      status: 'failed',
      steps,
      error: error.message,
    };
  }
}
```

---

### 7.2 Gemini Computer Use Model

**Purpose:** Cloud-based UI interaction and testing

**Features:**
- Visual understanding of UIs
- Natural language task execution
- Cross-platform (web, mobile, desktop)
- Outperforms other models on UI control benchmarks

**Configuration:**
```typescript
// services/stellar-agents/src/gemini/computer-use.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiComputerUseService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });
  }

  async executeTask(screenshot: Buffer, instruction: string): Promise<UIAction[]> {
    const result = await this.model.generateContent([
      {
        inlineData: {
          mimeType: 'image/png',
          data: screenshot.toString('base64'),
        },
      },
      {
        text: `You are controlling a web application. Current screenshot is shown.

Task: ${instruction}

Analyze the UI and provide the next action(s) to take. Return JSON with this format:
{
  "actions": [
    {
      "type": "click" | "fill" | "scroll" | "wait",
      "target": "CSS selector or description",
      "value": "optional value for fill actions",
      "reasoning": "why this action is needed"
    }
  ]
}`,
      },
    ]);

    const response = await result.response;
    return JSON.parse(response.text());
  }

  async validateUI(screenshot: Buffer, expectedState: string): Promise<ValidationResult> {
    const result = await this.model.generateContent([
      {
        inlineData: {
          mimeType: 'image/png',
          data: screenshot.toString('base64'),
        },
      },
      {
        text: `Validate that the UI matches this expected state: ${expectedState}

Return JSON:
{
  "valid": true/false,
  "issues": ["list of any discrepancies"],
  "confidence": 0.0-1.0
}`,
      },
    ]);

    const response = await result.response;
    return JSON.parse(response.text());
  }
}
```

---

### 7.3 Chrome DevTools MCP

**Purpose:** Advanced browser control via Chrome DevTools Protocol

**Features:**
- Network monitoring
- Performance profiling
- Console log capture
- JavaScript execution
- Coverage analysis

**Architecture:**
```
services/chrome-devtools-mcp/
├── src/
│   ├── server.ts              # MCP server
│   ├── tools/
│   │   ├── network.ts         # Network interception
│   │   ├── performance.ts     # Performance metrics
│   │   ├── console.ts         # Console log capture
│   │   └── coverage.ts        # Code coverage
│   └── types/
│       └── mcp.ts
├── Dockerfile
└── package.json
```

**MCP Server Definition:**
```json
{
  "name": "chrome-devtools-mcp",
  "version": "1.0.0",
  "description": "Chrome DevTools Protocol integration for advanced browser control",
  "tools": [
    {
      "name": "capture_network",
      "description": "Capture all network requests during page load",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": { "type": "string" },
          "filter": { "type": "string", "enum": ["all", "xhr", "fetch", "websocket"] }
        },
        "required": ["url"]
      }
    },
    {
      "name": "measure_performance",
      "description": "Measure page load performance metrics",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": { "type": "string" },
          "runs": { "type": "number", "default": 3 }
        },
        "required": ["url"]
      }
    },
    {
      "name": "capture_console",
      "description": "Capture console logs, warnings, and errors",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": { "type": "string" },
          "levels": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["url"]
      }
    }
  ]
}
```

---

## 8. BIG-3 SUPER AGENT ORCHESTRATOR

### Purpose
Coordinate three specialized agents:
1. **OpenAI Realtime** (voice agent)
2. **Claude Code** (coding agent)
3. **Gemini Computer Use** (browsing agent)

### Architecture

```
services/big-3-orchestrator/
├── src/
│   ├── server.ts                  # Express API + WebSocket
│   ├── orchestrator/
│   │   ├── coordinator.ts         # Main orchestration logic
│   │   ├── task-queue.ts          # Task queue management
│   │   └── agent-registry.ts     # Dynamic agent registration
│   ├── agents/
│   │   ├── openai-agent.ts       # OpenAI Realtime wrapper
│   │   ├── claude-agent.ts       # Claude API wrapper
│   │   └── gemini-agent.ts       # Gemini wrapper
│   ├── health/
│   │   └── monitor.ts             # Health monitoring
│   └── types/
│       └── index.ts
├── Dockerfile
└── package.json
```

### Unified Command Interface

```typescript
// services/big-3-orchestrator/src/types/index.ts
export interface UnifiedCommand {
  id: string;
  type: 'voice' | 'coding' | 'browsing' | 'multi';
  instruction: string;
  context?: Record<string, any>;
  requiredAgents: AgentType[];
  priority: 'low' | 'medium' | 'high';
  timeout?: number;
}

export interface AgentResponse {
  agentId: string;
  agentType: AgentType;
  status: 'success' | 'failure' | 'partial';
  output: any;
  logs: string[];
  tokensUsed?: number;
  duration: number;
}

export type AgentType = 'openai_realtime' | 'claude_code' | 'gemini_browsing';
```

### Orchestration Flow

```typescript
// services/big-3-orchestrator/src/orchestrator/coordinator.ts
export class Big3Coordinator {
  private agents: Map<AgentType, Agent>;
  private taskQueue: TaskQueue;

  async executeCommand(command: UnifiedCommand): Promise<OrchestrationResult> {
    // 1. Parse command and determine which agents needed
    const plan = await this.planExecution(command);

    // 2. Execute in parallel or sequence based on dependencies
    const results: AgentResponse[] = [];

    for (const step of plan.steps) {
      if (step.parallel) {
        // Execute agents in parallel
        const parallelResults = await Promise.all(
          step.agents.map(agentType =>
            this.executeAgent(agentType, step.task)
          )
        );
        results.push(...parallelResults);
      } else {
        // Execute sequentially
        const result = await this.executeAgent(step.agent, step.task);
        results.push(result);

        // Pass output to next step
        if (step.next) {
          step.next.context = result.output;
        }
      }
    }

    // 3. Aggregate results
    return this.aggregateResults(command, results);
  }

  private async executeAgent(type: AgentType, task: Task): Promise<AgentResponse> {
    const agent = this.agents.get(type);
    if (!agent) throw new Error(`Agent ${type} not registered`);

    const startTime = Date.now();

    try {
      const result = await agent.execute(task);

      // Log to Supabase
      await supabase.from('agent_sessions').insert({
        agent_id: agent.id,
        session_type: task.type,
        input_data: task,
        output_data: result,
        status: 'completed',
        completed_at: new Date().toISOString(),
        tokens_used: result.tokensUsed || 0,
      });

      return {
        agentId: agent.id,
        agentType: type,
        status: 'success',
        output: result,
        logs: result.logs || [],
        tokensUsed: result.tokensUsed,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        agentId: agent.id,
        agentType: type,
        status: 'failure',
        output: null,
        logs: [error.message],
        duration: Date.now() - startTime,
      };
    }
  }
}
```

### Example Multi-Agent Command

```typescript
// User command: "Build and test a new donation widget with voice notifications"

const command: UnifiedCommand = {
  id: 'cmd-build-test-donation-widget',
  type: 'multi',
  instruction: 'Build and test a new donation widget with voice notifications',
  requiredAgents: ['claude_code', 'gemini_browsing', 'openai_realtime'],
  priority: 'high',
};

// Execution plan generated by Big-3:
const plan = {
  steps: [
    {
      step: 1,
      agent: 'claude_code',
      task: {
        type: 'code_generation',
        spec: 'Create DonationWidget component with real-time updates',
      },
      parallel: false,
    },
    {
      step: 2,
      agents: ['gemini_browsing', 'openai_realtime'],
      tasks: [
        {
          type: 'ui_test',
          url: 'http://localhost:3000',
          scenario: 'Verify donation widget displays',
        },
        {
          type: 'voice_synthesis',
          text: 'New donation received: $50 from Anonymous',
        },
      ],
      parallel: true, // These can run simultaneously
    },
  ],
};
```

### Health Monitoring

```typescript
// services/big-3-orchestrator/src/health/monitor.ts
export class HealthMonitor {
  async checkHealth(): Promise<HealthReport> {
    const checks = await Promise.all([
      this.checkOpenAI(),
      this.checkClaude(),
      this.checkGemini(),
      this.checkSupabase(),
    ]);

    const overall = checks.every(c => c.status === 'healthy')
      ? 'healthy'
      : checks.some(c => c.status === 'unhealthy')
      ? 'unhealthy'
      : 'degraded';

    return {
      status: overall,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkOpenAI(): Promise<HealthCheck> {
    try {
      await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      });
      return { service: 'OpenAI', status: 'healthy' };
    } catch (error) {
      return { service: 'OpenAI', status: 'unhealthy', error: error.message };
    }
  }

  // Similar checks for Claude, Gemini, Supabase...
}
```

**Health Endpoint:**
```
GET /health
Response:
{
  "status": "healthy",
  "checks": [
    { "service": "OpenAI", "status": "healthy" },
    { "service": "Claude", "status": "healthy" },
    { "service": "Gemini", "status": "healthy" },
    { "service": "Supabase", "status": "healthy" }
  ],
  "timestamp": "2025-01-20T14:30:22Z"
}
```

---

## 9. COCKPIT USER INTERFACE

### 9.1 Dashboard Overview

**Route:** `/cockpit/dashboard`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Stellar Agentic Cockpit            [Voice] [Settings] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Sirius  │  │ Andromeda│  │   Vega   │              │
│  │  🌟 IDLE │  │  🌌 BUSY │  │  ✨ IDLE │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Rigel   │  │Cassiopeia│  │Betelgeuse│              │
│  │  🔵 ACTIVE│ │  👑 IDLE │  │  🔴 IDLE │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Recent Activity                                         │
│  🌟 Sirius planned "Voice Notifications" (2m ago)       │
│  🌌 Andromeda generated DonationWidget.tsx (5m ago)     │
│  ✨ Vega tested /donate flow - PASSED (8m ago)          │
├─────────────────────────────────────────────────────────┤
│  Services                              [View All]        │
│  ● Big-3 Orchestrator    HEALTHY                        │
│  ● Browser Service        HEALTHY                        │
│  ● Chrome DevTools MCP    OFFLINE                        │
└─────────────────────────────────────────────────────────┘
```

**Component Structure:**
```tsx
// apps/web/src/app/(platform)/cockpit/dashboard/page.tsx
export default function CockpitDashboard() {
  const { data: agents } = useAgents();
  const { data: recentActivity } = useRecentActivity(10);
  const { data: services } = useServices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      <CockpitHeader />

      <main className="container mx-auto px-6 py-8">
        <h1 className="font-display text-fluid-hero font-bold mb-8 heading-cosmic">
          Stellar Agentic Cockpit
        </h1>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {agents?.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {/* Recent Activity */}
        <ActivityFeed activities={recentActivity} />

        {/* Services Status */}
        <ServicesPanel services={services} />
      </main>
    </div>
  );
}
```

---

### 9.2 Agent Detail View

**Route:** `/cockpit/agents/[agentName]`

**Features:**
- Session history
- Recent logs
- Performance metrics
- Configuration

**Implementation:**
```tsx
// apps/web/src/app/(platform)/cockpit/agents/[agentName]/page.tsx
export default function AgentDetailPage({ params }: { params: { agentName: string } }) {
  const { data: agent } = useAgent(params.agentName);
  const { data: sessions } = useAgentSessions(agent?.id, { limit: 20 });
  const { data: logs } = useAgentLogs(agent?.id, { limit: 100 });

  return (
    <div className="min-h-screen bg-slate-950">
      <AgentHeader agent={agent} />

      <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Sessions */}
        <div className="lg:col-span-2">
          <SessionsList sessions={sessions} />
        </div>

        {/* Right: Stats & Config */}
        <div className="space-y-6">
          <AgentStats agent={agent} />
          <AgentConfig agent={agent} />
        </div>
      </div>

      {/* Bottom: Live Logs */}
      <div className="container mx-auto px-6 pb-8">
        <LiveLogsViewer agentId={agent?.id} logs={logs} />
      </div>
    </div>
  );
}
```

---

### 9.3 Observability Dashboard

**Route:** `/cockpit/observability`

**Features:**
- Real-time log streaming
- Filter by agent, log level, time range
- Search logs
- Export logs

**Implementation:**
```tsx
// apps/web/src/app/(platform)/cockpit/observability/page.tsx
import { useRealtimeLogs } from '@/hooks/useRealtimeLogs';

export default function ObservabilityDashboard() {
  const { logs, subscribe, unsubscribe } = useRealtimeLogs();
  const [filters, setFilters] = useState<LogFilters>({
    agents: [],
    logLevels: ['info', 'warn', 'error'],
    timeRange: '1h',
  });

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Observability Dashboard</h1>
          <LogFilters value={filters} onChange={setFilters} />
        </div>

        <div className="bg-slate-900 rounded-lg border border-green-500/20 p-6">
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Real-time subscription hook
function useRealtimeLogs() {
  const [logs, setLogs] = useState<AgentLog[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('agent_logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_logs',
      }, (payload) => {
        setLogs((prev) => [payload.new as AgentLog, ...prev].slice(0, 1000));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { logs };
}
```

---

### 9.4 Voice Command Interface

**Component:** `<VoiceCommandButton />` (global)

**Features:**
- Push-to-talk button
- Visual feedback (listening, processing, responding)
- Waveform visualization
- Transcript display

**Implementation:**
```tsx
// apps/web/src/components/cockpit/VoiceCommandButton.tsx
import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from 'tweakcn-next';

export function VoiceCommandButton() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const startListening = async () => {
    setIsListening(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });

      // Send to Cassiopeia
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const res = await fetch('/api/voice/command', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setTranscript(data.transcript);
      setResponse(data.response.text);

      // Play response audio
      const audio = new Audio(data.response.audio_url);
      audio.play();

      setIsListening(false);
    };

    mediaRecorder.start();

    // Auto-stop after 10 seconds or when button released
    setTimeout(() => mediaRecorder.stop(), 10000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        size="lg"
        className={cn(
          "rounded-full w-16 h-16 shadow-2xl transition-all",
          isListening
            ? "bg-red-500 animate-pulse"
            : "bg-purple-600 hover:bg-purple-700"
        )}
        onMouseDown={startListening}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </Button>

      {transcript && (
        <div className="absolute bottom-20 right-0 bg-slate-900 p-4 rounded-lg border border-purple-500 max-w-md">
          <p className="text-sm text-gray-400 mb-2">You said:</p>
          <p className="text-white mb-4">{transcript}</p>
          <p className="text-sm text-gray-400 mb-2">Cassiopeia:</p>
          <p className="text-purple-400">{response}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 10. INFINITE AGENTIC LOOP

### Purpose
Generate multiple implementation variants, evaluate quality/performance, keep best performers, refine specification, repeat until acceptance criteria met.

### Architecture

```
services/infinite-loop/
├── src/
│   ├── server.ts                  # Loop orchestration server
│   ├── wave-generator.ts          # Generates implementation waves
│   ├── variant-creator.ts         # Creates code variants
│   ├── evaluator.ts               # Scores variants
│   ├── spec-refiner.ts            # Refines spec based on results
│   └── types/
│       └── index.ts
├── Dockerfile
└── package.json
```

### Workflow

```
┌─────────────────────────────────────────────────────────┐
│  WAVE 1: Initial Specification                          │
│  Generate 5 variants:                                    │
│  - React + REST + Prisma                                 │
│  - Next.js + GraphQL + Drizzle                           │
│  - React + tRPC + Prisma                                 │
│  - Next.js + REST + Supabase                             │
│  - React + GraphQL + Supabase                            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  EVALUATION: Score each variant                          │
│  Criteria:                                               │
│  - Test pass rate (40%)                                  │
│  - Performance (Lighthouse score) (30%)                  │
│  - Code quality (ESLint, TypeScript) (20%)               │
│  - Bundle size (10%)                                     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  RESULTS:                                                │
│  1. Next.js + REST + Supabase       Score: 92/100       │
│  2. React + tRPC + Prisma           Score: 88/100       │
│  3. Next.js + GraphQL + Drizzle     Score: 85/100       │
│  (Discard bottom 2)                                      │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  REFINE SPEC:                                            │
│  - Next.js performs better than React                    │
│  - Supabase simplifies auth/real-time                    │
│  - REST is simpler than GraphQL for this use case        │
│  Updated spec: "Use Next.js + Supabase + REST"           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  WAVE 2: Refined Specification                           │
│  Generate 5 new variants (mutations of top performers)   │
│  - Next.js + Supabase + REST (baseline)                  │
│  - Next.js + Supabase + Server Actions                   │
│  - Next.js + Supabase + Tanstack Query                   │
│  - Next.js + Supabase + SWR                              │
│  - Next.js + Supabase + React Query + Suspense           │
└─────────────────────────────────────────────────────────┘
                    ↓
              (Repeat until score > 95)
```

### Implementation

```typescript
// services/infinite-loop/src/wave-generator.ts
export class WaveGenerator {
  async generateWave(
    spec: Specification,
    waveNumber: number,
    previousResults?: VariantResult[]
  ): Promise<Wave> {
    // Create wave entry
    const { data: wave } = await supabase.from('agentic_waves').insert({
      wave_number: waveNumber,
      specification: spec,
      acceptance_criteria: spec.acceptanceCriteria,
      status: 'running',
    }).select().single();

    // Generate variants
    const directives = this.generateDirectives(spec, previousResults);
    const variants: Variant[] = [];

    for (const directive of directives) {
      const variant = await this.createVariant(wave.id, directive);
      variants.push(variant);
    }

    return { wave, variants };
  }

  private generateDirectives(
    spec: Specification,
    previousResults?: VariantResult[]
  ): Directive[] {
    if (!previousResults) {
      // Wave 1: Diverse exploration
      return [
        { name: 'react-rest-prisma', stack: ['React', 'REST', 'Prisma'] },
        { name: 'nextjs-graphql-drizzle', stack: ['Next.js', 'GraphQL', 'Drizzle'] },
        { name: 'react-trpc-prisma', stack: ['React', 'tRPC', 'Prisma'] },
        { name: 'nextjs-rest-supabase', stack: ['Next.js', 'REST', 'Supabase'] },
        { name: 'react-graphql-supabase', stack: ['React', 'GraphQL', 'Supabase'] },
      ];
    }

    // Wave 2+: Mutations of top performers
    const topPerformers = previousResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    const mutations: Directive[] = [];

    for (const performer of topPerformers) {
      // Keep baseline
      mutations.push(performer.directive);

      // Mutate one dimension
      mutations.push({
        ...performer.directive,
        name: `${performer.directive.name}-mutation-1`,
        stack: this.mutateStack(performer.directive.stack, 0),
      });

      mutations.push({
        ...performer.directive,
        name: `${performer.directive.name}-mutation-2`,
        stack: this.mutateStack(performer.directive.stack, 1),
      });
    }

    return mutations.slice(0, 5); // Keep wave size manageable
  }

  private mutateStack(stack: string[], index: number): string[] {
    const alternatives = {
      'React': ['Next.js', 'Remix'],
      'Next.js': ['React', 'Remix'],
      'REST': ['GraphQL', 'tRPC', 'Server Actions'],
      'GraphQL': ['REST', 'tRPC'],
      'Prisma': ['Drizzle', 'TypeORM', 'Supabase'],
      'Supabase': ['Prisma', 'Drizzle'],
    };

    const newStack = [...stack];
    const current = stack[index];
    const options = alternatives[current] || [current];
    newStack[index] = options[Math.floor(Math.random() * options.length)];

    return newStack;
  }
}
```

```typescript
// services/infinite-loop/src/evaluator.ts
export class VariantEvaluator {
  async evaluate(variant: Variant): Promise<VariantResult> {
    const scores: Partial<ScoreBreakdown> = {};

    // 1. Run tests (40% weight)
    const testResult = await this.runTests(variant.code_output);
    scores.test_pass_rate = testResult.passRate;

    // 2. Performance test (30% weight)
    const perfResult = await this.runLighthouse(variant.url);
    scores.lighthouse_score = perfResult.score;

    // 3. Code quality (20% weight)
    const qualityResult = await this.analyzeCode(variant.code_output);
    scores.code_quality = qualityResult.score;

    // 4. Bundle size (10% weight)
    const bundleResult = await this.analyzeBundleSize(variant.code_output);
    scores.bundle_size = bundleResult.score;

    // Calculate weighted score
    const finalScore =
      scores.test_pass_rate * 0.4 +
      scores.lighthouse_score * 0.3 +
      scores.code_quality * 0.2 +
      scores.bundle_size * 0.1;

    // Save result
    const { data } = await supabase.from('variant_results').insert({
      wave_id: variant.wave_id,
      variant_name: variant.name,
      directive: variant.directive,
      code_output: variant.code_output,
      test_results: testResult,
      score: finalScore,
      is_top_performer: false, // Updated later
      kept: false,
    }).select().single();

    return data;
  }

  private async runTests(code: CodeOutput): Promise<TestResult> {
    // Execute Jest/Vitest tests
    const { stdout } = await exec(`cd ${code.path} && npm test`);
    const match = stdout.match(/(\d+) passed, (\d+) failed/);

    const passed = parseInt(match[1]);
    const failed = parseInt(match[2]);
    const total = passed + failed;

    return {
      passRate: total > 0 ? passed / total : 0,
      passed,
      failed,
      total,
    };
  }

  private async runLighthouse(url: string): Promise<PerformanceResult> {
    // Run Lighthouse
    const result = await lighthouse(url, {
      output: 'json',
      onlyCategories: ['performance'],
    });

    return {
      score: result.lhr.categories.performance.score * 100,
      metrics: result.lhr.audits,
    };
  }
}
```

```typescript
// services/infinite-loop/src/spec-refiner.ts
export class SpecificationRefiner {
  async refine(
    originalSpec: Specification,
    results: VariantResult[]
  ): Promise<Specification> {
    // Identify top performers
    const topPerformers = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Extract common patterns
    const commonPatterns = this.extractPatterns(topPerformers);

    // Use GPT-4 to refine spec
    const refinedText = await this.callGPT4(`
You are refining a technical specification based on implementation results.

Original Specification:
${originalSpec.text}

Top Performing Implementations:
${topPerformers.map((r, i) => `${i + 1}. ${r.variant_name} (Score: ${r.score})`).join('\n')}

Common Patterns in Top Performers:
${commonPatterns.join('\n')}

Refine the specification to incorporate learnings from the top performers.
Focus on:
- Technology choices (frameworks, libraries)
- Architecture patterns
- Performance optimizations
- Code organization

Return the refined specification as markdown.
    `);

    return {
      ...originalSpec,
      text: refinedText,
      version: originalSpec.version + 1,
      refinedAt: new Date().toISOString(),
    };
  }

  private extractPatterns(results: VariantResult[]): string[] {
    // Analyze common elements across top performers
    const frameworks = results.map(r => r.directive.stack[0]);
    const dataLayers = results.map(r => r.directive.stack[2]);

    const frameworkCounts = this.countOccurrences(frameworks);
    const dataLayerCounts = this.countOccurrences(dataLayers);

    return [
      `Most common framework: ${this.mostCommon(frameworkCounts)}`,
      `Most common data layer: ${this.mostCommon(dataLayerCounts)}`,
    ];
  }
}
```

### Acceptance Criteria

Loop terminates when:
1. **Score threshold met:** Best variant > 95/100
2. **Improvement plateau:** Less than 2% improvement over 2 waves
3. **Max iterations:** 10 waves completed
4. **Manual approval:** User confirms "this is good enough"

---

## 11. SERVICES ARCHITECTURE

### Service Registry

```
services/
├── cms/                    # Strapi CMS (existing)
├── stream/                 # HLS streaming (existing)
├── ai-agents/              # AI agents (existing)
├── blockchain/             # Solana blockchain (existing)
├── computer-control/       # Gemini Computer Use (existing)
├── stellar-agents/         # NEW: Six stellar agents
├── big-3-orchestrator/     # NEW: Big-3 coordination
├── browser-service/        # NEW: Playwright automation
├── chrome-devtools-mcp/    # NEW: Chrome DevTools MCP
├── youtube-automation/     # NEW: Video automation (future)
└── rube-mcp/               # NEW: Rube MCP server (future)
```

### Service Discovery

All services register in `services` table on startup:

```typescript
// Shared: services/shared/src/service-registry.ts
export async function registerService(config: ServiceConfig): Promise<void> {
  const { data: existing } = await supabase
    .from('services')
    .select('*')
    .eq('name', config.name)
    .single();

  if (existing) {
    // Update
    await supabase.from('services').update({
      status: 'healthy',
      endpoint_url: config.endpointUrl,
      health_check_url: config.healthCheckUrl,
      version: config.version,
      updated_at: new Date().toISOString(),
    }).eq('id', existing.id);
  } else {
    // Insert
    await supabase.from('services').insert({
      name: config.name,
      display_name: config.displayName,
      type: config.type,
      description: config.description,
      endpoint_url: config.endpointUrl,
      health_check_url: config.healthCheckUrl,
      status: 'healthy',
      version: config.version,
    });
  }
}
```

### Health Check Loop

```typescript
// services/big-3-orchestrator/src/health/monitor.ts
setInterval(async () => {
  const { data: services } = await supabase.from('services').select('*');

  for (const service of services) {
    try {
      const res = await fetch(service.health_check_url, { timeout: 5000 });
      const isHealthy = res.ok;

      await supabase.from('services').update({
        status: isHealthy ? 'healthy' : 'unhealthy',
        last_health_check: new Date().toISOString(),
      }).eq('id', service.id);

      await supabase.from('service_health_history').insert({
        service_id: service.id,
        status: isHealthy ? 'healthy' : 'unhealthy',
        response_time_ms: res.headers.get('x-response-time'),
      });
    } catch (error) {
      await supabase.from('services').update({
        status: 'offline',
        last_health_check: new Date().toISOString(),
      }).eq('id', service.id);
    }
  }
}, 30000); // Every 30 seconds
```

---

## 12. DATABASE SCHEMA

See `supabase/migrations/20250120_initial_schema.sql` for complete SQL.

### Key Tables

1. **agents** - Stellar agent registry
2. **agent_sessions** - Session tracking for each agent invocation
3. **agent_logs** - Observability logs (all actions, tool calls, thoughts)
4. **ai_conversations** - Chat history (multi-modal)
5. **voice_sessions** - Voice recordings and transcripts
6. **donations_feed** - Real-time donation events
7. **browser_sessions** - Browser automation sessions
8. **agentic_waves** - Infinite loop wave iterations
9. **variant_results** - Implementation variant scores
10. **services** - Service registry
11. **service_health_history** - Health check history
12. **tutorials** - Cosmic Tutorials content

### Relationships

```
users (Supabase Auth)
  ↓
user_profiles (extended profiles)
  ↓
ai_conversations (chat history)
  ↓
voice_sessions (voice recordings)

agents
  ↓
agent_sessions (sessions)
  ↓
agent_logs (observability)

agentic_waves
  ↓
variant_results (variant scores)
```

---

## 13. API CONTRACTS

### RESTful APIs

All services expose REST APIs under `/api/v1/`:

**Stellar Agents:**
- `POST /api/v1/agents/:name/execute` - Execute agent task
- `GET /api/v1/agents/:name/sessions` - Get session history
- `GET /api/v1/agents/:name/logs` - Get agent logs

**Big-3 Orchestrator:**
- `POST /api/v1/orchestrator/execute` - Execute multi-agent command
- `GET /api/v1/orchestrator/health` - Health check
- `WS /api/v1/orchestrator/stream` - Real-time log streaming

**Browser Service:**
- `POST /api/v1/browser/test` - Run browser test
- `POST /api/v1/browser/screenshot` - Capture screenshot
- `POST /api/v1/browser/navigate` - Navigate and interact

**Voice Service:**
- `POST /api/v1/voice/command` - Process voice command
- `POST /api/v1/voice/synthesize` - Text-to-speech
- `WS /api/v1/voice/stream` - Real-time audio stream

### WebSocket APIs

Real-time communication via WebSockets:

```typescript
// Connect to log stream
const ws = new WebSocket('wss://api.newworldkids.com/v1/logs/stream');

ws.onmessage = (event) => {
  const log: AgentLog = JSON.parse(event.data);
  console.log(`[${log.agent_id}] ${log.message}`);
};

// Subscribe to donation feed
const donationWs = new WebSocket('wss://api.newworldkids.com/v1/donations/stream');

donationWs.onmessage = (event) => {
  const donation: Donation = JSON.parse(event.data);
  toast.success(`New donation: $${donation.usd_value}`);
};
```

---

## 14. SECURITY & AUTHENTICATION

### Authentication Flow

```
User → Supabase Auth → JWT Token → Supabase RLS
                     ↓
                Vercel Edge Functions
                     ↓
              Protected API Routes
```

### Row Level Security (RLS)

All Supabase tables have RLS enabled:

```sql
-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Agents table is public read
CREATE POLICY "Anyone can view agents" ON agents
  FOR SELECT USING (true);

-- Admin-only writes
CREATE POLICY "Admins can modify services" ON services
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### API Key Management

```typescript
// Environment variables (never commit)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
ELEVENLABS_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

// Rotate keys every 90 days
// Store in Vercel Environment Variables
```

---

## 15. PERFORMANCE REQUIREMENTS

| Metric | Target | Critical |
|--------|--------|----------|
| **Lighthouse Score** | >90 | >80 |
| **First Contentful Paint** | <1.5s | <2.5s |
| **Time to Interactive** | <3.0s | <5.0s |
| **Agent Response Time** | <5s | <10s |
| **Voice Latency** | <1s | <2s |
| **Database Query Time** | <100ms | <500ms |
| **API Response Time** | <200ms | <1s |

### Optimization Strategies

1. **Code Splitting** - Dynamic imports for agent modules
2. **Image Optimization** - Next.js Image component
3. **Font Loading** - Next.js font optimization
4. **Caching** - Redis for frequently accessed data
5. **CDN** - Vercel Edge Network
6. **Database Indexing** - See migration file

---

## 16. TESTING STRATEGY

### Unit Tests
- All utility functions
- Agent logic
- API route handlers
- React components (via Vitest + Testing Library)

### Integration Tests
- Agent orchestration flows
- Voice command routing
- Browser automation scenarios
- Database operations

### E2E Tests
- Full user workflows via Playwright
- Voice-to-action flows
- Multi-agent coordination

### Test Coverage Target
- Unit: >80%
- Integration: >70%
- E2E: Critical paths only

---

## 17. DEPLOYMENT

### Vercel (Frontend + Edge Functions)
- **Apps/Web** → Vercel production
- **Environment:** Production, Preview, Development
- **Domains:** newworldkids.com, cockpit.newworldkids.com

### Railway/Render (Backend Services)
- **Stellar Agents** → Railway
- **Big-3 Orchestrator** → Railway
- **Browser Service** → Railway (with Chrome installed)
- **Chrome DevTools MCP** → Railway

### Supabase (Database)
- **Region:** US East (or closest to users)
- **Plan:** Pro (for performance + support)
- **Backups:** Daily automated

---

## 18. SUCCESS METRICS

### Phase 1 (Launch)
- [ ] All 6 stellar agents operational
- [ ] Voice commands working end-to-end
- [ ] Dashboard accessible and real-time
- [ ] At least 3 tutorials published
- [ ] Zero critical bugs

### Phase 2 (Adoption)
- [ ] 10+ voice commands executed per day
- [ ] 100+ agent sessions per week
- [ ] >90% uptime for all services
- [ ] User satisfaction: 4.5/5 stars

### Phase 3 (Scale)
- [ ] Support 1000+ concurrent users
- [ ] <2s average agent response time
- [ ] 99.9% uptime SLA
- [ ] Community contributions (tutorials, custom agents)

---

## 19. APPENDICES

### A. Glossary

- **Stellar Agent:** AI agent named after cosmic entity (Sirius, Andromeda, etc.)
- **Big-3:** Orchestrator coordinating OpenAI, Claude, Gemini
- **Cockpit:** Admin dashboard for monitoring and controlling agents
- **MCP:** Model Context Protocol for tool servers
- **Infinite Loop:** Iterative variant generation and evaluation system

### B. References

- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [Gemini Computer Use](https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/)
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Playwright Docs](https://playwright.dev/)

### C. Open Questions

1. **Sora API Access:** When will we get access?
2. **YouTube Automation:** Should we use existing library or build custom?
3. **Rube MCP Scope:** What specific capabilities needed?
4. **Mobile App:** React Native or Flutter?

---

**END OF SPECIFICATION**

**Total Pages:** 50+
**Total Words:** ~15,000
**Estimated Implementation Time:** 2-4 weeks (traditional) | 2-3 days (with Codex)
**Complexity:** High
**Innovation Level:** Very High

This specification is complete and ready for Codex implementation.

**Next Step:** Create `plan.md` with technical architecture and file structure.
