// ============================================================================
// INDIGO - THE NAVIGATOR (Orchestrator Agent)
// "Guiding the path forward"
// ============================================================================

import OpenAI from 'openai';
import { BaseAgent } from '../../base/BaseAgent';
import type { Task, AgentResult, Plan, PlanStep, SubTask, OrchestrationResult } from '../../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class IndigoAgent extends BaseAgent {
  private availableAgents: string[] = [
    'mari',    // Coder
    'azul',    // Validator
    'beyond',  // Researcher
    'duo',     // Voice
    'neo',     // Builder
  ];

  /**
   * Main execution method
   */
  async execute(task: Task): Promise<AgentResult> {
    const sessionId = await this.createSession('orchestration', task, task.userId);

    try {
      await this.logInfo(sessionId, `Orchestrating task: ${task.description}`);

      // Route based on task type
      switch (task.type) {
        case 'plan_feature':
          return await this.planFeature(sessionId, task);
        case 'decompose_task':
          return await this.decomposeTask(sessionId, task);
        case 'orchestrate':
          return await this.orchestrateWorkflow(sessionId, task);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      await this.logError(sessionId, 'Execution failed', error);
      await this.completeSession(sessionId, null, 0, 'failed', this.formatError(error));
      return {
        success: false,
        output: null,
        error: this.formatError(error),
      };
    }
  }

  /**
   * Plan a feature from description
   */
  private async planFeature(sessionId: string, task: Task): Promise<AgentResult> {
    const description = task.parameters?.description || task.description;

    await this.logInfo(sessionId, 'Creating feature plan', `Analyzing requirements for: ${description}`);

    const prompt = `You are Indigo, an AI orchestrator for a software development team.

Task: Create a detailed implementation plan for this feature:
"${description}"

Available agents you can assign work to:
- Mari (Coder): Code generation, refactoring, debugging
- Azul (Validator): UI testing, visual regression, accessibility
- Beyond (Researcher): Web research, documentation, API discovery
- Duo (Voice): Voice interactions, TTS, natural language
- Neo (Builder): Deployments, CI/CD, infrastructure

Return a JSON plan with this structure:
{
  "goal": "Clear description of what we're building",
  "steps": [
    {
      "id": "step_1",
      "description": "What needs to be done",
      "assignedAgent": "mari",
      "type": "coding|testing|research|deployment",
      "inputs": {},
      "outputs": ["expected output"],
      "estimatedTime": "15 minutes"
    }
  ],
  "dependencies": {
    "step_2": ["step_1"]
  },
  "estimatedTotalTime": "2 hours"
}

Focus on creating a logical sequence that delivers value incrementally.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const planText = response.choices[0].message.content || '{}';
    const plan = this.safeJsonParse(planText, { goal: '', steps: [], estimatedTotalTime: 'unknown' });

    const tokensUsed = response.usage?.total_tokens || 0;

    await this.logInfo(
      sessionId,
      `Created plan with ${plan.steps?.length || 0} steps`,
      `Estimated completion: ${plan.estimatedTotalTime || 'unknown'}`
    );

    await this.completeSession(sessionId, plan, tokensUsed);

    return {
      success: true,
      output: plan,
      tokensUsed,
    };
  }

  /**
   * Decompose a large task into subtasks
   */
  private async decomposeTask(sessionId: string, task: Task): Promise<AgentResult> {
    const taskDescription = task.parameters?.task || task.description;

    await this.logInfo(sessionId, 'Decomposing task into subtasks');

    const prompt = `Break down this task into smaller, actionable subtasks:
"${taskDescription}"

Return a JSON array of subtasks:
[
  {
    "description": "Clear, specific action",
    "assignedAgent": "agent_name",
    "priority": 1,
    "dependencies": []
  }
]

Keep subtasks small (10-30 minutes each). Assign to the most appropriate agent.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    const resultText = response.choices[0].message.content || '{"subtasks":[]}';
    const result = this.safeJsonParse(resultText, { subtasks: [] });
    const subtasks = result.subtasks || [];

    const tokensUsed = response.usage?.total_tokens || 0;

    await this.logInfo(sessionId, `Decomposed into ${subtasks.length} subtasks`);
    await this.completeSession(sessionId, subtasks, tokensUsed);

    return {
      success: true,
      output: subtasks,
      tokensUsed,
    };
  }

  /**
   * Orchestrate a multi-agent workflow
   */
  private async orchestrateWorkflow(sessionId: string, task: Task): Promise<AgentResult> {
    const plan = task.parameters?.plan as Plan;

    if (!plan || !plan.steps) {
      throw new Error('Invalid plan: missing steps');
    }

    await this.logInfo(sessionId, `Orchestrating workflow with ${plan.steps.length} steps`);

    const results: Record<string, AgentResult> = {};
    const timeline: any[] = [];
    let totalTokens = 0;

    // Execute steps (simplified - sequential for MVP)
    for (const step of plan.steps) {
      const stepStart = new Date();

      await this.logInfo(
        sessionId,
        `Executing step: ${step.id}`,
        `Assigned to: ${step.assignedAgent}`
      );

      timeline.push({
        timestamp: stepStart,
        agentName: step.assignedAgent,
        action: step.description,
        status: 'started',
      });

      // In real implementation, we'd call the actual agent here
      // For MVP, we simulate success
      const stepResult: AgentResult = {
        success: true,
        output: { message: `Step ${step.id} completed successfully` },
        tokensUsed: 100, // Placeholder
      };

      results[step.id] = stepResult;
      totalTokens += stepResult.tokensUsed || 0;

      timeline.push({
        timestamp: new Date(),
        agentName: step.assignedAgent,
        action: step.description,
        status: 'completed',
        details: stepResult,
      });

      await this.logInfo(sessionId, `Step ${step.id} completed`);
    }

    const orchestrationResult: OrchestrationResult = {
      planId: plan.id,
      status: 'success',
      results,
      timeline,
    };

    await this.completeSession(sessionId, orchestrationResult, totalTokens);

    return {
      success: true,
      output: orchestrationResult,
      tokensUsed: totalTokens,
    };
  }

  /**
   * Assign the best agent for a task type
   */
  private selectAgent(taskType: string): string {
    const mapping: Record<string, string> = {
      coding: 'mari',
      testing: 'azul',
      research: 'beyond',
      voice: 'duo',
      deployment: 'neo',
      infrastructure: 'neo',
    };

    return mapping[taskType] || 'mari';
  }
}
