'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStageData } from '@/hooks/useStageData';
import { MODAL_TABS } from '@/lib/constants';
import PhotoGallery from '../panels/PhotoGallery';
import DocumentViewer from '../panels/DocumentViewer';
import PeoplePanel from '../panels/PeoplePanel';
import ChatPanel from '../panels/ChatPanel';
import MetricsPanel from '../panels/MetricsPanel';
import type { StageModalProps } from '@/lib/types';

export default function StageModal({ stage_id, initial_tab = 'gallery', isOpen, onClose }: StageModalProps) {
  const [activeTab, setActiveTab] = useState(initial_tab);
  const { stage, gallery, documents, people, metrics, isLoading } = useStageData(stage_id);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {isLoading ? (
                  <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <h2 id="modal-title" className="text-3xl font-bold text-nwk-dark mb-2">
                      {stage?.title}
                    </h2>
                    <p className="text-sm text-gray-600">{stage?.date_range}</p>
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
              <div className="flex gap-1 overflow-x-auto">
                {MODAL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                  >
                    <span className="mr-2" role="img" aria-label={tab.label}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-nwk-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading stage details...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'gallery' && (
                <PhotoGallery stage_id={stage_id} photos={gallery} />
              )}
              {activeTab === 'documents' && (
                <DocumentViewer documents={documents} stage_id={stage_id} />
              )}
              {activeTab === 'people' && (
                <PeoplePanel people={people} stage_id={stage_id} />
              )}
              {activeTab === 'chat' && (
                <ChatPanel stage_id={stage_id} />
              )}
              {activeTab === 'metrics' && (
                <MetricsPanel metrics={metrics} stage_id={stage_id} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}?stage=${stage_id}`;
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
              }}
              className="btn btn-primary"
            >
              Share This Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
