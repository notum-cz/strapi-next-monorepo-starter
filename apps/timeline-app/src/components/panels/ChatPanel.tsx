'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { useCopilotAction } from '@copilotkit/react-core';
import { PRE_SEEDED_QUESTIONS } from '@/lib/constants';
import type { ChatMessage } from '@/lib/types';

export default function ChatPanel({ stage_id, initialMessages = [] }: { stage_id: string; initialMessages?: ChatMessage[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get pre-seeded questions for this stage
  const preSeededQuestions = PRE_SEEDED_QUESTIONS[stage_id] || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAsk = async (question: string) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call CopilotKit action to generate response
      // In a real implementation, this would use the generateChatResponse tool
      // For now, we'll simulate it with a fetch to our API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id, question }),
      });

      const data = await response.json();

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: data.response || 'I apologize, but I encountered an error processing your question.',
        sources: data.sources || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: 'I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(input);
  };

  const handlePreSeededClick = (question: string) => {
    handleAsk(question);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Pre-seeded Questions */}
      {messages.length === 0 && preSeededQuestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Suggested Questions
          </h3>
          <div className="space-y-2">
            {preSeededQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handlePreSeededClick(question)}
                className="w-full text-left px-4 py-3 bg-nwk-light hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-700"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-messages mb-4">
        {messages.length === 0 && preSeededQuestions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-nwk-light rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-gray-500 mb-2">Ask me anything about this stage</p>
            <p className="text-sm text-gray-400">
              I'll answer based on verified timeline documentation
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.type}`}>
            <p className="whitespace-pre-wrap">{message.text}</p>
            {message.sources && message.sources.length > 0 && (
              <div className="chat-sources">
                <p className="text-xs font-semibold mb-1">Sources:</p>
                {message.sources.map((source, index) => (
                  <div key={index} className="text-xs">
                    • {source}
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-message assistant flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this stage..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nwk-green focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn btn-primary px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
          All responses are fact-checked against verified timeline documentation
        </p>
      </form>

      {/* Export Chat Option */}
      {messages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              const chatText = messages
                .map((m) => `${m.type.toUpperCase()}: ${m.text}`)
                .join('\n\n');
              const blob = new Blob([chatText], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `chat-${stage_id}-${Date.now()}.txt`;
              a.click();
            }}
            className="text-sm text-nwk-green hover:underline"
          >
            Export chat as text
          </button>
        </div>
      )}
    </div>
  );
}
