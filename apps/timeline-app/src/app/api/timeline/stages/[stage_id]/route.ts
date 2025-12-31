import { NextRequest, NextResponse } from 'next/server';
import { strapiClient } from '@/lib/strapi-client';
import { MOCK_STAGES, MOCK_PEOPLE, MOCK_METRICS, MOCK_DOCUMENTS } from '@/lib/mock-data';
import type { StageDetailsResponse } from '@/lib/types';

/**
 * GET /api/timeline/stages/[stage_id]
 * Fetch detailed stage data including all relations (uses mock data if Strapi is unavailable)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { stage_id: string } }
) {
  try {
    const { stage_id } = params;

    // Check if Strapi is configured
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    const strapiToken = process.env.STRAPI_API_TOKEN;

    // Use mock data if Strapi is not configured
    if (!strapiUrl || !strapiToken || strapiUrl === 'http://localhost:1337') {
      console.log(`Using mock data for stage: ${stage_id}`);

      const stage = MOCK_STAGES.find((s) => s.stage_id === stage_id);

      if (!stage) {
        return NextResponse.json(
          { error: `Stage not found: ${stage_id}` },
          { status: 404 }
        );
      }

      const response: StageDetailsResponse = {
        stage,
        gallery: stage.gallery_images || [],
        documents: MOCK_DOCUMENTS[stage_id] || [],
        people: MOCK_PEOPLE[stage_id] || [],
        metrics: MOCK_METRICS[stage_id] || [],
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
          'X-Data-Source': 'mock',
        },
      });
    }

    // Fetch stage and all related data in parallel
    const [stage, gallery, documents, people, metrics] = await Promise.all([
      strapiClient.getStageBySlug(stage_id),
      strapiClient.getStageGallery(stage_id),
      strapiClient.getStageDocuments(stage_id),
      strapiClient.getStagePeople(stage_id),
      strapiClient.getStageMetrics(stage_id),
    ]);

    if (!stage) {
      return NextResponse.json(
        { error: `Stage not found: ${stage_id}` },
        { status: 404 }
      );
    }

    const response: StageDetailsResponse = {
      stage,
      gallery,
      documents,
      people,
      metrics,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
        'X-Data-Source': 'strapi',
      },
    });
  } catch (error) {
    console.error(`Error fetching stage ${params.stage_id}, falling back to mock data:`, error);

    // Fallback to mock data
    const stage = MOCK_STAGES.find((s) => s.stage_id === params.stage_id);

    if (!stage) {
      return NextResponse.json(
        { error: `Stage not found: ${params.stage_id}` },
        { status: 404 }
      );
    }

    const response: StageDetailsResponse = {
      stage,
      gallery: stage.gallery_images || [],
      documents: MOCK_DOCUMENTS[params.stage_id] || [],
      people: MOCK_PEOPLE[params.stage_id] || [],
      metrics: MOCK_METRICS[params.stage_id] || [],
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60',
        'X-Data-Source': 'mock-fallback',
      },
    });
  }
}
