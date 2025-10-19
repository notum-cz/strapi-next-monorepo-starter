
import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow, runFlow } from '@genkit-ai/flow';
import * as pdf from 'pdf-parse';
import { z } from 'zod';


configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const pdfReader = defineFlow(
  {
    name: 'pdfReader',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }
);

export const menuFlow = defineFlow(
  {
    name: 'menuFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (topic) => {
    const prompt = `You are a helpful AI assistant that can answer questions about a PDF file. 
    You have been provided with the following information from a PDF file: ${topic}
    Please answer the following question: What are the menu items and their prices?`;

    const llmResponse = await generate({ 
      prompt: prompt, 
      model: 'google-pro',
      config: {
        temperature: 0.5, 
      },
    });

    return llmResponse.text();
  }
);

export const pdfChat = defineFlow(
  {
    name: 'pdfChat',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (filePath) => {
    const pdfText = await runFlow(pdfReader, filePath);
    const menu = await runFlow(menuFlow, pdfText);
    return menu;
  }
);
