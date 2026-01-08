// ============================================================================
// MARI - THE CODER
// "Master architect of code"
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';
import { BaseAgent } from '../../base/BaseAgent';
import type { Task, AgentResult, CodeRequest, CodeResult } from '../../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class MariAgent extends BaseAgent {
  /**
   * Main execution method
   */
  async execute(task: Task): Promise<AgentResult> {
    const sessionId = await this.createSession('coding', task, task.userId);

    try {
      await this.logInfo(sessionId, `Coding task: ${task.description}`);

      // Route based on task type
      switch (task.type) {
        case 'generate_code':
          return await this.generateCode(sessionId, task);
        case 'refactor':
          return await this.refactor(sessionId, task);
        case 'debug':
          return await this.debug(sessionId, task);
        case 'review':
          return await this.reviewCode(sessionId, task);
        case 'generate_tests':
          return await this.generateTests(sessionId, task);
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
   * Generate code from description
   */
  private async generateCode(sessionId: string, task: Task): Promise<AgentResult> {
    const request: CodeRequest = {
      description: task.parameters?.description || task.description,
      language: task.parameters?.language || 'typescript',
      framework: task.parameters?.framework,
      context: task.parameters?.context,
    };

    await this.logInfo(
      sessionId,
      'Generating code',
      `Language: ${request.language}, Framework: ${request.framework || 'none'}`
    );

    const prompt = `Generate production-ready ${request.language} code for this requirement:

${request.description}

${request.framework ? `Framework: ${request.framework}` : ''}
${request.context ? `Context:\n${request.context}` : ''}

Requirements:
- Write clean, maintainable code
- Include TypeScript types if applicable
- Add brief inline comments
- Follow best practices
- Handle errors appropriately

Return JSON:
{
  "code": "// Your code here",
  "explanation": "Brief explanation of the approach",
  "tests": "// Optional test code",
  "suggestions": ["Additional improvements you'd recommend"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const contentBlock = response.content[0];
    const resultText = contentBlock.type === 'text' ? contentBlock.text : '{}';

    // Extract JSON from markdown if present
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || resultText.match(/{[\s\S]*}/);
    const result: CodeResult = this.safeJsonParse(
      jsonMatch ? jsonMatch[1] || jsonMatch[0] : resultText,
      { code: '', language: request.language }
    );

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    await this.logInfo(
      sessionId,
      'Code generated successfully',
      `Generated ${result.code?.length || 0} characters of code`
    );

    await this.logToolCall(sessionId, 'claude-3-5-sonnet', request, {
      codeLength: result.code?.length,
    });

    await this.completeSession(sessionId, result, tokensUsed);

    return {
      success: true,
      output: result,
      tokensUsed,
    };
  }

  /**
   * Refactor existing code
   */
  private async refactor(sessionId: string, task: Task): Promise<AgentResult> {
    const code = task.parameters?.code || '';
    const goal = task.parameters?.goal || 'improve code quality';

    await this.logInfo(sessionId, `Refactoring code: ${goal}`);

    const prompt = `Refactor this code to ${goal}:

\`\`\`
${code}
\`\`\`

Return JSON:
{
  "code": "// Refactored code",
  "explanation": "What changed and why",
  "improvements": ["List of improvements made"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    const contentBlock = response.content[0];
    const resultText = contentBlock.type === 'text' ? contentBlock.text : '{}';
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || resultText.match(/{[\s\S]*}/);
    const result = this.safeJsonParse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : resultText, { code: '' });

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    await this.logInfo(sessionId, 'Code refactored successfully');
    await this.completeSession(sessionId, result, tokensUsed);

    return {
      success: true,
      output: result,
      tokensUsed,
    };
  }

  /**
   * Debug code and find issues
   */
  private async debug(sessionId: string, task: Task): Promise<AgentResult> {
    const code = task.parameters?.code || '';
    const error = task.parameters?.error || '';
    const description = task.parameters?.description || task.description;

    await this.logInfo(sessionId, `Debugging: ${description}`);

    const prompt = `Debug this code:

${description}

Code:
\`\`\`
${code}
\`\`\`

${error ? `Error:\n${error}` : ''}

Find the issue and provide a fix. Return JSON:
{
  "issue": "Description of the problem",
  "fix": "// Fixed code",
  "explanation": "Why it was broken and how the fix works"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    const contentBlock = response.content[0];
    const resultText = contentBlock.type === 'text' ? contentBlock.text : '{}';
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || resultText.match(/{[\s\S]*}/);
    const result = this.safeJsonParse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : resultText, { issue: '', fix: '' });

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    await this.logInfo(sessionId, `Issue found: ${result.issue}`);
    await this.completeSession(sessionId, result, tokensUsed);

    return {
      success: true,
      output: result,
      tokensUsed,
    };
  }

  /**
   * Review code for quality and issues
   */
  private async reviewCode(sessionId: string, task: Task): Promise<AgentResult> {
    const code = task.parameters?.code || '';

    await this.logInfo(sessionId, 'Reviewing code');

    const prompt = `Review this code for quality, security, and best practices:

\`\`\`
${code}
\`\`\`

Return JSON:
{
  "overallScore": 85,
  "issues": [
    {"severity": "high|medium|low", "description": "Issue description", "line": 10}
  ],
  "suggestions": ["Improvement suggestions"],
  "summary": "Overall assessment"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    const contentBlock = response.content[0];
    const resultText = contentBlock.type === 'text' ? contentBlock.text : '{}';
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || resultText.match(/{[\s\S]*}/);
    const result = this.safeJsonParse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : resultText, { overallScore: 0, issues: [] });

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    await this.logInfo(sessionId, `Review complete: Score ${result.overallScore}/100`);
    await this.completeSession(sessionId, result, tokensUsed);

    return {
      success: true,
      output: result,
      tokensUsed,
    };
  }

  /**
   * Generate tests for code
   */
  private async generateTests(sessionId: string, task: Task): Promise<AgentResult> {
    const code = task.parameters?.code || '';
    const framework = task.parameters?.testFramework || 'jest';

    await this.logInfo(sessionId, `Generating ${framework} tests`);

    const prompt = `Generate comprehensive ${framework} tests for this code:

\`\`\`
${code}
\`\`\`

Cover:
- Happy path
- Edge cases
- Error handling

Return JSON:
{
  "tests": "// Test code",
  "coverage": ["What's tested"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const contentBlock = response.content[0];
    const resultText = contentBlock.type === 'text' ? contentBlock.text : '{}';
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || resultText.match(/{[\s\S]*}/);
    const result = this.safeJsonParse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : resultText, { tests: '', coverage: [] });

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    await this.logInfo(sessionId, 'Tests generated');
    await this.completeSession(sessionId, result, tokensUsed);

    return {
      success: true,
      output: result,
      tokensUsed,
    };
  }
}
