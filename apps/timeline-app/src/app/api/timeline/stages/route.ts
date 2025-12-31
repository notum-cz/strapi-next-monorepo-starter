import { NextRequest, NextResponse } from 'next/server';
import { strapiClient } from '@/lib/strapi-client';
import { MOCK_STAGES } from '@/lib/mock-data';

/**
 * GET /api/timeline/stages
 * Fetch all timeline stages (uses mock data if Strapi is unavailable)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const include = searchParams.get('include') || 'full';

    // Check if Strapi is configured
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    const strapiToken = process.env.STRAPI_API_TOKEN;

    // Use mock data if Strapi is not configured
    if (!strapiUrl || !strapiToken || strapiUrl === 'http://localhost:1337') {
      console.log('Using mock data (Strapi not configured)');
      return NextResponse.json(
        {
          data: MOCK_STAGES,
          meta: {
            pagination: {
              page: 1,
              pageSize: 100,
              pageCount: 1,
              total: MOCK_STAGES.length,
            },
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Data-Source': 'mock',
          },
        }
      );
    }

    const populate =
      include === 'full'
        ? ['featured_image', 'gallery_images', 'documents', 'people', 'metrics']
        : ['featured_image'];

    const response = await strapiClient.getStages({
      populate,
      sort: ['date_range:asc'],
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Data-Source': 'strapi',
      },
    });
  } catch (error) {
    console.error('Error fetching timeline stages, falling back to mock data:', error);

    // Fallback to mock data on error
    return NextResponse.json(
      {
        data: MOCK_STAGES,
        meta: {
          pagination: {
            page: 1,
            pageSize: 100,
            pageCount: 1,
            total: MOCK_STAGES.length,
          },
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60',
          'X-Data-Source': 'mock-fallback',
        },
      }
    );
  }
}
