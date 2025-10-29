# Multi-LLM Configuration Guide

> Complete guide to configuring and switching between different Large Language Model providers in your application.

## Overview

This application supports multiple LLM providers through RouteLLM, allowing you to:

- 🔄 **Switch providers easily** - Change models with environment variables
- 💰 **Optimize costs** - Route between expensive and cheap models intelligently
- 🌐 **Use multiple providers** - Mix OpenAI, Anthropic, Google, AWS, and more
- 🏠 **Run locally** - Use Ollama for offline/private deployments
- 🎯 **Match use cases** - Different models for different tasks

## Quick Start

### 1. Basic Setup (Single Provider)

Choose one provider and set the required environment variables:

```bash
# .env.local
AI_ROUTER_ENABLED=true
AI_ROUTER_BASE_URL=http://localhost:6060

# OpenAI (simplest to get started)
AI_STRONG_MODEL=gpt-4-1106-preview
AI_WEAK_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=sk-...
```

### 2. Multi-Provider Setup (Recommended)

Use different providers for strong and weak models to optimize cost and quality:

```bash
# .env.local
AI_ROUTER_ENABLED=true

# Strong model: Claude 3 Opus (best quality)
AI_STRONG_MODEL=claude-3-opus-20240229
ANTHROPIC_API_KEY=sk-ant-...

# Weak model: Mixtral via Anyscale (low cost)
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1
ANYSCALE_API_KEY=...

# Routing
AI_ROUTER_THRESHOLD=0.5
```

## Supported Providers

### 1. OpenAI

**Models:**
- `gpt-4-turbo` - Latest GPT-4 (128k context)
- `gpt-4-1106-preview` - GPT-4 Turbo preview
- `gpt-4` - Standard GPT-4 (8k context)
- `gpt-3.5-turbo` - Fast and cheap
- `gpt-3.5-turbo-16k` - Extended context

**Setup:**
```bash
# Get API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# Example configuration
AI_STRONG_MODEL=gpt-4-1106-preview
AI_WEAK_MODEL=gpt-3.5-turbo
```

**Pricing (as of 2024):**
- GPT-4 Turbo: $10/1M input, $30/1M output
- GPT-4: $30/1M input, $60/1M output
- GPT-3.5 Turbo: $0.50/1M input, $1.50/1M output

**Best For:**
- General-purpose applications
- Production deployments
- Highest reliability
- JSON mode and function calling

### 2. Anthropic (Claude)

**Models:**
- `claude-3-opus-20240229` - Highest intelligence
- `claude-3-sonnet-20240229` - Balanced performance
- `claude-3-haiku-20240307` - Fastest and cheapest
- `claude-2.1` - Previous generation
- `claude-instant-1.2` - Legacy fast model

**Setup:**
```bash
# Get API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...

# Example configuration
AI_STRONG_MODEL=claude-3-opus-20240229
AI_WEAK_MODEL=claude-3-haiku-20240307
```

**Pricing:**
- Opus: $15/1M input, $75/1M output
- Sonnet: $3/1M input, $15/1M output
- Haiku: $0.25/1M input, $1.25/1M output

**Best For:**
- Long context tasks (200k tokens)
- Complex reasoning
- Code analysis
- Creative writing
- Safety-critical applications

### 3. Google (Gemini)

**Models:**
- `gemini-1.5-pro` - Multimodal, 1M token context
- `gemini-pro` - Text-only, fast
- `gemini-pro-vision` - With image understanding

**Setup:**
```bash
# Get API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=...

# Example configuration
AI_STRONG_MODEL=gemini-1.5-pro
AI_WEAK_MODEL=gemini-pro
```

**Pricing:**
- Gemini 1.5 Pro: $7/1M input, $21/1M output
- Gemini Pro: $0.50/1M input, $1.50/1M output

**Best For:**
- Very long context (up to 1M tokens)
- Multimodal tasks (text + images)
- Cost-effective for large documents
- YouTube video analysis

### 4. AWS Bedrock

**Models:**
- `anthropic.claude-3-opus-20240229-v1:0`
- `anthropic.claude-3-sonnet-20240229-v1:0`
- `anthropic.claude-3-haiku-20240307-v1:0`
- `meta.llama3-70b-instruct-v1:0`
- `amazon.titan-text-express-v1`

**Setup:**
```bash
# Configure AWS credentials
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Example configuration
AI_STRONG_MODEL=anthropic.claude-3-opus-20240229-v1:0
AI_WEAK_MODEL=anthropic.claude-3-haiku-20240307-v1:0
```

**Pricing:**
- Same as Anthropic models
- Pay for AWS infrastructure
- Volume discounts available

