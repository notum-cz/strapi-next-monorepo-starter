# @repo/ai-router

Optional LLM routing service with **RouteLLM** integration for cost-efficient model selection.

## Features

- ✅ **Feature-flagged** - Disabled by default (`AI_ROUTER_ENABLED=false`)
- ✅ **Non-blocking** - Returns stub responses when disabled
- ✅ **OpenAI-compatible** - Works with RouteLLM's OpenAI endpoint
- ✅ **Tree-shakeable** - Zero runtime overhead when not used
- ✅ **Type-safe** - Full TypeScript support

## Installation

This package is part of the monorepo. No installation needed.

```typescript
import { routeChat } from '@repo/ai-router';
```

## Usage

### Basic Example

```typescript
import { routeChat } from '@repo/ai-router';

const response = await routeChat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the capital of France?' },
]);

if ('enabled' in response && !response.enabled) {
  // Router is disabled - use fallback logic
  console.log('Router disabled:', response.message);
} else {
  // Router is enabled - use AI response
  console.log('AI:', response.choices[0].message.content);
}
```

### With Options

```typescript
import { routeChat } from '@repo/ai-router';

const response = await routeChat(
  [
    { role: 'user', content: 'Explain quantum computing' },
  ],
  {
    temperature: 0.7,
    maxTokens: 500,
    metadata: {
      userId: 'user-123',
      source: 'web-chat',
    },
  }
);
```

### Health Check

```typescript
import { healthCheck } from '@repo/ai-router';

const status = await healthCheck();

if (status.healthy) {
  console.log('Router is up and running!');
} else {
  console.error('Router unavailable:', status.error);
}
```

### Get Router Info

```typescript
import { getRouterInfo } from '@repo/ai-router';

const info = getRouterInfo();
console.log('Router enabled:', info.enabled);
console.log('Strong model:', info.strongModel);
console.log('Weak model:', info.weakModel);
```

## Environment Variables

```bash
# Feature flag (default: false)
AI_ROUTER_ENABLED=true

# RouteLLM server URL (default: http://localhost:6060)
AI_ROUTER_BASE_URL=http://localhost:6060

# Model configuration
AI_STRONG_MODEL=gpt-4-1106-preview
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1

# Router type (default: mf)
# Options: mf (matrix-factorization), causal, bert, etc.
AI_ROUTER_TYPE=mf

# Routing threshold (default: 0.5)
# Higher = more selective (more strong model usage)
AI_ROUTER_THRESHOLD=0.5

# Request timeout in ms (default: 30000)
AI_ROUTER_TIMEOUT=30000
```

## Running RouteLLM Server

### Prerequisites

```bash
pip install "routellm[serve,eval]"
```

### Set API Keys

```bash
export OPENAI_API_KEY=sk-...
export ANYSCALE_API_KEY=...
```

### Start Server

```bash
python -m routellm.openai_server \
  --routers mf \
  --strong-model gpt-4-1106-preview \
  --weak-model anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1 \
  --host 0.0.0.0 \
  --port 6060
```

### Test Connection

```bash
curl http://localhost:6060/health
```

## API Reference

### `routeChat(messages, options?)`

Routes a chat completion request to the appropriate LLM.

**Parameters:**
- `messages: Message[]` - Array of chat messages
- `options?: ChatOptions` - Optional chat completion options
  - `model?: string` - Override model selection
  - `temperature?: number` - Sampling temperature (0-2)
  - `maxTokens?: number` - Maximum tokens to generate
  - `stream?: boolean` - Enable streaming (not yet implemented)
  - `metadata?: Record<string, any>` - Additional metadata

**Returns:**
- `Promise<ChatResponse | StubResponse>` - Chat completion or stub

### `healthCheck()`

Checks if the RouteLLM server is accessible and healthy.

**Returns:**
- `Promise<{ enabled: boolean; healthy: boolean; error?: string }>`

### `getRouterInfo()`

Gets current router configuration (safe for client-side).

**Returns:**
- `Omit<RouterConfig, 'baseUrl'>` - Configuration without sensitive data

## Type Definitions

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  metadata?: Record<string, any>;
}

interface ChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface StubResponse {
  enabled: false;
  message: string;
  timestamp: string;
}
```

## Integration with Next.js

See `/apps/web/src/app/api/ai/chat/route.ts` for example API route.

## Model Support

RouteLLM uses **LiteLLM** under the hood, supporting:

- **OpenAI:** `gpt-4`, `gpt-3.5-turbo`, etc.
- **Anthropic:** `claude-3-opus`, `claude-3-sonnet`, etc.
- **Google:** `gemini-pro`, `gemini-ultra`, etc.
- **Anyscale:** `anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1`, etc.
- **Bedrock:** `bedrock/anthropic.claude-v2`, etc.
- **Ollama:** `ollama/llama2`, `ollama/mistral`, etc.

Set provider API keys as environment variables:
```bash
export OPENAI_API_KEY=...
export ANTHROPIC_API_KEY=...
export GEMINI_API_KEY=...
export ANYSCALE_API_KEY=...
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

## Threshold Calibration

The `AI_ROUTER_THRESHOLD` parameter controls routing behavior:

- **0.0** - Always use weak model (cheapest)
- **0.5** - Balanced routing (default)
- **1.0** - Always use strong model (best quality)

Calibrate based on your use case:
- **Simple queries** (FAQ, greetings) → Lower threshold (0.2-0.4)
- **General purpose** → Medium threshold (0.4-0.6)
- **Complex tasks** (code, analysis) → Higher threshold (0.6-0.8)

## Cost Optimization

Example cost comparison (per 1M tokens):

| Model | Cost (Input) | Cost (Output) | Speed |
|-------|-------------|---------------|-------|
| GPT-4 | $10 | $30 | Slow |
| GPT-3.5-turbo | $0.50 | $1.50 | Fast |
| Mixtral-8x7B (Anyscale) | $0.15 | $0.15 | Very Fast |

**RouteLLM** intelligently routes ~50% of requests to the weak model, saving ~70% on costs while maintaining quality.

## Troubleshooting

### Router not working

1. Check `AI_ROUTER_ENABLED=true` is set
2. Verify RouteLLM server is running: `curl http://localhost:6060/health`
3. Check API keys are set: `echo $OPENAI_API_KEY`
4. Review logs for connection errors

### Build errors

If you see build errors, ensure:
- `AI_ROUTER_ENABLED=false` (default) in your environment
- The package is properly tree-shaken
- No direct imports from unbuilt files

### Performance issues

- Increase `AI_ROUTER_TIMEOUT` if requests are timing out
- Use a local RouteLLM server for low latency
- Consider caching frequently asked questions

## License

MIT

## Links

- [RouteLLM GitHub](https://github.com/lm-sys/RouteLLM)
- [LiteLLM Docs](https://docs.litellm.ai/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat)
