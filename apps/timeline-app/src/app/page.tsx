'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import TimelineContainer from '@/components/timeline/TimelineContainer';
import { API_ENDPOINTS } from '@/lib/constants';

export default function TimelinePage() {
  return (
    <CopilotKit
      runtimeUrl={API_ENDPOINTS.copilot}
      // The copilot tools and system prompt are configured server-side
    >
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
                <button className="btn btn-secondary text-sm">
                  About the Project
                </button>
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
                &copy; {new Date().getFullYear()} New World Kids. Built with{' '}
                <a
                  href="https://copilotkit.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-nwk-green hover:underline"
                >
                  CopilotKit
                </a>
              </p>
            </div>
          </div>
        </footer>

        {/* CopilotKit Sidebar for Chat */}
        <CopilotSidebar
          defaultOpen={false}
          labels={{
            title: 'Ask About the Timeline',
            initial: 'How can I help you learn about New World Kids?',
          }}
        />
      </div>
    </CopilotKit>
  );
}
