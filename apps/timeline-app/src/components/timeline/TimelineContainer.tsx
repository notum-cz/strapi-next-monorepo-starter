'use client';

import { useState, useEffect, useRef } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import StageCard from './StageCard';
import StageModal from '../modals/StageModal';

export default function TimelineContainer() {
  const { stages, isLoading, isError } = useTimeline();
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < stages.length - 1) {
        setCurrentIndex(currentIndex + 1);
        scrollToCard(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        scrollToCard(currentIndex - 1);
      } else if (e.key === 'Enter' && stages[currentIndex]) {
        setSelectedStageId(stages[currentIndex].stage_id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, stages]);

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cards = scrollContainerRef.current.children;
      if (cards[index]) {
        (cards[index] as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  };

  const handleCardClick = (stageId: string, index: number) => {
    setCurrentIndex(index);
    setSelectedStageId(stageId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nwk-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load timeline</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No timeline stages found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto pb-2">
          {stages.map((stage, index) => (
            <div key={stage.stage_id} className="flex items-center gap-2 whitespace-nowrap">
              <button
                onClick={() => {
                  setCurrentIndex(index);
                  scrollToCard(index);
                }}
                className={`hover:text-nwk-green transition-colors ${
                  index === currentIndex ? 'text-nwk-green font-semibold' : ''
                }`}
              >
                {stage.title}
              </button>
              {index < stages.length - 1 && (
                <span className="text-gray-400">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility hint */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <p className="text-xs text-gray-500 italic">
          Use arrow keys to navigate cards, tab to focus, enter to explore
        </p>
      </div>

      {/* Timeline Scroll Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="timeline-scroll flex gap-6 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-auto snap-x snap-mandatory"
          style={{ scrollPaddingLeft: '2rem' }}
        >
          {stages.map((stage, index) => (
            <div
              key={stage.stage_id}
              className="snap-center flex-shrink-0 w-[320px] md:w-[380px]"
            >
              <StageCard
                stage={stage}
                layout="detailed"
                onClick={() => handleCardClick(stage.stage_id, index)}
                isFocused={index === currentIndex}
              />
            </div>
          ))}
        </div>

        {/* Scroll shadows */}
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-nwk-light to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-nwk-light to-transparent pointer-events-none"></div>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} of {stages.length}
          </span>
          <div className="flex gap-1">
            {stages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  scrollToCard(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-nwk-green w-4'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to stage ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stage Modal */}
      {selectedStageId && (
        <StageModal
          stage_id={selectedStageId}
          isOpen={true}
          onClose={() => setSelectedStageId(null)}
        />
      )}
    </div>
  );
}
