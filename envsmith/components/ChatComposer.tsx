'use client';

import { useState } from 'react';
import { getAllTemplates } from '@/lib/templates';

interface ChatComposerProps {
  onGenerate: (stack: string[], overrides: Record<string, string>) => void;
}

export default function ChatComposer({ onGenerate }: ChatComposerProps) {
  const [input, setInput] = useState('');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [customVars, setCustomVars] = useState<Record<string, string>>({});

  const templates = getAllTemplates();

  const handleStackToggle = (stackName: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stackName)
        ? prev.filter((s) => s !== stackName)
        : [...prev, stackName]
    );
  };

  const handleGenerate = () => {
    onGenerate(selectedStacks, customVars);
  };

  const handleQuickParse = () => {
    // Simple natural language parser
    const lower = input.toLowerCase();
    const detectedStacks: string[] = [];

    if (lower.includes('nextjs') || lower.includes('next.js') || lower.includes('next')) {
      detectedStacks.push('nextjs');
    }
    if (lower.includes('supabase')) {
      detectedStacks.push('supabase');
    }
    if (lower.includes('postgres') || lower.includes('postgresql')) {
      detectedStacks.push('postgres');
    }
    if (lower.includes('stripe')) {
      detectedStacks.push('stripe');
    }
    if (lower.includes('openai')) {
      detectedStacks.push('openai');
    }
    if (lower.includes('anthropic') || lower.includes('claude')) {
      detectedStacks.push('anthropic');
    }
    if (lower.includes('aws') || lower.includes('amazon')) {
      detectedStacks.push('aws');
    }
    if (lower.includes('google')) {
      detectedStacks.push('google');
    }
    if (lower.includes('django')) {
      detectedStacks.push('django');
    }
    if (lower.includes('rails') || lower.includes('ruby')) {
      detectedStacks.push('rails');
    }
    if (lower.includes('express') || lower.includes('node')) {
      detectedStacks.push('node-express');
    }

    setSelectedStacks([...new Set(detectedStacks)]);
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Describe your project (optional)
        </label>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Next.js app with Supabase and Stripe integration..."
            className="flex-1 min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleQuickParse}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          Parse & Detect Stacks
        </button>
      </div>

      {/* Stack Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Templates
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {templates.map((template) => (
            <button
              key={template.name}
              onClick={() => {
                const stackKey = Object.keys(getAllTemplates()).find(
                  (k) => getAllTemplates()[k as any].name === template.name
                );
                if (stackKey) handleStackToggle(stackKey);
              }}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                selectedStacks.includes(
                  Object.keys(getAllTemplates()).find(
                    (k) => getAllTemplates()[k as any].name === template.name
                  ) || ''
                )
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={selectedStacks.length === 0}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Generate .env
        </button>
      </div>
    </div>
  );
}
