'use client';

import { useState } from 'react';
import { Download, ExternalLink, FileText, Video, Image as ImageIcon } from 'lucide-react';
import { DOCUMENT_TYPES } from '@/lib/constants';
import { strapiClient } from '@/lib/strapi-client';
import type { DocumentViewerProps } from '@/lib/types';

export default function DocumentViewer({ documents, stage_id, isAdmin = false }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Photo':
        return <ImageIcon className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
  };

  const handleDownload = async (doc: any) => {
    if (!doc.file) return;
    const url = strapiClient.getMediaUrl(doc.file);
    window.open(url, '_blank');
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No documents yet</p>
        {isAdmin && (
          <p className="text-sm text-gray-400 mt-2">Upload documents to share with your community</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Document List */}
      <div className="space-y-4">
        {documents.map((doc) => {
          const docTypeConfig = DOCUMENT_TYPES[doc.document_type];
          const isVideo = doc.document_type === 'Video';
          const isPdf = doc.file?.mime === 'application/pdf';

          return (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: docTypeConfig.color + '20' }}
                >
                  <span className="text-2xl">{docTypeConfig.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{doc.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{doc.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">{doc.document_type}</span>
                        {doc.file && <span>{getFileSize(doc.file.size)}</span>}
                        {doc.published_at && (
                          <span>
                            {new Date(doc.published_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isVideo ? (
                        <button
                          onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                          className="btn btn-secondary px-3 py-2 text-sm"
                        >
                          {selectedDoc === doc.id ? 'Hide' : 'Play'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="btn btn-secondary px-3 py-2 text-sm flex items-center gap-1"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {isPdf && (
                            <button
                              onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                              className="btn btn-primary px-3 py-2 text-sm flex items-center gap-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {selectedDoc === doc.id ? 'Hide' : 'View'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Embedded Viewer */}
                  {selectedDoc === doc.id && doc.file && (
                    <div className="mt-4">
                      {isVideo ? (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <video
                            src={strapiClient.getMediaUrl(doc.file)}
                            controls
                            className="w-full h-full"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : isPdf ? (
                        <div className="border rounded-lg overflow-hidden">
                          <iframe
                            src={strapiClient.getMediaUrl(doc.file)}
                            className="w-full h-[600px]"
                            title={doc.title}
                          />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