**Best For:**
- Enterprise AWS deployments
- Compliance requirements (HIPAA, SOC2)
- Private VPC deployments
- Integration with AWS services

### 5. Azure OpenAI

**Models:**
- Same as OpenAI (GPT-4, GPT-3.5)
- Deployed in Azure regions

**Setup:**
```bash
# Get from Azure portal
AZURE_API_KEY=...
AZURE_API_BASE=https://your-resource.openai.azure.com
AZURE_API_VERSION=2023-05-15

# Example configuration (use deployment names)
AI_STRONG_MODEL=azure/gpt-4-deployment
AI_WEAK_MODEL=azure/gpt-35-turbo-deployment
```

**Pricing:**
- Same as OpenAI
- Billed through Azure

**Best For:**
- Enterprise Microsoft shops
- Azure ecosystem integration
- Data residency requirements
- Existing Azure credits

### 6. Anyscale

**Models (hosted open-source):**
- `anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1` - Best MoE
- `anyscale/meta-llama/Llama-2-70b-chat-hf`
- `anyscale/meta-llama/Llama-3-70b-instruct`
- `anyscale/codellama/CodeLlama-70b-Instruct-hf`

**Setup:**
```bash
# Get API key from: https://app.anyscale.com/
ANYSCALE_API_KEY=...

# Example configuration
AI_STRONG_MODEL=gpt-4-1106-preview  # OpenAI for quality
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1  # Cheap
OPENAI_API_KEY=sk-...
ANYSCALE_API_KEY=...
```

**Pricing:**
- Mixtral 8x7B: $0.50/1M tokens (very cheap!)
- Llama 2 70B: $1.00/1M tokens
- Llama 3 70B: $1.50/1M tokens

**Best For:**
- **Maximum cost savings** (routing weak model)
- Open-source model access
- No vendor lock-in
- Code generation tasks

### 7. Ollama (Local)

**Models (run locally):**
- `ollama/llama2` - Meta's Llama 2
- `ollama/mistral` - Mistral 7B
- `ollama/codellama` - Code-specialized
- `ollama/llama3` - Latest Llama
- `ollama/phi` - Microsoft Phi (small, fast)

**Setup:**
```bash
# Install Ollama: https://ollama.ai/
curl https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama2
ollama pull mistral

# No API key needed!
AI_STRONG_MODEL=gpt-4-1106-preview  # OpenAI for strong
AI_WEAK_MODEL=ollama/mistral  # Local for weak
OPENAI_API_KEY=sk-...
```

**Pricing:**
- **FREE** - runs on your hardware
- One-time GPU cost if needed

**Best For:**
- Development/testing without API costs
- Privacy-sensitive applications
- Offline operation
- Unlimited usage

## Configuration Patterns

### Pattern 1: Single Provider (Simple)

**Use Case:** Just getting started, prefer simplicity

```bash
AI_STRONG_MODEL=gpt-4-1106-preview
AI_WEAK_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=sk-...
```

**Pros:** Simple, one API key, reliable
**Cons:** Limited flexibility, higher cost

### Pattern 2: Best Quality + Best Cost

**Use Case:** Production app, optimize both quality and cost

```bash
# Strong: Claude Opus (best reasoning)
AI_STRONG_MODEL=claude-3-opus-20240229
ANTHROPIC_API_KEY=sk-ant-...

# Weak: Mixtral via Anyscale (cheapest quality model)
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1
ANYSCALE_API_KEY=...

AI_ROUTER_THRESHOLD=0.5
```

**Pros:** Best of both worlds
**Cons:** Two providers to manage

### Pattern 3: Enterprise AWS/Azure

**Use Case:** Enterprise with cloud commitments

```bash
# All models from single cloud provider
AI_STRONG_MODEL=anthropic.claude-3-opus-20240229-v1:0
AI_WEAK_MODEL=anthropic.claude-3-haiku-20240307-v1:0

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

**Pros:** Unified billing, compliance, private networking
**Cons:** Higher cost than direct API access

### Pattern 4: Development/Testing

**Use Case:** Local development, no API costs

```bash
# Use Ollama for everything
AI_STRONG_MODEL=ollama/llama3
AI_WEAK_MODEL=ollama/mistral

# No API keys needed!
```

**Pros:** Free, private, fast iteration
**Cons:** Lower quality, requires local GPU

### Pattern 5: Hybrid Local/Cloud

**Use Case:** Dev locally, production in cloud

```bash
# .env.local (development)
AI_STRONG_MODEL=ollama/llama3
AI_WEAK_MODEL=ollama/mistral

