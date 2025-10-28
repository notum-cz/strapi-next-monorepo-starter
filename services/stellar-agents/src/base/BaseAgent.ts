// ============================================================================
// BASE AGENT CLASS
// All Stellar Agents extend this class
// ============================================================================

import {
  getAgent,
  updateAgentStatus,
  createSession,
  completeSession,
  logAction,
  calculateCost,
} from '../config/supabase';
import type {
  Task,
  AgentResult,
  AgentAction,
  AgentConfig,
  AgentType,
  LogLevel,
} from '../types';

export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected displayName: string;
  protected type: AgentType;
  protected description?: string;
  protected capabilities: string[];
  protected modelConfig: any;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.displayName = config.displayName;
    this.type = config.type;
    this.description = config.description;
    this.capabilities = config.capabilities || [];
    this.modelConfig = config.modelConfig || {};
  }

  // ============================================================================
  // ABSTRACT METHODS (Must be implemented by subclasses)
  // ============================================================================

  /**
   * Execute a task - MUST be implemented by each agent
   */
  abstract execute(task: Task): Promise<AgentResult>;

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Create a new session for this agent
   */
  protected async createSession(type: string, inputData: any, userId?: string): Promise<string> {
    await this.setStatus('active');

    const sessionId = await createSession({
      agent_id: this.id,
      user_id: userId,
      session_type: type,
      input_data: inputData,
    });

    await this.log(sessionId, 'info', `Started ${type} session`, undefined, 'Session initialized');

    return sessionId;
  }

  /**
   * Complete a session with results
   */
  protected async completeSession(
    sessionId: string,
    output: any,
    tokens: number,
    status: 'completed' | 'failed' | 'cancelled' = 'completed',
    error?: string
  ): Promise<void> {
    const cost = calculateCost(
      this.modelConfig.provider || 'unknown',
      this.modelConfig.model || 'unknown',
      tokens
    );

    await completeSession(sessionId, {
      output_data: output,
      tokens_used: tokens,
      cost_usd: cost,
      status,
      error_message: error,
    });

    await this.log(
      sessionId,
      status === 'completed' ? 'info' : 'error',
      `Session ${status}`,
      undefined,
      `Total tokens: ${tokens}, Cost: $${cost.toFixed(6)}`
    );

    await this.setStatus('idle');
  }

  // ============================================================================
  // LOGGING & OBSERVABILITY
  // ============================================================================

  /**
   * Log an action or event
   */
  protected async log(
    sessionId: string,
    level: LogLevel,
    message: string,
    toolCall?: string,
    thoughtProcess?: string,
    metadata?: any
  ): Promise<void> {
    await logAction({
      session_id: sessionId,
      agent_id: this.id,
      log_level: level,
      message,
      tool_call: toolCall,
      thought_process: thoughtProcess,
      metadata,
    });

    // Also log to console for development
    const prefix = `[${this.displayName}] [${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`, thoughtProcess ? `\n  Thought: ${thoughtProcess}` : '');
  }

  /**
   * Log debug information
   */
  protected async logDebug(sessionId: string, message: string, metadata?: any): Promise<void> {
    await this.log(sessionId, 'debug', message, undefined, undefined, metadata);
  }

  /**
   * Log info message
   */
  protected async logInfo(sessionId: string, message: string, thought?: string): Promise<void> {
    await this.log(sessionId, 'info', message, undefined, thought);
  }

  /**
   * Log warning
   */
  protected async logWarn(sessionId: string, message: string, thought?: string): Promise<void> {
    await this.log(sessionId, 'warn', message, undefined, thought);
  }

  /**
   * Log error
   */
  protected async logError(sessionId: string, message: string, error?: any): Promise<void> {
    await this.log(sessionId, 'error', message, undefined, error?.message || String(error));
  }

  /**
   * Log tool call
   */
  protected async logToolCall(
    sessionId: string,
    toolName: string,
    parameters: any,
    result?: any
  ): Promise<void> {
    await this.log(
      sessionId,
      'info',
      `Tool call: ${toolName}`,
      JSON.stringify({ tool: toolName, parameters }),
      `Tool ${toolName} executed`,
      { result }
    );
  }

  // ============================================================================
  // STATUS MANAGEMENT
  // ============================================================================

  /**
   * Update agent status
   */
  protected async setStatus(status: 'idle' | 'active' | 'busy' | 'error' | 'offline'): Promise<void> {
    await updateAgentStatus(this.id, status);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Validate task parameters against required fields
   */
  protected validateTask(task: Task, requiredFields: string[]): void {
    const missing = requiredFields.filter(
      (field) => !(task.parameters && task.parameters[field])
    );

    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
  }

  /**
   * Estimate tokens for text (rough approximation)
   */
  protected estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Safe JSON parse with fallback
   */
  protected safeJsonParse<T = any>(json: string, fallback: T): T {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  }

  /**
   * Format error for logging
   */
  protected formatError(error: any): string {
    if (error instanceof Error) {
      return `${error.message}\n${error.stack || ''}`;
    }
    return String(error);
  }

  /**
   * Sleep utility for rate limiting
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================================
  // PUBLIC GETTERS
  // ============================================================================

  public getName(): string {
    return this.name;
  }

  public getDisplayName(): string {
    return this.displayName;
  }

  public getType(): AgentType {
    return this.type;
  }

  public getCapabilities(): string[] {
    return this.capabilities;
  }

  public getDescription(): string {
    return this.description || '';
  }

  /**
   * Get agent info (for API responses)
   */
  public getInfo() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      type: this.type,
      description: this.description,
      capabilities: this.capabilities,
    };
  }
}
