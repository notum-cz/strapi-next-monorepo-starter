# RouteLLM Local Server Setup

> **OPTIONAL**: This guide is for enabling advanced LLM routing capabilities. The application builds and runs perfectly fine without RouteLLM.

## Overview

RouteLLM is a cost-efficient LLM routing service that intelligently routes requests between a "strong" (expensive, high-quality) model and a "weak" (cheap, fast) model using machine learning. This can reduce LLM costs by 50-85% while maintaining quality.

**Cost Example:**
- Without routing: All requests to GPT-4 = $30/1M tokens
- With routing (0.5 threshold): Mix of GPT-4 + GPT-3.5 = $8/1M tokens (~73% savings)

## Prerequisites

Before setting up RouteLLM, ensure you have:

1. **Python 3.9+** installed
   ```bash
   python3 --version  # Should show 3.9.0 or higher
   ```

2. **API Keys** for at least one LLM provider:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/
   - Google (Gemini): https://makersuite.google.com/app/apikey
   - Anyscale: https://app.anyscale.com/

3. **~2GB disk space** for model files

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# 1. Set your API key(s) in .env.local
echo "OPENAI_API_KEY=sk-..." >> apps/web/.env.local

# 2. Run the setup script
chmod +x scripts/setup-routellm.sh
./scripts/setup-routellm.sh
```

The script will:
- ✓ Check Python version
- ✓ Create a virtual environment
- ✓ Install RouteLLM with dependencies
- ✓ Validate configuration
- ✓ Start the server

### Option 2: Manual Setup

```bash
# 1. Create and activate virtual environment
python3 -m venv .venv-routellm
source .venv-routellm/bin/activate  # On Windows: .venv-routellm\Scripts\activate

# 2. Install RouteLLM
pip install "routellm[serve,eval]"

# 3. Set API keys
export OPENAI_API_KEY=sk-...
export ANYSCALE_API_KEY=...

# 4. Start server
python -m routellm.openai_server \
  --routers mf \
  --strong-model gpt-4-1106-preview \
  --weak-model anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1 \
  --host 0.0.0.0 \
  --port 6060
```

## Configuration

### Environment Variables

Add these to `apps/web/.env.local`:

```bash
# Enable LLM routing
AI_ROUTER_ENABLED=true

# RouteLLM server URL
AI_ROUTER_BASE_URL=http://localhost:6060

# Strong model (high-quality, expensive)
AI_STRONG_MODEL=gpt-4-1106-preview

# Weak model (fast, cost-effective)
AI_WEAK_MODEL=anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1

# Router algorithm
AI_ROUTER_TYPE=mf  # Options: mf, causal, bert

# Routing threshold (0.0 = always weak, 1.0 = always strong)
AI_ROUTER_THRESHOLD=0.5

# Provider API keys
OPENAI_API_KEY=sk-...
ANYSCALE_API_KEY=...
```

### Supported Models

#### Strong Models (High Quality)
- `gpt-4-1106-preview` - OpenAI GPT-4 Turbo
- `gpt-4` - OpenAI GPT-4
- `claude-3-opus-20240229` - Anthropic Claude 3 Opus
- `claude-3-sonnet-20240229` - Anthropic Claude 3 Sonnet
- `gemini-pro` - Google Gemini Pro

#### Weak Models (Cost-Effective)
- `gpt-3.5-turbo` - OpenAI GPT-3.5
- `anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1` - Mixtral 8x7B (Anyscale)
- `claude-3-haiku-20240307` - Anthropic Claude 3 Haiku
- `ollama/llama2` - Local Llama 2 via Ollama

### Router Algorithms

RouteLLM supports three router types:

| Router | Description | Best For |
|--------|-------------|----------|
| `mf` (Matrix Factorization) | Uses embeddings similarity | General-purpose, balanced |
| `causal` | Causal language model | High accuracy, slower |
| `bert` | BERT-based classifier | Fast inference |

**Recommendation**: Start with `mf` (default) - it provides the best balance.

## Testing

### 1. Health Check

```bash
curl http://localhost:6060/health
```

Expected output:
```json
{"status": "ok"}
```

### 2. Test Chat Completion

```bash
curl -X POST http://localhost:6060/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "router",
    "messages": [
      {"role": "user", "content": "What is 2+2?"}
    ]
  }'
```

### 3. Test via Application API

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ],
    "options": {
      "temperature": 0.7
    }
  }'
```

## Threshold Calibration

The `AI_ROUTER_THRESHOLD` controls routing behavior:

| Threshold | Behavior | Use Case |
|-----------|----------|----------|
| 0.0 | Always route to weak model | Maximum cost savings, testing |
| 0.3 | Mostly weak, some strong | Very cost-conscious |
| 0.5 | Balanced routing | **Recommended starting point** |
| 0.7 | Mostly strong, some weak | Quality-focused |
| 1.0 | Always route to strong model | Maximum quality, no savings |

**Finding Your Optimal Threshold:**

1. Start with 0.5 (balanced)
2. Monitor quality metrics for your use case
3. Adjust based on results:
   - Quality issues? → Increase threshold (0.6-0.7)
   - Cost too high? → Decrease threshold (0.3-0.4)
4. Test with real traffic patterns