# .env.production (deployed)
AI_STRONG_MODEL=gpt-4-1106-preview
AI_WEAK_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=sk-...
```

**Pros:** No dev costs, production quality
**Cons:** Different behavior between environments

## Cost Optimization Strategies

### Strategy 1: Aggressive Cost Cutting

**Goal:** Minimize costs, accept slight quality drop

```bash
AI_STRONG_MODEL=gpt-3.5-turbo  # Cheap "strong"
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1
AI_ROUTER_THRESHOLD=0.3  # Mostly weak model

# Cost: ~$0.50 per 1M tokens
# Savings: 98% vs GPT-4
```

### Strategy 2: Balanced (Recommended)

**Goal:** Good quality at reasonable cost

```bash
AI_STRONG_MODEL=gpt-4-1106-preview
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1
AI_ROUTER_THRESHOLD=0.5

# Cost: ~$8 per 1M tokens
# Savings: 73% vs GPT-4 only
```

### Strategy 3: Quality First

**Goal:** Best quality, moderate savings

```bash
AI_STRONG_MODEL=claude-3-opus-20240229
AI_WEAK_MODEL=claude-3-sonnet-20240229
AI_ROUTER_THRESHOLD=0.7  # Mostly strong

# Cost: ~$20 per 1M tokens
# Savings: 55% vs Opus only
```

### Strategy 4: Task-Specific Routing

**Goal:** Different configs for different endpoints

```typescript
// api/ai/chat/simple/route.ts - Simple queries
AI_STRONG_MODEL=gpt-3.5-turbo
AI_WEAK_MODEL=ollama/mistral

// api/ai/chat/complex/route.ts - Complex reasoning
AI_STRONG_MODEL=claude-3-opus-20240229
AI_WEAK_MODEL=claude-3-haiku-20240307
```

## Model Selection Guide

### Use GPT-4 (OpenAI) for:
- ✅ General-purpose applications
- ✅ Function calling / JSON mode
- ✅ Reliable production deployments
- ✅ Strong tool use capabilities

### Use Claude 3 (Anthropic) for:
- ✅ Very long documents (200k context)
- ✅ Complex reasoning tasks
- ✅ Code analysis and review
- ✅ Safety-critical applications
- ✅ Creative writing

### Use Gemini (Google) for:
- ✅ Extremely long context (1M tokens)
- ✅ Multimodal tasks (text + images)
- ✅ YouTube video analysis
- ✅ Cost-effective long documents

### Use Mixtral (Anyscale) for:
- ✅ **Cost optimization** (weak model)
- ✅ Simple queries
- ✅ High-volume applications
- ✅ Open-source preference

### Use Ollama (Local) for:
- ✅ Development/testing
- ✅ Privacy requirements
- ✅ Offline operation
- ✅ Unlimited free usage

## Configuration Examples

### Example 1: SaaS Application

```bash
# Production: Quality + Cost balance
AI_ROUTER_ENABLED=true
AI_STRONG_MODEL=gpt-4-1106-preview
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1
AI_ROUTER_THRESHOLD=0.5
OPENAI_API_KEY=sk-...
ANYSCALE_API_KEY=...

# Estimated cost: $8/1M tokens (73% savings vs GPT-4 only)
```

### Example 2: Enterprise Application

```bash
# AWS Bedrock: Compliance + Security
AI_ROUTER_ENABLED=true
AI_STRONG_MODEL=anthropic.claude-3-opus-20240229-v1:0
AI_WEAK_MODEL=anthropic.claude-3-haiku-20240307-v1:0
AI_ROUTER_THRESHOLD=0.6
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Runs in private VPC, HIPAA compliant
```

### Example 3: Startup MVP

```bash
# Development: Local + Free
AI_ROUTER_ENABLED=true
AI_STRONG_MODEL=ollama/llama3
AI_WEAK_MODEL=ollama/mistral
AI_ROUTER_THRESHOLD=0.5

# Cost: $0 (runs locally)
# Good enough for MVP validation
```

### Example 4: Research Project

```bash
# Long context analysis
AI_ROUTER_ENABLED=true
AI_STRONG_MODEL=gemini-1.5-pro  # 1M context
AI_WEAK_MODEL=gemini-pro
AI_ROUTER_THRESHOLD=0.4
GEMINI_API_KEY=...

# Perfect for analyzing long papers/books
```

### Example 5: Multi-Region Deployment

```bash
# US Region
AI_STRONG_MODEL=gpt-4-1106-preview
OPENAI_API_KEY=sk-...

