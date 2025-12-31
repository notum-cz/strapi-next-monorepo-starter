import { NextRequest, NextResponse } from 'next/server';
import { strapiClient } from '@/lib/strapi-client';
import { validateUploadFile } from '@/lib/fact-check';
import { UPLOAD_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';

/**
 * POST /api/upload/gallery/[stage_id]
 * Upload a photo to a stage gallery
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stage_id: string }> }
) {
  const { stage_id } = await params;

  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateUploadFile(
      file,
      UPLOAD_CONFIG.allowedTypes,
      UPLOAD_CONFIG.maxFileSize
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.issues.join(', ') },
        { status: 400 }
      );
    }

    // Get stage to verify it exists
    const stage = await strapiClient.getStageBySlug(stage_id);
    if (!stage) {
      return NextResponse.json(
        { success: false, error: `Stage not found: ${stage_id}` },
        { status: 404 }
      );
    }

    // Upload file to Strapi
    const uploadedFiles = await strapiClient.uploadFile(file);

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.upload.uploadFailed },
        { status: 500 }
      );
    }

    const uploadedFile = uploadedFiles[0];

    // Add file to stage gallery
    await strapiClient.addToGallery(stage.id, uploadedFile.id);

    // If caption provided, update file metadata
    if (caption) {
      // Update file caption via Strapi (this would need to be implemented in strapiClient)
    }

    return NextResponse.json(
      {
        success: true,
        file_id: uploadedFile.id.toString(),
        url: strapiClient.getMediaUrl(uploadedFile),
        thumbnail_url: uploadedFile.formats?.thumbnail?.url
          ? strapiClient.getMediaUrl(uploadedFile.formats.thumbnail.url)
          : undefined,
        message: SUCCESS_MESSAGES.upload.photoUploaded,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.upload.uploadFailed },
      { status: 500 }
    );
  }
}