## Cost Analysis

Example costs per 1M tokens (prompt + completion):

| Configuration | Cost | Savings |
|--------------|------|---------|
| GPT-4 only | $30 | - |
| GPT-4 + GPT-3.5 (threshold 0.5) | $8 | 73% |
| Claude Opus only | $45 | - |
| Opus + Haiku (threshold 0.5) | $12 | 73% |

**Real-world Example:**
- Application with 10M tokens/month
- Without routing: 10M × $0.03 = $300/month
- With routing (0.5): 10M × $0.008 = $80/month
- **Savings: $220/month ($2,640/year)**

## Troubleshooting

### Server Won't Start

**Error: `ModuleNotFoundError: No module named 'routellm'`**
```bash
# Solution: Ensure virtual environment is activated
source .venv-routellm/bin/activate
pip install "routellm[serve,eval]"
```

**Error: `Authentication failed`**
```bash
# Solution: Check API keys are set correctly
echo $OPENAI_API_KEY  # Should print your key
export OPENAI_API_KEY=sk-...
```

**Error: `Port 6060 already in use`**
```bash
# Solution: Use a different port
python -m routellm.openai_server --port 6061 ...
# Update AI_ROUTER_BASE_URL=http://localhost:6061
```

### Application Can't Connect

**Error in logs: `Connection refused`**
```bash
# Solution: Verify server is running
curl http://localhost:6060/health

# Check server is listening on correct interface
netstat -an | grep 6060
```

**Error: `503 Service Unavailable`**
```bash
# Solution: Check AI_ROUTER_ENABLED in .env.local
# Ensure it's set to 'true' (not 'True' or '1')
AI_ROUTER_ENABLED=true
```

### Performance Issues

**Slow responses**
- Check network latency between app and RouteLLM server
- Increase `AI_ROUTER_TIMEOUT` if needed
- Consider deploying RouteLLM closer to your app

**High memory usage**
- Normal for first request (model loading)
- Subsequent requests should be fast
- Consider using `bert` router for lower memory footprint

## Production Deployment

### Docker Setup

Create `Dockerfile.routellm`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install RouteLLM
RUN pip install "routellm[serve,eval]"

# Expose port
EXPOSE 6060

# Start server
CMD ["python", "-m", "routellm.openai_server", \
     "--routers", "mf", \
     "--strong-model", "gpt-4-1106-preview", \
     "--weak-model", "anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1", \
     "--host", "0.0.0.0", \
     "--port", "6060"]
```

Build and run:
```bash
docker build -f Dockerfile.routellm -t routellm-server .
docker run -p 6060:6060 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e ANYSCALE_API_KEY=$ANYSCALE_API_KEY \
  routellm-server
```

### Cloud Deployment

**AWS ECS/Fargate:**
```bash
# Use the Dockerfile above
# Set environment variables in task definition
# Use Application Load Balancer for HTTPS
```

**Fly.io:**
```bash
fly launch --image routellm-server
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set ANYSCALE_API_KEY=...
```

**Railway:**
```bash
# Connect GitHub repo
# Set environment variables in dashboard
# Auto-deploys on push
```

### Security Considerations

1. **Never commit API keys** to version control
2. **Use HTTPS** in production (terminate SSL at load balancer)
3. **Implement rate limiting** at application layer
4. **Monitor usage** to detect anomalies
5. **Rotate API keys** regularly

## Advanced Topics

### Custom Router Training

Train a custom router on your own data:

```bash
# Prepare dataset (JSONL format with prompts and labels)
# Each line: {"prompt": "...", "label": 0 or 1}

# Train router
python -m routellm.train \
  --data train.jsonl \
  --output custom-router.pkl

# Use custom router
python -m routellm.openai_server \
  --routers custom \
  --router-path custom-router.pkl \
  ...
```

### Multi-Region Setup

Deploy RouteLLM in multiple regions for low latency:

```bash
# Region 1 (US East)
AI_ROUTER_BASE_URL=https://router-us-east.example.com

# Region 2 (EU West)
AI_ROUTER_BASE_URL=https://router-eu-west.example.com

# Use geo-routing in your application
```

### Monitoring and Analytics

Track routing decisions:

```bash
# Enable detailed logging
export ROUTELLM_LOG_LEVEL=DEBUG

# Log routing decisions to file
python -m routellm.openai_server ... 2>&1 | tee router.log

# Analyze routing patterns
grep "Routing decision" router.log | awk '{print $NF}' | sort | uniq -c
```

## Further Resources

- **RouteLLM Documentation**: https://github.com/lm-sys/RouteLLM
- **OpenAI API Reference**: https://platform.openai.com/docs/api-reference
- **Anthropic Claude Docs**: https://docs.anthropic.com/
- **Cost Calculator**: https://llmpricecheck.com/

## Support

If you encounter issues:

1. Check logs: `tail -f router.log`
2. Verify environment: `env | grep AI_`
3. Test health endpoint: `curl http://localhost:6060/health`
4. Review API key permissions
5. Check RouteLLM GitHub issues: https://github.com/lm-sys/RouteLLM/issues

---

**Remember**: RouteLLM is completely optional. The application works perfectly without it (with `AI_ROUTER_ENABLED=false`).
