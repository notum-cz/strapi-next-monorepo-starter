'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, ZoomIn } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '@/hooks/useUpload';
import { strapiClient } from '@/lib/strapi-client';
import { FEATURES } from '@/lib/constants';
import type { PhotoGalleryProps } from '@/lib/types';

export default function PhotoGallery({ stage_id, photos, isAdmin = false }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const { uploadFile, uploading, progress, error } = useUpload();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!isAdmin || !FEATURES.userUploads) return;

      for (const file of acceptedFiles) {
        await uploadFile(file, stage_id, 'gallery', caption);
      }
      setCaption('');
    },
    [isAdmin, stage_id, caption, uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif'],
    },
    maxSize: 52428800, // 50MB
    disabled: !isAdmin || !FEATURES.userUploads,
  });

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos.length]);

  return (
    <div>
      {/* Upload Zone (Admin Only) */}
      {isAdmin && FEATURES.userUploads && (
        <div className="mb-6">
          <div
            {...getRootProps()}
            className={`upload-zone ${isDragActive ? 'dragging' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-nwk-green mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-nwk-green font-semibold">Drop photos here...</p>
            ) : (
              <>
                <p className="text-gray-700 font-semibold mb-2">
                  Drag photos here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, WebP up to 50MB
                </p>
              </>
            )}
          </div>

          {/* Caption Input */}
          <div className="mt-4">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
              Optional Caption
            </label>
            <input
              id="caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption for uploaded photos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nwk-green focus:border-transparent"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm font-semibold text-nwk-green">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No photos yet</p>
          {isAdmin && FEATURES.userUploads && (
            <p className="text-sm text-gray-400 mt-2">Upload some to get started</p>
          )}
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="photo-thumbnail group relative cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={strapiClient.getMediaUrl(photo)}
                alt={photo.alternativeText || photo.caption || `Photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <span className="text-white text-2xl">←</span>
            </button>
          )}

          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
              aria-label="Next image"
            >
              <span className="text-white text-2xl">→</span>
            </button>
          )}

          <div className="relative max-w-6xl max-h-[90vh] w-full h-full p-8">
            <Image
              src={strapiClient.getMediaUrl(photos[lightboxIndex])}
              alt={photos[lightboxIndex].alternativeText || photos[lightboxIndex].caption || ''}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {photos[lightboxIndex].caption && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg max-w-2xl">
              <p className="text-center">{photos[lightboxIndex].caption}</p>
            </div>
          )}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}

// Add useEffect import
import { useEffect } from 'react';
