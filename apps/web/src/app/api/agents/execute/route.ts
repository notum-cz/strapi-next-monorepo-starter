/**
 * API Route: Execute Agent Command
 * Handles voice commands and natural language requests
 * Routes to appropriate stellar agent
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent, action, parameters } = body

    // Validate request
    if (!agent || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: agent, action' },
        { status: 400 }
      )
    }

    // Log the command (for observability)
    console.log('[Agent Execute]', {
      timestamp: new Date().toISOString(),
      agent,
      action,
      parameters,
    })

    // Route to stellar agents service
    const stellarAgentsUrl = process.env.STELLAR_AGENTS_URL || 'http://localhost:3004'

    const response = await fetch(`${stellarAgentsUrl}/api/v1/agents/${agent}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        parameters,
      }),
    })

    if (!response.ok) {
      // If stellar agents service is down, return simulated response
      console.warn(`[Agent Execute] Stellar agents service unavailable, using simulated response`)

      return NextResponse.json({
        success: true,
        agent,
        action,
        result: {
          message: `✅ I understand! I would ${action.replace(/_/g, ' ')} for you.`,
          details: `Agent ${agent} is ready to help. (Stellar Agents service is offline - this is a simulated response)`,
          parameters,
        },
        simulated: true,
      })
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      agent,
      action,
      result,
      simulated: false,
    })
  } catch (error) {
    console.error('[Agent Execute] Error:', error)

    // Graceful fallback for non-technical users
    return NextResponse.json(
      {
        error: 'I had trouble processing that request. Please try again or rephrase your command.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// For GET requests, return helpful examples
export async function GET() {
  return NextResponse.json({
    message: 'Voice-Activated Agent API',
    description: 'Natural language commands for non-technical nonprofit staff',
    examples: [
      {
        naturalLanguage: 'Plan a new donation campaign',
        translatesTo: {
          agent: 'Sirius',
          action: 'create_plan',
          parameters: { task: 'new donation campaign' },
        },
      },
      {
        naturalLanguage: 'Test the donation form',
        translatesTo: {
          agent: 'Vega',
          action: 'run_test',
          parameters: { target: 'donation form' },
        },
      },
      {
        naturalLanguage: 'Show me impact stats',
        translatesTo: {
          agent: 'Rigel',
          action: 'get_impact_data',
          parameters: { type: 'impact' },
        },
      },
    ],
    agents: [
      { name: 'Sirius', role: 'Project Manager - Plans and organizes' },
      { name: 'Andromeda', role: 'Developer - Builds websites and features' },
      { name: 'Vega', role: 'Quality Checker - Tests everything' },
      { name: 'Rigel', role: 'Researcher - Finds information' },
      { name: 'Cassiopeia', role: 'Communicator - Explains clearly' },
      { name: 'Betelgeuse', role: 'IT Specialist - Launches services' },
    ],
  })
}