# EU Region (data residency)
AI_STRONG_MODEL=azure/gpt-4-deployment
AZURE_API_KEY=...
AZURE_API_BASE=https://eu-resource.openai.azure.com
```

## Environment-Specific Configuration

### Development (.env.local)

```bash
# Fast, cheap, local
AI_ROUTER_ENABLED=true
AI_STRONG_MODEL=ollama/llama3
AI_WEAK_MODEL=ollama/mistral
AI_ROUTER_THRESHOLD=0.5
```

### Staging (.env.staging)

```bash
# Real APIs, test routing
AI_ROUTER_ENABLED=true
AI_STRONG_MODEL=gpt-3.5-turbo  # Cheaper for testing
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1
AI_ROUTER_THRESHOLD=0.5
OPENAI_API_KEY=sk-test-...
ANYSCALE_API_KEY=test-...
```

### Production (.env.production)

```bash
# Best quality, optimized cost
AI_ROUTER_ENABLED=true
AI_STRONG_MODEL=gpt-4-1106-preview
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1
AI_ROUTER_THRESHOLD=0.5
OPENAI_API_KEY=sk-prod-...
ANYSCALE_API_KEY=prod-...
```

## Switching Providers

### Checklist for Switching

1. **Get API Key**
   - Sign up for new provider
   - Generate API key
   - Add to environment variables

2. **Update Model Names**
   - Check provider's model list
   - Use exact model identifiers
   - Update AI_STRONG_MODEL or AI_WEAK_MODEL

3. **Test Locally**
   ```bash
   # Test health check
   curl http://localhost:6060/health

   # Test chat completion
   curl -X POST http://localhost:3000/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "test"}]}'
   ```

4. **Monitor Costs**
   - Check provider dashboard
   - Set up billing alerts
   - Monitor token usage

5. **Deploy**
   - Update environment variables in deployment
   - Restart RouteLLM server
   - Verify in production

## Troubleshooting

### Error: "Model not found"

```bash
# Solution: Check model name spelling
# Each provider has specific model identifiers

# OpenAI
AI_STRONG_MODEL=gpt-4-1106-preview  # ✅
AI_STRONG_MODEL=gpt-4-turbo  # ✅
AI_STRONG_MODEL=gpt4  # ❌ Wrong

# Anthropic
AI_STRONG_MODEL=claude-3-opus-20240229  # ✅
AI_STRONG_MODEL=claude-3-opus  # ❌ Missing date
```

### Error: "Authentication failed"

```bash
# Solution: Check API key is correct and not expired
echo $OPENAI_API_KEY  # Should start with sk-
echo $ANTHROPIC_API_KEY  # Should start with sk-ant-

# Verify key works directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### High Costs

```bash
# Solution 1: Lower threshold (use weak model more)
AI_ROUTER_THRESHOLD=0.3  # Was 0.5

# Solution 2: Switch to cheaper models
AI_STRONG_MODEL=gpt-3.5-turbo  # Was gpt-4
AI_WEAK_MODEL=ollama/mistral  # Was gpt-3.5

# Solution 3: Monitor per-endpoint usage
# Disable routing for simple endpoints
```

### Slow Responses

```bash
# Solution: Check latency to provider
time curl https://api.openai.com/v1/models

# Use geographically closer provider
# US East → OpenAI US
# EU → Azure EU endpoint
# Asia → Anyscale Asia

# Or increase timeout
AI_ROUTER_TIMEOUT=60000  # 60 seconds
```

## Best Practices

1. **Start Simple**
   - Begin with single provider (OpenAI)
   - Add routing after validating use case
   - Gradually optimize costs

2. **Monitor Costs**
   - Set up billing alerts
   - Track per-endpoint usage
   - Review monthly spending

3. **Test Thoroughly**
   - Test each provider locally first
   - Validate quality meets requirements
   - Load test before production

4. **Secure API Keys**
   - Never commit to git
   - Use environment variables
   - Rotate regularly
   - Use separate keys for dev/prod

5. **Plan for Failures**
   - Have fallback providers
   - Implement retry logic
   - Monitor error rates

6. **Optimize by Use Case**
   - Simple queries → weak model
   - Complex reasoning → strong model
   - Consider dedicated endpoints

## Further Resources

- **OpenAI Pricing**: https://openai.com/pricing
- **Anthropic Pricing**: https://www.anthropic.com/pricing
- **Google AI Pricing**: https://ai.google.dev/pricing
- **AWS Bedrock Pricing**: https://aws.amazon.com/bedrock/pricing/
- **Anyscale**: https://www.anyscale.com/
- **Ollama**: https://ollama.ai/
- **RouteLLM**: https://github.com/lm-sys/RouteLLM

---

**Next Steps:**
1. Choose your providers based on requirements
2. Get API keys
3. Configure environment variables
4. Test locally
5. Deploy to production
6. Monitor costs and optimize
