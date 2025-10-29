// ============================================================================
// BEYOND - THE RESEARCHER
// "Exploring beyond the known"
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAgent } from '../../base/BaseAgent';
import type { Task, AgentResult, ResearchRequest, ResearchResult } from '../../types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export class BeyondAgent extends BaseAgent {
  /**
   * Main execution method
   */
  async execute(task: Task): Promise<AgentResult> {
    const sessionId = await this.createSession('research', task, task.userId);

    try {
      await this.logInfo(sessionId, `Research task: ${task.description}`);

      switch (task.type) {
        case 'research':
          return await this.research(sessionId, task);
        case 'find_apis':
          return await this.findAPIs(sessionId, task);
        case 'competitive_analysis':
          return await this.competitiveAnalysis(sessionId, task);
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
   * Perform web research
   */
  private async research(sessionId: string, task: Task): Promise<AgentResult> {
    const query = task.parameters?.query || task.description;
    const depth = task.parameters?.depth || 'normal';

    await this.logInfo(sessionId, `Researching: ${query}`, `Depth: ${depth}`);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    const prompt = `Research this topic and provide a comprehensive summary:
"${query}"

Include:
- Key findings (3-5 bullet points)
- Important details and context
- Relevant examples or case studies
- Current trends or best practices
- Sources (if available)

Format as JSON:
{
  "summary": "Brief overview (2-3 sentences)",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "details": "Detailed explanation with context",
  "examples": ["Example 1", "Example 2"],
  "sources": [
    {"title": "Source name", "url": "https://...", "snippet": "Key quote"}
  ],
  "confidence": 0.85
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    const researchResult: ResearchResult = this.safeJsonParse(
      jsonMatch ? jsonMatch[1] || jsonMatch[0] : text,
      { summary: '', sources: [], keyFindings: [] }
    );

    const tokensUsed = this.estimateTokens(text);

    await this.logInfo(
      sessionId,
      'Research complete',
      `Found ${researchResult.keyFindings?.length || 0} key findings`
    );

    await this.completeSession(sessionId, researchResult, tokensUsed);

    return {
      success: true,
      output: researchResult,
      tokensUsed,
    };
  }

  /**
   * Find relevant APIs for a use case
   */
  private async findAPIs(sessionId: string, task: Task): Promise<AgentResult> {
    const useCase = task.parameters?.useCase || task.description;

    await this.logInfo(sessionId, `Finding APIs for: ${useCase}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Find the best APIs for this use case:
"${useCase}"

Return JSON:
{
  "recommendations": [
    {
      "name": "API Name",
      "description": "What it does",
      "pricing": "Free/Paid/Freemium",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1"],
      "documentation": "https://..."
    }
  ],
  "topPick": "API Name",
  "reasoning": "Why this is the best choice"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    const apiResult = this.safeJsonParse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : text, { recommendations: [] });

    const tokensUsed = this.estimateTokens(text);

    await this.logInfo(sessionId, `Found ${apiResult.recommendations?.length || 0} API options`);
    await this.completeSession(sessionId, apiResult, tokensUsed);

    return {
      success: true,
      output: apiResult,
      tokensUsed,
    };
  }

  /**
   * Competitive analysis
   */
  private async competitiveAnalysis(sessionId: string, task: Task): Promise<AgentResult> {
    const product = task.parameters?.product || task.description;
    const competitors = task.parameters?.competitors || [];

    await this.logInfo(sessionId, `Analyzing competition for: ${product}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Perform competitive analysis for:
Product: ${product}
${competitors.length > 0 ? `Competitors: ${competitors.join(', ')}` : ''}

Return JSON:
{
  "marketOverview": "Brief market summary",
  "competitors": [
    {
      "name": "Competitor name",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1"],
      "marketShare": "Estimated %",
      "pricing": "Pricing model"
    }
  ],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "threats": ["Threat 1"],
  "recommendation": "Strategic recommendation"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    const analysis = this.safeJsonParse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : text, { competitors: [] });

    const tokensUsed = this.estimateTokens(text);

    await this.logInfo(sessionId, 'Competitive analysis complete');
    await this.completeSession(sessionId, analysis, tokensUsed);

    return {
      success: true,
      output: analysis,
      tokensUsed,
    };
  }
}
