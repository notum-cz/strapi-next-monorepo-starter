'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { STAGE_STATUS } from '@/lib/constants';
import { strapiClient } from '@/lib/strapi-client';
import type { StageCardProps } from '@/lib/types';

export default function StageCard({ stage, layout = 'detailed', onClick, isFocused }: StageCardProps & { isFocused?: boolean }) {
  const statusConfig = STAGE_STATUS[stage.status];

  // Get primary metric to display
  const primaryMetric = useMemo(() => {
    if (stage.metrics && stage.metrics.length > 0) {
      return stage.metrics[0];
    }
    return null;
  }, [stage.metrics]);

  // Get featured image URL
  const imageUrl = useMemo(() => {
    if (stage.featured_image) {
      return strapiClient.getMediaUrl(stage.featured_image);
    }
    return '/placeholder-image.jpg'; // Fallback image
  }, [stage.featured_image]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      className={`stage-card overflow-hidden ${isFocused ? 'ring-4 ring-nwk-green' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Explore ${stage.title}`}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className="status-badge"
          style={{
            backgroundColor: statusConfig.color,
            color: statusConfig.textColor,
          }}
          title={statusConfig.description}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Featured Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src={imageUrl}
          alt={stage.featured_image?.alternativeText || stage.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-110"
          sizes="(max-width: 768px) 320px, 380px"
        />
        {/* Completion overlay for in-progress stages */}
        {stage.status === 'STUBBED' && stage.completion_percentage && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
            <div className="flex items-center justify-between">
              <span>{stage.completion_percentage}% Complete</span>
              <div className="w-20 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-nwk-green rounded-full"
                  style={{ width: `${stage.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title & Date */}
        <h3 className="text-xl font-bold text-nwk-dark mb-1">{stage.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{stage.date_range}</p>

        {/* Description */}
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {stage.description}
        </p>

        {/* Metric Display */}
        {primaryMetric && (
          <div className="bg-nwk-light rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="metric icon">
                {primaryMetric.icon}
              </span>
              <div className="flex-1">
                <p className="text-xs text-gray-600">{primaryMetric.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {primaryMetric.start_value}
                  </span>
                  <span className="text-xs text-gray-400">→</span>
                  <span className="text-lg font-bold text-nwk-green">
                    {primaryMetric.end_value}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="btn btn-primary flex-1 text-sm py-2"
            aria-label={`Explore ${stage.title} in detail`}
          >
            Explore Stage
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality would go here
              const shareUrl = `${window.location.origin}?stage=${stage.stage_id}`;
              navigator.clipboard.writeText(shareUrl);
            }}
            className="btn btn-secondary px-4 text-sm py-2"
            aria-label={`Share ${stage.title}`}
            title="Copy share link"
          >
            Share
          </button>
        </div>
      </div>

      {/* Gallery Preview (if layout is detailed and gallery exists) */}
      {layout === 'detailed' && stage.gallery_images && stage.gallery_images.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">
              {stage.gallery_images.length} photos
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {stage.gallery_images.slice(0, 4).map((image) => (
              <div
                key={image.id}
                className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden"
              >
                <Image
                  src={strapiClient.getMediaUrl(image)}
                  alt={image.alternativeText || ''}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ))}
            {stage.gallery_images.length > 4 && (
              <div className="w-16 h-16 flex-shrink-0 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                +{stage.gallery_images.length - 4}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
