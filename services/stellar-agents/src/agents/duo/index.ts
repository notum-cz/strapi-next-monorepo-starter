// ============================================================================
// DUO - THE COMMUNICATOR (Voice Agent)
// "Voice of connection and understanding"
// ============================================================================

import OpenAI from 'openai';
import { BaseAgent } from '../../base/BaseAgent';
import type { Task, AgentResult, VoiceCommand, VoiceResponse } from '../../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class DuoAgent extends BaseAgent {
  /**
   * Main execution method
   */
  async execute(task: Task): Promise<AgentResult> {
    const sessionId = await this.createSession('voice', task, task.userId);

    try {
      await this.logInfo(sessionId, `Voice task: ${task.description}`);

      switch (task.type) {
        case 'transcribe':
          return await this.transcribeVoice(sessionId, task);
        case 'synthesize':
          return await this.synthesizeSpeech(sessionId, task);
        case 'handle_command':
          return await this.handleCommand(sessionId, task);
        case 'summarize':
          return await this.summarizeConversation(sessionId, task);
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
   * Transcribe voice to text
   */
  private async transcribeVoice(sessionId: string, task: Task): Promise<AgentResult> {
    const audioUrl = task.parameters?.audioUrl || '';

    await this.logInfo(sessionId, `Transcribing audio from: ${audioUrl}`);

    // For MVP: Simulate transcription
    // In production, this would use OpenAI Whisper API
    const mockTranscript = task.parameters?.mockTranscript || 'Hello, how can I help you today?';

    const result = {
      transcript: mockTranscript,
      confidence: 0.95,
      language: 'en',
      duration: 3.5,
    };

    await this.logInfo(sessionId, `Transcription complete: "${mockTranscript}"`);
    await this.completeSession(sessionId, result, 100);

    return {
      success: true,
      output: result,
      tokensUsed: 100,
    };
  }

  /**
   * Synthesize speech from text
   */
  private async synthesizeSpeech(sessionId: string, task: Task): Promise<AgentResult> {
    const text = task.parameters?.text || task.description;
    const voice = task.parameters?.voice || 'shimmer';

    await this.logInfo(sessionId, `Synthesizing speech: "${text.substring(0, 50)}..."`);

    // For MVP: Return metadata without actual audio generation
    // In production, this would call OpenAI TTS or ElevenLabs
    const result: VoiceResponse = {
      text,
      audioUrl: `/audio/${Date.now()}.mp3`, // Mock URL
      emotion: 'neutral',
      metadata: {
        voice,
        duration: text.length * 0.1, // Rough estimate
        provider: 'openai_tts',
      },
    };

    await this.logInfo(sessionId, 'Speech synthesized successfully');
    await this.completeSession(sessionId, result, 50);

    return {
      success: true,
      output: result,
      tokensUsed: 50,
    };
  }

  /**
   * Handle voice command
   */
  private async handleCommand(sessionId: string, task: Task): Promise<AgentResult> {
    const command: VoiceCommand = {
      transcript: task.parameters?.transcript || task.description,
      confidence: task.parameters?.confidence || 0.9,
    };

    await this.logInfo(sessionId, `Processing command: "${command.transcript}"`);

    // Use GPT-4 to understand intent
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `You are Cassiopeia, a voice assistant for the Stellar Agentic Cockpit.

Available agents:
- Sirius (orchestrator): Plan features, coordinate tasks
- Andromeda (coder): Generate, debug, review code
- Vega (validator): Test UI, check accessibility
- Rigel (researcher): Research topics, find APIs
- Betelgeuse (builder): Deploy, manage infrastructure

Parse the user's voice command and determine:
1. What agent should handle it
2. What action to take
3. What parameters are needed

Return JSON only.`,
        },
        {
          role: 'user',
          content: `Command: "${command.transcript}"

Return JSON:
{
  "intent": "action_description",
  "targetAgent": "agent_name",
  "action": "action_type",
  "parameters": {},
  "response": "What to say back to the user"
}`,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const resultText = response.choices[0].message.content || '{}';
    const intent = this.safeJsonParse(resultText, {
      intent: 'unknown',
      targetAgent: 'sirius',
      response: 'I understood your command.',
    });

    const tokensUsed = response.usage?.total_tokens || 0;

    await this.logInfo(
      sessionId,
      `Intent recognized: ${intent.intent}`,
      `Routing to: ${intent.targetAgent}`
    );

    await this.completeSession(sessionId, intent, tokensUsed);

    return {
      success: true,
      output: intent,
      tokensUsed,
    };
  }

  /**
   * Summarize a conversation
   */
  private async summarizeConversation(sessionId: string, task: Task): Promise<AgentResult> {
    const messages = task.parameters?.messages || [];

    await this.logInfo(sessionId, `Summarizing ${messages.length} messages`);

    const conversation = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'Summarize this conversation in 2-3 sentences. Focus on key decisions and action items.',
        },
        { role: 'user', content: conversation },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const summary = response.choices[0].message.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    await this.logInfo(sessionId, 'Conversation summarized');
    await this.completeSession(sessionId, { summary }, tokensUsed);

    return {
      success: true,
      output: { summary },
      tokensUsed,
    };
  }
}
