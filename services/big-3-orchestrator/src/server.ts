// ============================================================================
// BIG-3 SUPER AGENT ORCHESTRATOR
// Coordinates OpenAI + Claude + Gemini
// Port: 3010
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'big-3-orchestrator',
    providers: ['openai', 'anthropic', 'gemini'],
    timestamp: new Date().toISOString(),
  });
});

// Coordinate all three agents
app.post('/coordinate', async (req, res) => {
  const { task, mode = 'best' } = req.body;

  try {
    let result;

    switch (mode) {
      case 'openai':
        result = await coordinateOpenAI(task);
        break;
      case 'claude':
        result = await coordinateClaude(task);
        break;
      case 'gemini':
        result = await coordinateGemini(task);
        break;
      case 'best':
      default:
        result = await coordinateBest(task);
        break;
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Use OpenAI
async function coordinateOpenAI(task: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: task }],
  });

  return {
    provider: 'openai',
    result: response.choices[0].message.content,
    tokens: response.usage?.total_tokens || 0,
  };
}

// Use Claude
async function coordinateClaude(task: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{ role: 'user', content: task }],
  });

  const content = response.content[0];
  return {
    provider: 'anthropic',
    result: content.type === 'text' ? content.text : '',
    tokens: response.usage.input_tokens + response.usage.output_tokens,
  };
}

// Use Gemini
async function coordinateGemini(task: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const result = await model.generateContent(task);

  return {
    provider: 'gemini',
    result: result.response.text(),
    tokens: 100, // Estimate
  };
}

// Select best provider for task
async function coordinateBest(task: string) {
  // Simple logic: route based on keywords
  const taskLower = task.toLowerCase();

  if (taskLower.includes('code') || taskLower.includes('debug')) {
    return coordinateClaude(task);
  } else if (taskLower.includes('browser') || taskLower.includes('search')) {
    return coordinateGemini(task);
  } else {
    return coordinateOpenAI(task);
  }
}

app.listen(PORT, () => {
  console.log(`✨ Big-3 Orchestrator running on port ${PORT}`);
});
