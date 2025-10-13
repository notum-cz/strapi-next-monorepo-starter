# Agent Cards

Agent cards define the contracts and capabilities for A2A (Agent-to-Agent) communication in Trail Mixx.

## Available Agents

### MixerAgent
Automated DJ that creates playlists based on rotation policies and clock configurations.

### CopyAgent
Generates promotional copy and social media content for shows and events.

### TTS-Polly
Text-to-speech agent using AWS Polly for voiceovers and announcements.

### Scheduler
Manages show scheduling and time-slot allocations.

### Analytics
Tracks playback metrics, audience engagement, and generates reports.

### Directory
Maintains catalog of tracks, artists, and metadata.

### RAG
Retrieval-Augmented Generation for content recommendations and discovery.

## Card Schema

Each agent card follows this structure:

```json
{
  "agentId": "unique-agent-id",
  "name": "AgentName",
  "version": "1.0.0",
  "description": "What this agent does",
  "capabilities": ["capability1", "capability2"],
  "inputs": {
    "paramName": {
      "type": "string|number|object|array",
      "required": true|false,
      "description": "Parameter description"
    }
  },
  "outputs": {
    "resultName": {
      "type": "string|number|object|array",
      "description": "Output description"
    }
  },
  "endpoints": {
    "actionName": "/api/path"
  }
}
```

## Auto-Onboarding

Agents placed in this directory are automatically discovered by the `auto-onboard.js` runtime and registered for use.

## Usage

Agents can be called using the unified interface:

```javascript
const result = await callAgent('mixer-agent-v1', {
  clock: 'seattle-top-hour',
  rotation: 'standard',
  locale: 'en',
  hour: 12
});
```
