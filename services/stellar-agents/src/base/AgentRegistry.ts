// ============================================================================
// AGENT REGISTRY - Manages all Stellar Agents
// ============================================================================

import { getAgent } from '../config/supabase';
import { IndigoAgent } from '../agents/indigo';
import { MariAgent } from '../agents/mari';
import { AzulAgent } from '../agents/azul';
import { BeyondAgent } from '../agents/beyond';
import { DuoAgent } from '../agents/duo';
import { NeoAgent } from '../agents/neo';
import type { BaseAgent } from './BaseAgent';
import type { AgentConfig } from '../types';

export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();

  /**
   * Initialize all agents from database
   */
  async initialize(): Promise<void> {
    console.log('[AgentRegistry] Initializing agents...');

    const agentNames = ['indigo', 'mari', 'azul', 'beyond', 'duo', 'neo'];

    for (const name of agentNames) {
      try {
        const agentData = await getAgent(name);

        if (!agentData) {
          console.warn(`[AgentRegistry] Agent ${name} not found in database - skipping`);
          continue;
        }

        const config: AgentConfig = {
          id: agentData.id,
          name: agentData.name,
          displayName: agentData.display_name,
          type: agentData.type,
          description: agentData.description || undefined,
          capabilities: Array.isArray(agentData.capabilities) ? agentData.capabilities : [],
          modelConfig: agentData.model_config || undefined,
        };

        const agent = this.createAgent(name, config);

        if (agent) {
          this.agents.set(name, agent);
          console.log(`[AgentRegistry] ✓ Initialized ${agentData.display_name}`);
        }
      } catch (error) {
        console.error(`[AgentRegistry] Failed to initialize ${name}:`, error);
      }
    }

    console.log(`[AgentRegistry] Initialized ${this.agents.size} agents`);
  }

  /**
   * Create agent instance based on name
   */
  private createAgent(name: string, config: AgentConfig): BaseAgent | null {
    switch (name) {
      case 'indigo':
        return new IndigoAgent(config);
      case 'mari':
        return new MariAgent(config);
      case 'azul':
        return new AzulAgent(config);
      case 'beyond':
        return new BeyondAgent(config);
      case 'duo':
        return new DuoAgent(config);
      case 'neo':
        return new NeoAgent(config);
      default:
        console.warn(`[AgentRegistry] Unknown agent: ${name}`);
        return null;
    }
  }

  /**
   * Get agent by name
   */
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all agent names
   */
  getAllAgentNames(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get all agents info
   */
  getAllAgentsInfo() {
    return Array.from(this.agents.values()).map((agent) => agent.getInfo());
  }

  /**
   * Check if agent exists
   */
  hasAgent(name: string): boolean {
    return this.agents.has(name);
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry();
