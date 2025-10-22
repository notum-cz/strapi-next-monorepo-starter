# ✅ STELLAR AGENTIC COCKPIT - IMPLEMENTATION TASKS

**Version:** 1.0.0
**Total Tasks:** 150+
**Estimated Time:** 4-8 hours (with GPT-5-Codex adaptive reasoning)

---

## 📋 TASK EXECUTION ORDER

**CRITICAL:** Follow this order EXACTLY. Each phase builds on the previous one.

---

## 🏗️ PHASE 1: FOUNDATION (1-2 hours)

### 1.1 Database Setup ⚡ CRITICAL - DO FIRST

- [ ] **Task 1.1.1:** Apply Supabase Migration
  ```bash
  # Go to Supabase Dashboard SQL Editor
  # https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe
  # Copy contents of: supabase/migrations/20250120_initial_schema.sql
  # Paste and click "Run"
  ```
  **Validation:** Query `SELECT * FROM agents` returns 6 rows
  **Files:** None (SQL executed in Supabase)

- [ ] **Task 1.1.2:** Verify Tables Created
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name;
  ```
  **Expected:** 14 tables (agents, agent_sessions, agent_logs, ai_conversations, voice_sessions, donations_feed, browser_sessions, agentic_waves, variant_results, services, service_health_history, user_profiles, user_perks, tutorials)

---

### 1.2 Typography & Fonts

- [ ] **Task 1.2.1:** Create Font Configuration
  **File:** `apps/web/src/lib/fonts.ts`
  **Content:** Import Space Grotesk, Orbitron, Inter, JetBrains Mono, Playfair Display, Bebas Neue from `next/font/google`
  **Validation:** Fonts export with `variable` property

- [ ] **Task 1.2.2:** Update Root Layout
  **File:** `apps/web/src/app/layout.tsx`
  **Changes:** Add font variables to `<html>` className
  ```tsx
  <html className={`${inter.variable} ${spaceGrotesk.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}>
  ```

- [ ] **Task 1.2.3:** Update Tailwind Config
  **File:** `apps/web/tailwind.config.ts`
  **Changes:** Add font families (see plan.md for complete config)
  **Validation:** Run `yarn dev` and check no errors

---

### 1.3 Shared Utilities

- [ ] **Task 1.3.1:** Supabase Client Utils (Agent Helpers)
  **File:** `services/stellar-agents/src/config/supabase.ts`
  **Functions:**
  - `getAllAgents()`
  - `getAgentByName(name)`
  - `updateAgentStatus(agentId, status)`
  - `createSession(agentId, type, inputData)`
  - `completeSession(sessionId, output, tokens)`
  - `logAction(agentId, sessionId, action)`

- [ ] **Task 1.3.2:** Base Agent Class
  **File:** `services/stellar-agents/src/base/BaseAgent.ts`
  **Class:** Abstract `BaseAgent` with:
  - Constructor: `(config: AgentConfig)`
  - Abstract: `execute(task: Task): Promise<AgentResult>`
  - Protected: `logAction(action: AgentAction)`
  - Protected: `createSession(type, inputData)`
  - Protected: `completeSession(sessionId, output, tokens)`
  **Validation:** Class compiles with TypeScript

- [ ] **Task 1.3.3:** Agent Registry
  **File:** `services/stellar-agents/src/base/AgentRegistry.ts`
  **Class:** `AgentRegistry` with Map<string, BaseAgent>
  **Methods:**
  - `register(agent: BaseAgent)`
  - `get(name: string): BaseAgent`
  - `getAll(): BaseAgent[]`
  - `has(name: string): boolean`

- [ ] **Task 1.3.4:** TypeScript Types
  **File:** `services/stellar-agents/src/types/index.ts`
  **Types:** Agent, AgentConfig, AgentType, AgentStatus, Task, AgentResult, AgentAction, AgentSession, ModelConfig, VoiceSession, BrowserSession, etc.
  **Validation:** Export all types, no errors

---

## 🌟 PHASE 2: STELLAR AGENTS (2-3 hours)

### 2.1 Sirius - The Navigator (Orchestrator)

- [ ] **Task 2.1.1:** Sirius Agent Class
  **File:** `services/stellar-agents/src/agents/sirius/index.ts`
  **Extends:** BaseAgent
  **Methods:**
  - `execute(task: Task)` - Main entry point
  - `planFeature(description: string)` - Create feature plan
  - `decomposeTask(task: Task)` - Break into sub-tasks
  - `assignAgent(task: Task)` - Determine which agent should handle task

- [ ] **Task 2.1.2:** Planner Module
  **File:** `services/stellar-agents/src/agents/sirius/planner.ts`
  **Functions:**
  - `createPlan(description, context)` - Call GPT-4 Turbo to plan
  - `estimateComplexity(task)` - Calculate complexity score
  - `selectAgents(tasks)` - Choose appropriate agents for each task

- [ ] **Task 2.1.3:** Orchestrator Module
  **File:** `services/stellar-agents/src/agents/sirius/orchestrator.ts`
  **Functions:**
  - `orchestrate(plan)` - Execute plan with multiple agents
  - `dispatchToAgent(agent, task)` - Send task to specific agent
  - `aggregateResults(results)` - Combine outputs from multiple agents

- [ ] **Task 2.1.4:** Register Sirius
  **File:** `services/stellar-agents/src/server.ts`
  **Code:** `registry.register(new SiriusAgent({ id: 'sirius', ... }))`

---

### 2.2 Andromeda - The Coder

- [ ] **Task 2.2.1:** Andromeda Agent Class
  **File:** `services/stellar-agents/src/agents/andromeda/index.ts`
  **Methods:**
  - `execute(task: Task)` - Main entry point
  - `generateCode(spec: CodeSpec)` - Generate code from spec
  - `refactor(code: string, goal: string)` - Refactor existing code
  - `debug(error: Error, context: CodeContext)` - Fix bugs
  - `reviewCode(code: string)` - Code review with suggestions

- [ ] **Task 2.2.2:** Code Generator
  **File:** `services/stellar-agents/src/agents/andromeda/code-generator.ts`
  **Uses:** Anthropic Claude 3.5 Sonnet API
  **Functions:**
  - `generateComponent(spec)` - React component
  - `generateAPI(spec)` - API route
  - `generateService(spec)` - Service class
  - `generateTest(code)` - Test suite

- [ ] **Task 2.2.3:** Refactorer Module
  **File:** `services/stellar-agents/src/agents/andromeda/refactorer.ts`
  **Functions:**
  - `refactorForPerformance(code)`
  - `refactorForReadability(code)`
  - `extractFunction(code, selection)`
  - `renameVariable(code, oldName, newName)`

- [ ] **Task 2.2.4:** Test Generator
  **File:** `services/stellar-agents/src/agents/andromeda/test-generator.ts`
  **Functions:**
  - `generateUnitTests(code)`
  - `generateIntegrationTests(code)`
  - `generateE2ETests(userStory)`

- [ ] **Task 2.2.5:** Register Andromeda
  **File:** `services/stellar-agents/src/server.ts`

---

### 2.3 Vega - The Validator (Browser Testing)

- [ ] **Task 2.3.1:** Vega Agent Class
  **File:** `services/stellar-agents/src/agents/vega/index.ts`
  **Methods:**
  - `execute(task: Task)` - Main entry point
  - `testUI(url: string, scenario: TestScenario)` - Run UI test
  - `visualRegression(baseline, current)` - Compare screenshots
  - `accessibilityAudit(url)` - WCAG audit
  - `performanceTest(url)` - Lighthouse test

- [ ] **Task 2.3.2:** UI Tester Module
  **File:** `services/stellar-agents/src/agents/vega/ui-tester.ts`
  **Uses:** Browser Service API
  **Functions:**
  - `runScenario(scenario)` - Execute test scenario
  - `captureScreenshot(step)` - Take screenshot
  - `verifyAssertion(assertion)` - Check assertion
  - `generateReport(results)` - Test report

- [ ] **Task 2.3.3:** Accessibility Module
  **File:** `services/stellar-agents/src/agents/vega/accessibility.ts`
  **Uses:** axe-core via Playwright
  **Functions:**
  - `runAccessibilityAudit(url)`
  - `checkColorContrast(url)`
  - `checkKeyboardNavigation(url)`
  - `generateA11yReport(violations)`

- [ ] **Task 2.3.4:** Register Vega
  **File:** `services/stellar-agents/src/server.ts`

---

### 2.4 Rigel - The Researcher

- [ ] **Task 2.4.1:** Rigel Agent Class
  **File:** `services/stellar-agents/src/agents/rigel/index.ts`
  **Methods:**
  - `execute(task: Task)` - Main entry point
  - `research(topic, sources)` - Web research
  - `scrapeData(url, schema)` - Extract structured data
  - `analyzeCompetitor(url)` - Competitive analysis
  - `findAPIs(query)` - Discover APIs

- [ ] **Task 2.4.2:** Researcher Module
  **File:** `services/stellar-agents/src/agents/rigel/researcher.ts`
  **Uses:** Gemini 2.0 Flash API
  **Functions:**
  - `searchWeb(query)` - Web search
  - `extractInformation(url, question)` - Q&A from webpage
  - `summarizeSources(sources)` - Synthesize information
  - `generateReport(findings)` - Markdown report

- [ ] **Task 2.4.3:** Scraper Module
  **File:** `services/stellar-agents/src/agents/rigel/scraper.ts`
  **Functions:**
  - `scrapeStructuredData(url, schema)`
  - `extractTableData(url, tableSelector)`
  - `extractLinks(url, pattern)`
  - `handlePagination(url, maxPages)`

- [ ] **Task 2.4.4:** Register Rigel
  **File:** `services/stellar-agents/src/server.ts`

---

### 2.5 Cassiopeia - The Communicator (Voice)

- [ ] **Task 2.5.1:** Cassiopeia Agent Class
  **File:** `services/stellar-agents/src/agents/cassiopeia/index.ts`
  **Methods:**
  - `execute(task: Task)` - Main entry point
  - `transcribeVoice(audioStream)` - Speech-to-text
  - `synthesizeSpeech(text, voice)` - Text-to-speech
  - `handleCommand(transcript)` - Route command to agent
  - `summarizeConversation(messages)` - Conversation summary

- [ ] **Task 2.5.2:** Voice Handler Module
  **File:** `services/stellar-agents/src/agents/cassiopeia/voice-handler.ts`
  **Uses:** OpenAI Realtime API + ElevenLabs
  **Functions:**
  - `startVoiceSession(userId)`
  - `processAudioChunk(chunk)`
  - `generateVoiceResponse(text)`
  - `endVoiceSession(sessionId)`

- [ ] **Task 2.5.3:** Command Router
  **File:** `services/stellar-agents/src/agents/cassiopeia/command-router.ts`
  **Functions:**
  - `parseCommand(transcript)` - Extract intent + entities
  - `identifyTargetAgent(intent)` - Which agent to call
  - `dispatchCommand(agent, task)` - Execute command
  - `formatResponse(result)` - Natural language response

- [ ] **Task 2.5.4:** Register Cassiopeia
  **File:** `services/stellar-agents/src/server.ts`

---

### 2.6 Betelgeuse - The Builder (DevOps)

- [ ] **Task 2.6.1:** Betelgeuse Agent Class
  **File:** `services/stellar-agents/src/agents/betelgeuse/index.ts`
  **Methods:**
  - `execute(task: Task)` - Main entry point
  - `deploy(service, environment)` - Deploy service
  - `createPipeline(config)` - CI/CD pipeline
  - `monitorService(service)` - Health monitoring
  - `scaleService(service, replicas)` - Auto-scaling

- [ ] **Task 2.6.2:** Deployer Module
  **File:** `services/stellar-agents/src/agents/betelgeuse/deployer.ts`
  **Functions:**
  - `buildDockerImage(service)`
  - `pushToRegistry(image)`
  - `deployToVercel(config)`
  - `deployToRailway(config)`
  - `rollback(deploymentId)`

- [ ] **Task 2.6.3:** Monitor Module
  **File:** `services/stellar-agents/src/agents/betelgeuse/monitor.ts`
  **Functions:**
  - `checkHealth(service)`
  - `getMetrics(service, timeRange)`
  - `setAlert(service, condition)`
  - `getServiceLogs(service, limit)`

- [ ] **Task 2.6.4:** Register Betelgeuse
  **File:** `services/stellar-agents/src/server.ts`

---

### 2.7 Stellar Agents API Server

- [ ] **Task 2.7.1:** Express Server Setup
  **File:** `services/stellar-agents/src/server.ts`
  **Routes:**
  - `POST /api/v1/agents/:name/execute` - Execute agent task
  - `GET /api/v1/agents/:name/sessions` - Get session history
  - `GET /api/v1/agents/:name/logs` - Get agent logs
  - `GET /health` - Health check
  **Port:** 3004

- [ ] **Task 2.7.2:** Package.json
  **File:** `services/stellar-agents/package.json`
  **Dependencies:** `express`, `@supabase/supabase-js`, `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`, `elevenlabs`, `cors`, `dotenv`

- [ ] **Task 2.7.3:** Dockerfile
  **File:** `services/stellar-agents/Dockerfile`
  **Base:** `node:22-alpine`
  **Expose:** 3004

- [ ] **Task 2.7.4:** Service Registration
  **Code:** On startup, register service in Supabase `services` table

---

## 🎙️ PHASE 3: VOICE INTEGRATION (30 min - 1 hour)

### 3.1 OpenAI Realtime Service

- [ ] **Task 3.1.1:** Realtime Client
  **File:** `services/stellar-agents/src/voice/openai-realtime.ts`
  **Class:** `OpenAIRealtimeService`
  **Methods:**
  - `startSession(userId)` - Initialize WebSocket connection
  - `sendAudio(chunk)` - Stream audio to OpenAI
  - `onTranscript(callback)` - Listen for transcriptions
  - `onResponse(callback)` - Listen for audio responses
  - `endSession()` - Close connection

- [ ] **Task 3.1.2:** System Prompt
  **File:** `services/stellar-agents/src/voice/cassiopeia-prompt.ts`
  **Content:** Cassiopeia personality, agent routing logic, cosmic metaphors

---

### 3.2 ElevenLabs TTS

- [ ] **Task 3.2.1:** TTS Service
  **File:** `services/stellar-agents/src/voice/elevenlabs-tts.ts`
  **Class:** `ElevenLabsTTSService`
  **Methods:**
  - `synthesize(text, voice)` - Convert text to speech
  - `synthesizeSSML(ssml)` - SSML support
  - `streamAudio(text)` - Streaming synthesis

- [ ] **Task 3.2.2:** Voice Mapping
  **File:** Same as above
  **Const:** `voiceMap` - Map agents to voices (Cassiopeia → Rachel, Sirius → Adam, etc.)

---

### 3.3 Voice Command Router

- [ ] **Task 3.3.1:** Router Service
  **File:** `services/stellar-agents/src/voice/voice-router.ts`
  **Class:** `VoiceCommandRouter`
  **Methods:**
  - `route(transcript, userId)` - Parse and dispatch command
  - `parseCommand(transcript)` - Extract intent + entities (uses GPT-4)
  - `identifyAgent(entities)` - Determine target agent
  - `dispatchToAgent(agent, task)` - Execute task

---

## 🌐 PHASE 4: BIG-3 ORCHESTRATOR (1 hour)

### 4.1 Coordinator

- [ ] **Task 4.1.1:** Main Coordinator
  **File:** `services/big-3-orchestrator/src/coordinator.ts`
  **Class:** `Big3Coordinator`
  **Methods:**
  - `executeCommand(command: UnifiedCommand)` - Orchestrate multi-agent task
  - `planExecution(command)` - Determine agent sequence
  - `executeAgent(type, task)` - Execute single agent
  - `aggregateResults(results)` - Combine outputs

- [ ] **Task 4.1.2:** Task Queue
  **File:** `services/big-3-orchestrator/src/task-queue.ts`
  **Class:** `TaskQueue`
  **Methods:**
  - `enqueue(task)` - Add task
  - `dequeue()` - Get next task
  - `peek()` - View next without removing
  - `size()` - Queue length

- [ ] **Task 4.1.3:** Agent Registry
  **File:** `services/big-3-orchestrator/src/agent-registry.ts`
  **Similar to Stellar Agents registry**

---

### 4.2 Agent Wrappers

- [ ] **Task 4.2.1:** OpenAI Agent Wrapper
  **File:** `services/big-3-orchestrator/src/agents/openai-agent.ts`
  **Class:** `OpenAIAgent`
  **Uses:** OpenAI Realtime API
  **Methods:** `execute(task)`, `getHealth()`

- [ ] **Task 4.2.2:** Claude Agent Wrapper
  **File:** `services/big-3-orchestrator/src/agents/claude-agent.ts`
  **Class:** `ClaudeAgent`
  **Uses:** Anthropic Claude API
  **Methods:** `execute(task)`, `getHealth()`

- [ ] **Task 4.2.3:** Gemini Agent Wrapper
  **File:** `services/big-3-orchestrator/src/agents/gemini-agent.ts`
  **Class:** `GeminiAgent`
  **Uses:** Google Generative AI
  **Methods:** `execute(task)`, `getHealth()`

---

### 4.3 Health Monitoring

- [ ] **Task 4.3.1:** Health Monitor
  **File:** `services/big-3-orchestrator/src/health/monitor.ts`
  **Functions:**
  - `checkHealth()` - Check all three agents + Supabase
  - `checkOpenAI()` - Ping OpenAI API
  - `checkClaude()` - Ping Anthropic API
  - `checkGemini()` - Ping Google API
  - `checkSupabase()` - Query Supabase

- [ ] **Task 4.3.2:** Health Endpoint
  **File:** `services/big-3-orchestrator/src/server.ts`
  **Route:** `GET /health`
  **Response:** `{ status: 'healthy'|'degraded'|'unhealthy', checks: [...] }`

---

### 4.4 Server Setup

- [ ] **Task 4.4.1:** Express Server
  **File:** `services/big-3-orchestrator/src/server.ts`
  **Routes:**
  - `POST /api/v1/orchestrator/execute` - Execute multi-agent command
  - `GET /health` - Health check
  - `WS /api/v1/orchestrator/stream` - WebSocket for real-time logs
  **Port:** 3010

- [ ] **Task 4.4.2:** Package.json
  **Dependencies:** `express`, `ws`, `@supabase/supabase-js`, `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`

- [ ] **Task 4.4.3:** Dockerfile

---

## 🌐 PHASE 5: BROWSER AUTOMATION (1 hour)

### 5.1 Playwright Service

- [ ] **Task 5.1.1:** Browser Pool
  **File:** `services/browser-service/src/playwright/browser-pool.ts`
  **Class:** `BrowserPool`
  **Methods:**
  - `acquire()` - Get browser instance
  - `release(browser)` - Return to pool
  - `close()` - Shutdown all browsers

- [ ] **Task 5.1.2:** Test Runner
  **File:** `services/browser-service/src/playwright/test-runner.ts`
  **Functions:**
  - `runTest(scenario)` - Execute test scenario
  - `captureScreenshot(page, name)` - Screenshot
  - `captureVideo(page)` - Record video
  - `generateReport(results)` - Test report

- [ ] **Task 5.1.3:** Screenshot Utility
  **File:** `services/browser-service/src/playwright/screenshot.ts`
  **Functions:**
  - `fullPage(page)` - Full page screenshot
  - `element(page, selector)` - Element screenshot
  - `uploadToS3(buffer)` - Upload to storage

---

### 5.2 Pre-defined Scenarios

- [ ] **Task 5.2.1:** Donation Flow Test
  **File:** `services/browser-service/src/scenarios/donation-flow.ts`
  **Function:** `testDonationFlow(page, amount)` - Test donation UI

- [ ] **Task 5.2.2:** Auth Flow Test
  **File:** `services/browser-service/src/scenarios/auth-flow.ts`
  **Function:** `testAuthFlow(page, credentials)` - Test login/signup

- [ ] **Task 5.2.3:** Navigation Test
  **File:** `services/browser-service/src/scenarios/navigation.ts`
  **Function:** `testNavigation(page, routes)` - Test routing

---

### 5.3 API Server

- [ ] **Task 5.3.1:** Express Server
  **File:** `services/browser-service/src/server.ts`
  **Routes:**
  - `POST /api/v1/browser/test` - Run test
  - `POST /api/v1/browser/screenshot` - Capture screenshot
  - `POST /api/v1/browser/navigate` - Navigate and interact
  - `GET /health`
  **Port:** 3013

- [ ] **Task 5.3.2:** Package.json
  **Dependencies:** `express`, `playwright`, `@supabase/supabase-js`

- [ ] **Task 5.3.3:** Dockerfile
  **Note:** Must include Playwright browsers (`mcr.microsoft.com/playwright:v1.40.0`)

---

## 🔧 PHASE 6: CHROME DEVTOOLS MCP (30 min)

### 6.1 MCP Server

- [ ] **Task 6.1.1:** MCP Server Definition
  **File:** `services/chrome-devtools-mcp/mcp.json`
  **Content:** Tool definitions for network, performance, console, coverage

- [ ] **Task 6.1.2:** Network Tool
  **File:** `services/chrome-devtools-mcp/src/tools/network.ts`
  **Function:** `captureNetwork(url, filter)` - Capture network requests via CDP

- [ ] **Task 6.1.3:** Performance Tool
  **File:** `services/chrome-devtools-mcp/src/tools/performance.ts`
  **Function:** `measurePerformance(url, runs)` - Performance metrics

- [ ] **Task 6.1.4:** Console Tool
  **File:** `services/chrome-devtools-mcp/src/tools/console.ts`
  **Function:** `captureConsole(url, levels)` - Console logs

- [ ] **Task 6.1.5:** Server
  **File:** `services/chrome-devtools-mcp/src/server.ts`
  **Port:** 3014

---

## 🔁 PHASE 7: INFINITE AGENTIC LOOP (1 hour)

### 7.1 Wave Generator

- [ ] **Task 7.1.1:** Wave Generator
  **File:** `services/infinite-loop/src/wave-generator.ts`
  **Class:** `WaveGenerator`
  **Methods:**
  - `generateWave(spec, waveNumber, previousResults)`
  - `generateDirectives(spec, previousResults)`
  - `mutateStack(stack, index)`

---

### 7.2 Variant Creator

- [ ] **Task 7.2.1:** Variant Creator
  **File:** `services/infinite-loop/src/variant-creator.ts`
  **Class:** `VariantCreator`
  **Methods:**
  - `createVariant(directive)` - Generate code for directive
  - `scaffoldProject(directive)` - Create file structure
  - `installDependencies(path)` - npm install

---

### 7.3 Evaluator

- [ ] **Task 7.3.1:** Evaluator
  **File:** `services/infinite-loop/src/evaluator.ts`
  **Class:** `VariantEvaluator`
  **Methods:**
  - `evaluate(variant)` - Score variant (tests, performance, quality, size)
  - `runTests(code)` - Execute tests
  - `runLighthouse(url)` - Performance test
  - `analyzeCode(code)` - Code quality (ESLint, TypeScript)
  - `analyzeBundleSize(code)` - Bundle size

---

### 7.4 Spec Refiner

- [ ] **Task 7.4.1:** Spec Refiner
  **File:** `services/infinite-loop/src/spec-refiner.ts`
  **Class:** `SpecificationRefiner`
  **Methods:**
  - `refine(originalSpec, results)` - Refine spec based on top performers
  - `extractPatterns(results)` - Find commonalities
  - `callGPT4(prompt)` - Use GPT-4 to refine

---

### 7.5 Server

- [ ] **Task 7.5.1:** Express Server
  **File:** `services/infinite-loop/src/server.ts`
  **Routes:**
  - `POST /api/v1/loop/start` - Start infinite loop
  - `GET /api/v1/loop/status/:loopId` - Check status
  - `POST /api/v1/loop/stop/:loopId` - Stop loop
  - `GET /health`
  **Port:** 3015

---

## 🎨 PHASE 8: COCKPIT UI (1-2 hours)

### 8.1 Layout & Navigation

- [ ] **Task 8.1.1:** Cockpit Layout
  **File:** `apps/web/src/app/(platform)/cockpit/layout.tsx`
  **Content:** Shared layout with sidebar navigation
  **Links:** Dashboard, Agents, Observability, Services

- [ ] **Task 8.1.2:** Cockpit Header
  **File:** `apps/web/src/components/cockpit/CockpitHeader.tsx`
  **Component:** Header with logo, navigation, voice button, settings

---

### 8.2 Dashboard Page

- [ ] **Task 8.2.1:** Dashboard Page
  **File:** `apps/web/src/app/(platform)/cockpit/dashboard/page.tsx`
  **Sections:**
  - Hero: "Stellar Agentic Cockpit"
  - Agent Grid (6 agents)
  - Recent Activity Feed
  - Services Panel

- [ ] **Task 8.2.2:** AgentCard Component
  **File:** `apps/web/src/components/cockpit/AgentCard.tsx`
  **Props:** `agent: { name, displayName, type, status, lastAction }`
  **Features:** Status indicator, cosmic icon, click to view details

- [ ] **Task 8.2.3:** ActivityFeed Component
  **File:** `apps/web/src/components/cockpit/ActivityFeed.tsx`
  **Props:** `activities: Activity[]`
  **Features:** Scrollable list, agent icons, timestamps

- [ ] **Task 8.2.4:** ServicesPanel Component
  **File:** `apps/web/src/components/cockpit/ServicesPanel.tsx`
  **Props:** `services: Service[]`
  **Features:** Health indicators (green/yellow/red), start/stop buttons

---

### 8.3 Agent Detail Page

- [ ] **Task 8.3.1:** Agent Detail Page
  **File:** `apps/web/src/app/(platform)/cockpit/agents/[agentName]/page.tsx`
  **Sections:**
  - Agent Header (name, type, status)
  - Sessions List (recent 20)
  - Agent Stats (success rate, avg response time, tokens used)
  - Live Logs

- [ ] **Task 8.3.2:** AgentHeader Component
  **File:** `apps/web/src/components/cockpit/AgentHeader.tsx`

- [ ] **Task 8.3.3:** SessionsList Component
  **File:** `apps/web/src/components/cockpit/SessionsList.tsx`

- [ ] **Task 8.3.4:** AgentStats Component
  **File:** `apps/web/src/components/cockpit/AgentStats.tsx`

---

### 8.4 Observability Page

- [ ] **Task 8.4.1:** Observability Page
  **File:** `apps/web/src/app/(platform)/cockpit/observability/page.tsx`
  **Features:**
  - Real-time log streaming (Supabase subscription)
  - Filters (agent, log level, time range)
  - Search logs
  - Export logs (CSV/JSON)

- [ ] **Task 8.4.2:** LiveLogsViewer Component
  **File:** `apps/web/src/components/cockpit/LiveLogsViewer.tsx`
  **Uses:** `useRealtimeLogs()` hook
  **Features:** Auto-scroll, color-coded levels, expandable entries

- [ ] **Task 8.4.3:** LogEntry Component
  **File:** `apps/web/src/components/cockpit/LogEntry.tsx`
  **Props:** `log: AgentLog`
  **Display:** Timestamp, agent, level, message, metadata (collapsible)

- [ ] **Task 8.4.4:** LogFilters Component
  **File:** `apps/web/src/components/cockpit/LogFilters.tsx`

---

### 8.5 Voice Command Button

- [ ] **Task 8.5.1:** VoiceCommandButton Component
  **File:** `apps/web/src/components/cockpit/VoiceCommandButton.tsx`
  **Features:**
  - Push-to-talk (hold button)
  - Visual feedback (listening, processing, responding)
  - Waveform animation
  - Transcript display
  - Play response audio
  **Position:** Fixed bottom-right corner (global)

- [ ] **Task 8.5.2:** Add to Layout
  **File:** `apps/web/src/app/(platform)/cockpit/layout.tsx`
  **Code:** `<VoiceCommandButton />` at end of layout

---

### 8.6 Donation Feed Widget

- [ ] **Task 8.6.1:** DonationFeedWidget Component
  **File:** `apps/web/src/components/cockpit/DonationFeedWidget.tsx`
  **Features:**
  - Subscribe to `donations_feed` table (Supabase real-time)
  - Display recent 10 donations
  - Auto-scroll on new donation
  - Cosmic animation on donation received

---

### 8.7 Custom Hooks

- [ ] **Task 8.7.1:** useAgents Hook
  **File:** `apps/web/src/hooks/useAgents.ts`
  **Query:** Fetch all agents from Supabase

- [ ] **Task 8.7.2:** useAgent Hook
  **File:** `apps/web/src/hooks/useAgent.ts`
  **Query:** Fetch single agent by name

- [ ] **Task 8.7.3:** useAgentSessions Hook
  **File:** `apps/web/src/hooks/useAgentSessions.ts`
  **Query:** Fetch sessions for specific agent

- [ ] **Task 8.7.4:** useAgentLogs Hook
  **File:** `apps/web/src/hooks/useAgentLogs.ts`
  **Query:** Fetch logs for specific agent

- [ ] **Task 8.7.5:** useRealtimeLogs Hook
  **File:** `apps/web/src/hooks/useRealtimeLogs.ts`
  **Subscription:** Real-time logs via Supabase

- [ ] **Task 8.7.6:** useRecentActivity Hook
  **File:** `apps/web/src/hooks/useRecentActivity.ts`
  **Query:** Fetch recent agent actions (from sessions table)

- [ ] **Task 8.7.7:** useServices Hook
  **File:** `apps/web/src/hooks/useServices.ts`
  **Query:** Fetch all services with health status

- [ ] **Task 8.7.8:** useVoiceCommand Hook
  **File:** `apps/web/src/hooks/useVoiceCommand.ts`
  **Functions:** `startRecording`, `stopRecording`, `sendToAPI`

---

### 8.8 API Routes

- [ ] **Task 8.8.1:** Voice Command API Route
  **File:** `apps/web/src/app/api/voice/command/route.ts`
  **Method:** POST
  **Input:** FormData with audio file
  **Output:** `{ transcript, response: { text, audio_url } }`
  **Process:** Upload audio → Call Cassiopeia → Return transcript + synthesized response

---

## 📝 PHASE 9: DOCUMENTATION (1 hour)

### 9.1 Agent Documentation

- [ ] **Task 9.1.1:** Sirius.md
  **File:** `docs/agents/sirius.md`
  **Content:** Capabilities, usage examples, API, configuration

- [ ] **Task 9.1.2:** Andromeda.md
  **File:** `docs/agents/andromeda.md`

- [ ] **Task 9.1.3:** Vega.md
  **File:** `docs/agents/vega.md`

- [ ] **Task 9.1.4:** Rigel.md
  **File:** `docs/agents/rigel.md`

- [ ] **Task 9.1.5:** Cassiopeia.md
  **File:** `docs/agents/cassiopeia.md`

- [ ] **Task 9.1.6:** Betelgeuse.md
  **File:** `docs/agents/betelgeuse.md`

---

### 9.2 Service Documentation

- [ ] **Task 9.2.1:** Big-3 Orchestrator.md
  **File:** `docs/services/big-3-orchestrator.md`

- [ ] **Task 9.2.2:** Browser Service.md
  **File:** `docs/services/browser-service.md`

- [ ] **Task 9.2.3:** Chrome DevTools MCP.md
  **File:** `docs/services/chrome-devtools-mcp.md`

- [ ] **Task 9.2.4:** Infinite Loop.md
  **File:** `docs/services/infinite-loop.md`

---

### 9.3 Tutorials (Strapi Content)

- [ ] **Task 9.3.1:** Getting Started Tutorial
  **File:** `docs/tutorials/getting-started.md`
  **Content:** How to use cockpit, voice commands, first agent invocation

- [ ] **Task 9.3.2:** Voice Commands Tutorial
  **File:** `docs/tutorials/voice-commands.md`
  **Content:** Complete guide to voice interaction with Cassiopeia

- [ ] **Task 9.3.3:** Browser Automation Tutorial
  **File:** `docs/tutorials/browser-automation.md`
  **Content:** Using Vega to test UIs

- [ ] **Task 9.3.4:** Infinite Loop Tutorial
  **File:** `docs/tutorials/infinite-loop.md`
  **Content:** Running variant generation and evaluation

---

### 9.4 Root Documentation

- [ ] **Task 9.4.1:** Update README.md
  **File:** `README.md`
  **Sections:**
  - Project overview
  - Stellar Agents introduction
  - Quick start guide
  - Architecture diagram
  - Contributing guidelines

- [ ] **Task 9.4.2:** Create .env.example
  **File:** `.env.example`
  **Content:** All required environment variables with descriptions

---

## ✅ PHASE 10: TESTING & VALIDATION (1 hour)

### 10.1 Unit Tests

- [ ] **Task 10.1.1:** Sirius Planner Tests
  **File:** `services/stellar-agents/src/agents/sirius/__tests__/planner.test.ts`
  **Tests:** Task decomposition, agent assignment, complexity estimation

- [ ] **Task 10.1.2:** Andromeda Code Generator Tests
  **File:** `services/stellar-agents/src/agents/andromeda/__tests__/code-generator.test.ts`
  **Tests:** Component generation, API route generation, test generation

- [ ] **Task 10.1.3:** Cassiopeia Command Router Tests
  **File:** `services/stellar-agents/src/agents/cassiopeia/__tests__/command-router.test.ts`
  **Tests:** Command parsing, agent identification, dispatch

---

### 10.2 Integration Tests

- [ ] **Task 10.2.1:** Voice Command End-to-End Test
  **File:** `services/stellar-agents/__tests__/integration/voice-command.test.ts`
  **Test:** Mock voice input → Cassiopeia → Sirius → Response

- [ ] **Task 10.2.2:** Browser Automation Integration Test
  **File:** `services/browser-service/__tests__/integration/donation-flow.test.ts`
  **Test:** Run full donation flow test scenario

---

### 10.3 E2E Tests (Playwright)

- [ ] **Task 10.3.1:** Cockpit Dashboard E2E
  **File:** `apps/web/tests/cockpit-dashboard.spec.ts`
  **Test:** Navigate to dashboard, verify all 6 agents visible

- [ ] **Task 10.3.2:** Voice Command E2E
  **File:** `apps/web/tests/voice-command.spec.ts`
  **Test:** Click voice button, send command, verify response

---

### 10.4 Validation Checklist

- [ ] **Task 10.4.1:** Run All Services
  ```bash
  # Start all services and verify health
  cd services/stellar-agents && yarn dev
  cd services/big-3-orchestrator && yarn dev
  cd services/browser-service && yarn dev
  cd services/chrome-devtools-mcp && yarn dev
  cd services/infinite-loop && yarn dev
  cd apps/web && yarn dev
  ```

- [ ] **Task 10.4.2:** Database Check
  ```sql
  SELECT * FROM agents;  -- Should return 6 rows
  SELECT * FROM services;  -- Should return 5+ rows
  ```

- [ ] **Task 10.4.3:** Health Checks
  ```bash
  curl http://localhost:3004/health  # Stellar Agents
  curl http://localhost:3010/health  # Big-3
  curl http://localhost:3013/health  # Browser
  curl http://localhost:3014/health  # Chrome DevTools
  curl http://localhost:3015/health  # Infinite Loop
  ```

- [ ] **Task 10.4.4:** TypeScript Compilation
  ```bash
  yarn build  # Should compile with 0 errors
  ```

- [ ] **Task 10.4.5:** Linting
  ```bash
  yarn lint  # Should pass
  ```

---

## 🚀 PHASE 11: DEPLOYMENT PREP (30 min)

### 11.1 Environment Variables

- [ ] **Task 11.1.1:** Vercel Environment Variables
  **Location:** Vercel Dashboard → Project Settings → Environment Variables
  **Add:** All variables from `.env.example`
  **Environments:** Production, Preview, Development

- [ ] **Task 11.1.2:** Railway Environment Variables
  **For each service:** Add API keys and Supabase credentials

---

### 11.2 Docker Images

- [ ] **Task 11.2.1:** Build Stellar Agents Image
  ```bash
  cd services/stellar-agents
  docker build -t newworldkids/stellar-agents:latest .
  ```

- [ ] **Task 11.2.2:** Build Big-3 Image
- [ ] **Task 11.2.3:** Build Browser Service Image
- [ ] **Task 11.2.4:** Build Chrome DevTools Image
- [ ] **Task 11.2.5:** Build Infinite Loop Image

---

### 11.3 Database Migration

- [ ] **Task 11.3.1:** Verify Migration Applied
  **Check:** All 14 tables exist in Supabase
  **Check:** Seed data present (6 agents, 5 services, 4 tutorials)

- [ ] **Task 11.3.2:** Configure Backups
  **Supabase:** Enable daily automated backups

---

## ✨ FINAL CHECKLIST

Before marking DONE:

### Functionality
- [ ] All 6 stellar agents can execute tasks
- [ ] Voice commands route to correct agents
- [ ] Dashboard loads with real-time data
- [ ] Browser automation tests pass
- [ ] Big-3 orchestrator coordinates agents
- [ ] Infinite loop generates and evaluates variants

### Quality
- [ ] Zero TypeScript errors
- [ ] All tests pass
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Accessibility (WCAG 2.1 AA) compliant

### Documentation
- [ ] All agent docs complete
- [ ] All service docs complete
- [ ] 4+ tutorials written
- [ ] README.md updated
- [ ] .env.example created

### Deployment
- [ ] Environment variables configured
- [ ] All services deployed
- [ ] Health checks passing
- [ ] Database migration applied
- [ ] Monitoring configured

---

## 📊 PROGRESS TRACKING

Use this checklist to track your progress:

```
Foundation:       [    ] 0/13 tasks
Stellar Agents:   [    ] 0/30 tasks
Voice:            [    ] 0/7 tasks
Big-3:            [    ] 0/13 tasks
Browser:          [    ] 0/11 tasks
Chrome DevTools:  [    ] 0/5 tasks
Infinite Loop:    [    ] 0/10 tasks
Cockpit UI:       [    ] 0/25 tasks
Documentation:    [    ] 0/11 tasks
Testing:          [    ] 0/10 tasks
Deployment:       [    ] 0/8 tasks

TOTAL:            [    ] 0/150+ tasks
```

---

**YOU'RE READY TO BUILD! FOLLOW THIS CHECKLIST SEQUENTIALLY.**

**Estimated Completion:** 4-8 hours with GPT-5-Codex adaptive reasoning

**Good luck! 🚀🌟✨**
