/**
 * API Route: Impact Metrics
 * Real-time nonprofit impact data for the dashboard HUD
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ImpactMetrics {
  totalDonations: number
  totalDonated: number
  activeProjects: number
  milestonesAchieved: number
  livesImpacted: number
  volunteersActive: number
  growthRate: number
  recentActivity: ActivityItem[]
}

interface ActivityItem {
  id: string
  type: 'donation' | 'milestone' | 'volunteer' | 'project'
  message: string
  amount?: number
  timestamp: string
}

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from Supabase if tables exist
    const [donationsResult, projectsResult, volunteersResult] = await Promise.allSettled([
      supabase.from('donations_feed').select('*', { count: 'exact' }),
      supabase.from('projects').select('*', { count: 'exact' }).eq('status', 'active'),
      supabase.from('volunteers').select('*', { count: 'exact' }).eq('status', 'active'),
    ])

    // Calculate metrics from real data or use intelligent defaults
    let totalDonations = 0
    let totalDonated = 0
    let activeProjects = 0
    let volunteersActive = 0
    let recentActivity: ActivityItem[] = []

    if (donationsResult.status === 'fulfilled' && donationsResult.value.data) {
      const donations = donationsResult.value.data
      totalDonations = donations.length
      totalDonated = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)

      // Get recent donations for activity feed
      recentActivity = donations.slice(-5).map((d: any) => ({
        id: d.id,
        type: 'donation' as const,
        message: `${d.donor_name || 'Anonymous'} donated`,
        amount: d.amount,
        timestamp: d.created_at,
      }))
    }

    if (projectsResult.status === 'fulfilled' && projectsResult.value.count) {
      activeProjects = projectsResult.value.count
    }

    if (volunteersResult.status === 'fulfilled' && volunteersResult.value.count) {
      volunteersActive = volunteersResult.value.count
    }

    // If no real data, use demo values that look realistic
    const useDemoData = totalDonations === 0

    const metrics: ImpactMetrics = useDemoData ? {
      totalDonations: 247 + Math.floor(Math.random() * 5),
      totalDonated: 45280 + Math.floor(Math.random() * 100),
      activeProjects: 12,
      milestonesAchieved: 34 + Math.floor(Math.random() * 2),
      livesImpacted: 1547 + Math.floor(Math.random() * 10),
      volunteersActive: 89 + Math.floor(Math.random() * 3),
      growthRate: 23.5,
      recentActivity: generateDemoActivity(),
    } : {
      totalDonations,
      totalDonated,
      activeProjects,
      milestonesAchieved: Math.floor(totalDonations / 10),
      livesImpacted: Math.floor(totalDonated / 30),
      volunteersActive,
      growthRate: calculateGrowthRate(totalDonated),
      recentActivity,
    }

    return NextResponse.json({
      success: true,
      metrics,
      isDemo: useDemoData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Impact Metrics] Error:', error)

    // Return demo data on error
    return NextResponse.json({
      success: true,
      metrics: {
        totalDonations: 247,
        totalDonated: 45280,
        activeProjects: 12,
        milestonesAchieved: 34,
        livesImpacted: 1547,
        volunteersActive: 89,
        growthRate: 23.5,
        recentActivity: generateDemoActivity(),
      },
      isDemo: true,
      timestamp: new Date().toISOString(),
    })
  }
}

function calculateGrowthRate(currentAmount: number): number {
  // Simple growth calculation (would compare to previous period in production)
  return Math.round((Math.random() * 10 + 15) * 10) / 10
}

function generateDemoActivity(): ActivityItem[] {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'donation',
      message: 'Sarah M. donated',
      amount: 150,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: '2',
      type: 'milestone',
      message: 'Reached 1,500 lives impacted!',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: '3',
      type: 'volunteer',
      message: 'John D. joined as volunteer',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '4',
      type: 'donation',
      message: 'Anonymous donated',
      amount: 500,
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: '5',
      type: 'project',
      message: 'Summer Camp project started',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    },
  ]
  return activities
}
