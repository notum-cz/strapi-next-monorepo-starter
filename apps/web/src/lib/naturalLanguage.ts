/**
 * Natural Language Command Translator
 * Converts everyday language into agent commands
 * Makes the system accessible to non-technical nonprofit staff
 */

export interface NaturalCommand {
  originalText: string
  intent: string
  agent: string
  action: string
  parameters: Record<string, any>
  confidence: number
  simplifiedExplanation: string
}

// Simple language patterns that map to agent capabilities
const COMMAND_PATTERNS = [
  // Sirius - Planning & Orchestration
  {
    pattern: /plan (a|an|the)? ?(.+)/i,
    agent: 'Sirius',
    intent: 'plan',
    action: 'create_plan',
    extract: (match: RegExpMatchArray) => ({ task: match[2] }),
    explain: (params: any) => `I'll help plan: ${params.task}`,
  },
  {
    pattern: /(organize|coordinate) (.+)/i,
    agent: 'Sirius',
    intent: 'orchestrate',
    action: 'orchestrate_task',
    extract: (match: RegExpMatchArray) => ({ task: match[2] }),
    explain: (params: any) => `I'll coordinate this work: ${params.task}`,
  },

  // Andromeda - Code Generation
  {
    pattern: /(create|build|make) (a|an)? ?(.+)/i,
    agent: 'Andromeda',
    intent: 'generate',
    action: 'generate_code',
    extract: (match: RegExpMatchArray) => ({ specification: match[3] }),
    explain: (params: any) => `I'll build: ${params.specification}`,
  },
  {
    pattern: /fix (the)? ?(.+)/i,
    agent: 'Andromeda',
    intent: 'debug',
    action: 'fix_issue',
    extract: (match: RegExpMatchArray) => ({ issue: match[2] }),
    explain: (params: any) => `I'll fix this problem: ${params.issue}`,
  },

  // Vega - Testing & Validation
  {
    pattern: /test (the)? ?(.+)/i,
    agent: 'Vega',
    intent: 'test',
    action: 'run_test',
    extract: (match: RegExpMatchArray) => ({ target: match[2] }),
    explain: (params: any) => `I'll test: ${params.target}`,
  },
  {
    pattern: /(check|verify) (if|that)? ?(.+)/i,
    agent: 'Vega',
    intent: 'verify',
    action: 'verify',
    extract: (match: RegExpMatchArray) => ({ target: match[3] }),
    explain: (params: any) => `I'll check: ${params.target}`,
  },

  // Rigel - Research
  {
    pattern: /(research|find|search for|look up) (.+)/i,
    agent: 'Rigel',
    intent: 'research',
    action: 'research_topic',
    extract: (match: RegExpMatchArray) => ({ topic: match[2] }),
    explain: (params: any) => `I'll research: ${params.topic}`,
  },
  {
    pattern: /what (is|are) (.+)/i,
    agent: 'Rigel',
    intent: 'research',
    action: 'research_topic',
    extract: (match: RegExpMatchArray) => ({ topic: match[2] }),
    explain: (params: any) => `I'll find information about: ${params.topic}`,
  },

  // Cassiopeia - Communication
  {
    pattern: /(explain|tell me about) (.+)/i,
    agent: 'Cassiopeia',
    intent: 'explain',
    action: 'explain_concept',
    extract: (match: RegExpMatchArray) => ({ concept: match[2] }),
    explain: (params: any) => `I'll explain: ${params.concept}`,
  },
  {
    pattern: /summarize (.+)/i,
    agent: 'Cassiopeia',
    intent: 'summarize',
    action: 'create_summary',
    extract: (match: RegExpMatchArray) => ({ content: match[1] }),
    explain: (params: any) => `I'll summarize: ${params.content}`,
  },

  // Betelgeuse - Deployment & DevOps
  {
    pattern: /deploy (.+)/i,
    agent: 'Betelgeuse',
    intent: 'deploy',
    action: 'deploy_service',
    extract: (match: RegExpMatchArray) => ({ service: match[1] }),
    explain: (params: any) => `I'll deploy: ${params.service}`,
  },
  {
    pattern: /(start|launch|run) (.+)/i,
    agent: 'Betelgeuse',
    intent: 'start',
    action: 'start_service',
    extract: (match: RegExpMatchArray) => ({ service: match[2] }),
    explain: (params: any) => `I'll start: ${params.service}`,
  },

  // Nonprofit-specific commands
  {
    pattern: /show (me)? ?(impact|donation|donor) (stats|data|information)/i,
    agent: 'Rigel',
    intent: 'analytics',
    action: 'get_impact_data',
    extract: () => ({ type: 'impact' }),
    explain: () => `I'll show you the latest impact statistics`,
  },
  {
    pattern: /track (a)? ?donation (from|of) (.+)/i,
    agent: 'Betelgeuse',
    intent: 'track',
    action: 'track_donation',
    extract: (match: RegExpMatchArray) => ({ donor: match[3] }),
    explain: (params: any) => `I'll track this donation from: ${params.donor}`,
  },
  {
    pattern: /update (the)? ?(website|site) (.+)/i,
    agent: 'Andromeda',
    intent: 'update',
    action: 'update_content',
    extract: (match: RegExpMatchArray) => ({ update: match[3] }),
    explain: (params: any) => `I'll update the website: ${params.update}`,
  },
]

