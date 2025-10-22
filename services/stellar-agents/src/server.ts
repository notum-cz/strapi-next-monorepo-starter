// ============================================================================
// STELLAR AGENTS - EXPRESS SERVER
// Port: 3004
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agentRegistry } from './base/AgentRegistry';
import type { Task } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'stellar-agents',
    agents: agentRegistry.getAllAgentNames(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * List all agents
 */
app.get('/agents', (req, res) => {
  const agents = agentRegistry.getAllAgentsInfo();
  res.json({ agents });
});

/**
 * Get agent info
 */
app.get('/agents/:name', (req, res) => {
  const { name } = req.params;
  const agent = agentRegistry.getAgent(name);

  if (!agent) {
    return res.status(404).json({ error: `Agent "${name}" not found` });
  }

  res.json(agent.getInfo());
});

/**
 * Execute agent task
 */
app.post('/agents/:name/execute', async (req, res) => {
  const { name } = req.params;
  const task: Task = req.body;

  const agent = agentRegistry.getAgent(name);

  if (!agent) {
    return res.status(404).json({ error: `Agent "${name}" not found` });
  }

  try {
    console.log(`[Server] Executing task on ${name}:`, task.type);

    const result = await agent.execute(task);

    res.json({
      success: result.success,
      output: result.output,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
      error: result.error,
    });
  } catch (error: any) {
    console.error(`[Server] Error executing task on ${name}:`, error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * Get agent capabilities
 */
app.get('/agents/:name/capabilities', (req, res) => {
  const { name } = req.params;
  const agent = agentRegistry.getAgent(name);

  if (!agent) {
    return res.status(404).json({ error: `Agent "${name}" not found` });
  }

  res.json({
    name: agent.getName(),
    displayName: agent.getDisplayName(),
    type: agent.getType(),
    capabilities: agent.getCapabilities(),
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

async function startServer() {
  try {
    console.log('🚀 Stellar Agents Service starting...');
    console.log('');

    // Initialize agents
    await agentRegistry.initialize();

    console.log('');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✨ Stellar Agents Service running on port ${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/health`);
      console.log(`🌟 Agents: http://localhost:${PORT}/agents`);
      console.log('');
      console.log('Available agents:');
      agentRegistry.getAllAgentNames().forEach((name) => {
        const agent = agentRegistry.getAgent(name);
        console.log(`  - ${agent?.getDisplayName()} (${name})`);
      });
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start Stellar Agents Service:', error);
    process.exit(1);
  }
}

startServer();
