/**
 * Auto-Onboard Runtime for DeepAgents
 * Watches docs/Agent-Cards and provides unified agent calling interface
 */

const fs = require('fs');
const path = require('path');

class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this.agentCardsPath = path.join(__dirname, '../../docs/Agent-Cards');
  }

  /**
   * Load all agent cards from the Agent-Cards directory
   */
  loadAgents() {
    try {
      const files = fs.readdirSync(this.agentCardsPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.agentCardsPath, file);
          const card = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          
          if (card.agentId) {
            this.agents.set(card.agentId, card);
            console.log(`✓ Registered agent: ${card.name} (${card.agentId})`);
          }
        }
      }
      
      console.log(`\n📦 Loaded ${this.agents.size} agents`);
    } catch (error) {
      console.error('Error loading agent cards:', error);
    }
  }

  /**
   * Get agent card by ID
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * List all available agents
   */
  listAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Validate agent inputs against card schema
   */
  validateInputs(agentId, inputs) {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const errors = [];

    // Check required inputs
    for (const [key, schema] of Object.entries(agent.inputs || {})) {
      if (schema.required && !(key in inputs)) {
        errors.push(`Missing required input: ${key}`);
      }

      // Type checking (basic)
      if (key in inputs && schema.type) {
        const actualType = Array.isArray(inputs[key]) ? 'array' : typeof inputs[key];
        if (actualType !== schema.type && schema.type !== 'object') {
          errors.push(`Invalid type for ${key}: expected ${schema.type}, got ${actualType}`);
        }
      }

      // Enum validation
      if (key in inputs && schema.enum && !schema.enum.includes(inputs[key])) {
        errors.push(`Invalid value for ${key}: must be one of [${schema.enum.join(', ')}]`);
      }
    }

    return errors;
  }
}

/**
 * Call an agent with payload
 * This is a skeleton - actual implementation would make HTTP requests to agent endpoints
 */
async function callAgent(agentId, payload) {
  const registry = new AgentRegistry();
  registry.loadAgents();

  const agent = registry.getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  // Validate inputs
  const errors = registry.validateInputs(agentId, payload);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Skeleton implementation - in production, this would:
  // 1. Make HTTP request to agent endpoint
  // 2. Handle authentication
  // 3. Process response
  // 4. Return formatted result

  console.log(`📡 Calling agent: ${agent.name}`);
  console.log(`   Payload:`, payload);

  return {
    agentId,
    status: 'success',
    message: 'Skeleton implementation - agent call would happen here',
    payload,
    timestamp: new Date().toISOString()
  };
}

/**
 * Watch agent cards directory for changes and reload
 */
function watchAgentCards(callback) {
  const registry = new AgentRegistry();
  
  fs.watch(registry.agentCardsPath, (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
      console.log(`\n🔄 Agent card changed: ${filename}`);
      registry.loadAgents();
      if (callback) callback(registry);
    }
  });

  return registry;
}

// Initialize and export
const registry = new AgentRegistry();
registry.loadAgents();

module.exports = {
  AgentRegistry,
  callAgent,
  watchAgentCards,
  registry
};

// CLI usage
if (require.main === module) {
  console.log('\n🤖 DeepAgents Auto-Onboard Runtime\n');
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list':
      console.log('Available agents:');
      registry.listAgents().forEach(agent => {
        console.log(`  - ${agent.name} (${agent.agentId}): ${agent.description}`);
      });
      break;

    case 'watch':
      console.log('👀 Watching for agent card changes...\n');
      watchAgentCards((updatedRegistry) => {
        console.log(`Updated registry with ${updatedRegistry.agents.size} agents`);
      });
      break;

    case 'call':
      const agentId = args[1];
      const payload = JSON.parse(args[2] || '{}');
      callAgent(agentId, payload)
        .then(result => console.log('Result:', result))
        .catch(err => console.error('Error:', err.message));
      break;

    default:
      console.log('Usage:');
      console.log('  node auto-onboard.js list                  - List all agents');
      console.log('  node auto-onboard.js watch                 - Watch for changes');
      console.log('  node auto-onboard.js call <id> <payload>   - Call an agent');
      console.log('\nExample:');
      console.log('  node auto-onboard.js call mixer-agent-v1 \'{"clock":"seattle-top-hour"}\'');
  }
}