/**
 * Translate natural language into structured command
 */
export function translateCommand(text: string): NaturalCommand {
  const cleanText = text.trim()

  // Try to match against known patterns
  for (const pattern of COMMAND_PATTERNS) {
    const match = cleanText.match(pattern.pattern)
    if (match) {
      const parameters = pattern.extract(match)
      return {
        originalText: cleanText,
        intent: pattern.intent,
        agent: pattern.agent,
        action: pattern.action,
        parameters,
        confidence: 0.9,
        simplifiedExplanation: pattern.explain(parameters),
      }
    }
  }

  // Fallback: Route to Sirius for general requests
  return {
    originalText: cleanText,
    intent: 'general',
    agent: 'Sirius',
    action: 'handle_request',
    parameters: { request: cleanText },
    confidence: 0.5,
    simplifiedExplanation: `I'll figure out the best way to help with: ${cleanText}`,
  }
}

/**
 * Get example commands for users
 */
export function getExampleCommands() {
  return [
    {
      category: 'Planning',
      examples: [
        'Plan a new donation campaign',
        'Organize our volunteer schedule',
        'Coordinate the fundraising event',
      ],
    },
    {
      category: 'Building',
      examples: [
        'Create a donation thank you page',
        'Build a volunteer signup form',
        'Make a newsletter template',
      ],
    },
    {
      category: 'Testing',
      examples: [
        'Test the donation form',
        'Check if the website works on mobile',
        'Verify all links are working',
      ],
    },
    {
      category: 'Research',
      examples: [
        'Research best practices for nonprofit websites',
        'Find information about grant opportunities',
        'Look up volunteer management software',
      ],
    },
    {
      category: 'Communication',
      examples: [
        'Explain our impact metrics',
        'Summarize this month\'s donations',
        'Tell me about our top donors',
      ],
    },
    {
      category: 'Deployment',
      examples: [
        'Deploy the updated website',
        'Start the donation tracking service',
        'Launch the volunteer portal',
      ],
    },
    {
      category: 'Nonprofit Specific',
      examples: [
        'Show me impact stats',
        'Track donation from John Smith',
        'Update the website with new project',
      ],
    },
  ]
}

/**
 * Explain what an agent does in simple terms
 */
export function explainAgent(agentName: string): string {
  const explanations: Record<string, string> = {
    Sirius: 'I help you plan and organize projects. Think of me as your project manager.',
    Andromeda: 'I build things for you - websites, forms, features. I\'m your developer.',
    Vega: 'I test everything to make sure it works perfectly. I\'m your quality checker.',
    Rigel: 'I find information and research topics for you. I\'m your researcher.',
    Cassiopeia: 'I explain things clearly and help with communication. I\'m your translator.',
    Betelgeuse: 'I launch and manage your services. I\'m your IT person.',
  }

  return explanations[agentName] || 'I help you with various tasks!'
}
