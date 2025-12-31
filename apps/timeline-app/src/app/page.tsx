'use client';

import TimelineContainer from '@/components/timeline/TimelineContainer';

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-nwk-light">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-nwk-dark">
                New World Kids
              </h1>
              <p className="text-sm text-gray-600">
                Proyecto Indigo Azul Journey
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/executiveusa/strapi-template-new-world-kids"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Timeline */}
      <main className="py-8">
        <TimelineContainer />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} New World Kids
            </p>
            <p className="text-xs mt-2 text-gray-500">
              Interactive Timeline - Demo with mock data
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
