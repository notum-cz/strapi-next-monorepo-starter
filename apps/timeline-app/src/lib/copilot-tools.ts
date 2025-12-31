import { strapiClient } from './strapi-client';
import { validateResponse, extractMarkdownSection, createFactCheckedResponse } from './fact-check';
import { PRE_SEEDED_QUESTIONS } from './constants';
import type { CopilotTool, StageDetailsResponse, ChatResponse, ShareResult } from './types';
import { readFileSync } from 'fs';
import { join } from 'path';

// Cache for markdown timeline
let timelineMarkdown: string | null = null;

/**
 * Load markdown timeline from file system
 */
async function loadTimelineMarkdown(): Promise<string> {
  if (timelineMarkdown) return timelineMarkdown;

  try {
    const markdownPath = join(process.cwd(), 'public', 'data', 'timeline.md');
    timelineMarkdown = readFileSync(markdownPath, 'utf-8');
    return timelineMarkdown;
  } catch (error) {
    console.error('Failed to load timeline markdown:', error);
    return '';
  }
}

/**
 * CopilotKit Tool Definitions
 * These tools allow the AI to interact with the timeline application
 */

export const COPILOT_TOOLS: CopilotTool[] = [
  // ============================================
  // TOOL 1: Fetch Timeline Data
  // ============================================
  {
    name: 'fetchTimelineData',
    description: 'Fetch all timeline stages and metadata from Strapi CMS',
    input: {
      type: 'object',
      properties: {
        include: {
          type: 'string',
          enum: ['minimal', 'full'],
          description: 'Level of detail to include (minimal = basic info, full = all relations)',
        },
      },
    },
    handler: async (input) => {
      try {
        const markdown = await loadTimelineMarkdown();

        const populate = input.include === 'full'
          ? ['featured_image', 'gallery_images', 'documents', 'people', 'metrics']
          : ['featured_image'];

        const response = await strapiClient.getStages({ populate });

        return {
          stages: response.data,
          markdown_source: input.include === 'full' ? markdown : 'Use fetchStageDetails for full context',
          total: response.meta?.pagination?.total || response.data.length,
        };
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        throw new Error('Failed to fetch timeline data');
      }
    },
  },

  // ============================================
  // TOOL 2: Fetch Stage Details
  // ============================================
  {
    name: 'fetchStageDetails',
    description: 'Fetch full details for a specific stage including images, documents, people, and metrics',
    input: {
      type: 'object',
      properties: {
        stage_id: {
          type: 'string',
          description: 'Stage identifier (e.g., "season-1", "prologue")',
        },
      },
      required: ['stage_id'],
    },
    handler: async (input): Promise<StageDetailsResponse> => {
      try {
        const { stage_id } = input;

        // Fetch stage from Strapi
        const stage = await strapiClient.getStageBySlug(stage_id);
        if (!stage) {
          throw new Error(`Stage not found: ${stage_id}`);
        }

        // Fetch related data
        const [gallery, documents, people, metrics] = await Promise.all([
          strapiClient.getStageGallery(stage_id),
          strapiClient.getStageDocuments(stage_id),
          strapiClient.getStagePeople(stage_id),
          strapiClient.getStageMetrics(stage_id),
        ]);

        // Load markdown for fact-checking context
        const markdown = await loadTimelineMarkdown();
        const markdownExcerpt = extractMarkdownSection(markdown, stage_id);

        return {
          stage,
          gallery,
          documents,
          people,
          metrics,
          markdown_context: markdownExcerpt,
        } as any;
      } catch (error) {
        console.error('Error fetching stage details:', error);
        throw new Error(`Failed to fetch stage details for ${input.stage_id}`);
      }
    },
  },

  // ============================================
  // TOOL 3: Upload Photo
  // ============================================
  {
    name: 'uploadPhoto',
    description: 'Handle file upload for a stage gallery (admin only)',
    input: {
      type: 'object',
      properties: {
        stage_id: {
          type: 'string',
          description: 'Stage identifier',
        },
        file: {
          type: 'string',
          description: 'File reference or data URL',
        },
        caption: {
          type: 'string',
          description: 'Optional caption for the photo',
        },
      },
      required: ['stage_id', 'file'],
    },
    handler: async (input) => {
      // This would be handled by the upload API route
      // The copilot tool would trigger the API call
      return {
        success: false,
        error: 'File upload must be handled through the upload API endpoint',
        endpoint: `/api/upload/gallery/${input.stage_id}`,
      };
    },
  },

  // ============================================
  // TOOL 4: Generate Chat Response
  // ============================================
  {
    name: 'generateChatResponse',
    description: 'Answer a user question about a stage using timeline data and Strapi content',
    input: {
      type: 'object',
      properties: {
        stage_id: {
          type: 'string',
          description: 'Stage identifier',
        },
        question: {
          type: 'string',
          description: 'User question',
        },
        context: {
          type: 'string',
          description: 'Markdown excerpt from timeline for fact-checking',
        },
      },
      required: ['stage_id', 'question'],
    },
    handler: async (input): Promise<ChatResponse> => {
      try {
        const { stage_id, question, context } = input;

        // Fetch stage details
        const stageDetails = await strapiClient.getStageBySlug(stage_id);
        if (!stageDetails) {
          return {
            response: `I couldn't find information about ${stage_id}. This stage may not be documented yet.`,
            sources: [],
            context_used: [],
          };
        }

        // Load markdown for fact-checking
        const markdown = await loadTimelineMarkdown();
        const markdownExcerpt = context || extractMarkdownSection(markdown, stage_id);

        // Generate response based on available data
        // In a real implementation, this would call the CopilotKit LLM
        // For now, return a structured response template
        const response = `Based on the ${stageDetails.title} documentation: ${markdownExcerpt.substring(0, 300)}...`;

        // Validate response
        const validation = await validateResponse(stage_id, response, markdown);

        if (!validation.valid) {
          console.warn('Response validation failed:', validation.issues);
        }

        return {
          response,
          sources: [
            `${stageDetails.title} Timeline Documentation`,
            'Strapi CMS Data',
          ],
          context_used: [markdownExcerpt.substring(0, 200)],
        };
      } catch (error) {
        console.error('Error generating chat response:', error);
        return {
          response: 'I encountered an error processing your question. Please try again.',
          sources: [],
          context_used: [],
        };
      }
    },
  },

  // ============================================
  // TOOL 5: Share Stage
  // ============================================
  {
    name: 'shareStage',
    description: 'Generate share link, social preview, and embed code for a stage',
    input: {
      type: 'object',
      properties: {
        stage_id: {
          type: 'string',
          description: 'Stage identifier',
        },
        share_type: {
          type: 'string',
          enum: ['link', 'social', 'embed', 'email'],
          description: 'Type of share output to generate',
        },
      },
      required: ['stage_id', 'share_type'],
    },
    handler: async (input): Promise<ShareResult> => {
      try {
        const { stage_id, share_type } = input;
        const stage = await strapiClient.getStageBySlug(stage_id);

        if (!stage) {
          throw new Error(`Stage not found: ${stage_id}`);
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const shareUrl = `${baseUrl}?stage=${stage_id}`;

        const result: ShareResult = {
          url: shareUrl,
          og_title: `${stage.title} - New World Kids Timeline`,
          og_description: stage.description.substring(0, 160),
          og_image: stage.featured_image ? strapiClient.getMediaUrl(stage.featured_image) : undefined,
        };

        if (share_type === 'embed') {
          result.embed_code = `<iframe src="${shareUrl}" width="100%" height="600px" frameborder="0" allowfullscreen></iframe>`;
        }

        return result;
      } catch (error) {
        console.error('Error generating share data:', error);
        throw new Error('Failed to generate share data');
      }
    },
  },

  // ============================================
  // TOOL 6: List People
  // ============================================
  {
    name: 'listPeople',
    description: 'Fetch and list all people involved in a stage',
    input: {
      type: 'object',
      properties: {
        stage_id: {
          type: 'string',
          description: 'Stage identifier',
        },
      },
      required: ['stage_id'],
    },
    handler: async (input) => {
      try {
        const people = await strapiClient.getStagePeople(input.stage_id);
        return { people };
      } catch (error) {
        console.error('Error fetching people:', error);
        return { people: [] };
      }
    },
  },

  // ============================================
  // TOOL 7: Get Metrics
  // ============================================
  {
    name: 'getMetrics',
    description: 'Fetch and visualize metrics for a stage',
    input: {
      type: 'object',
      properties: {
        stage_id: {
          type: 'string',
          description: 'Stage identifier',
        },
      },
      required: ['stage_id'],
    },
    handler: async (input) => {
      try {
        const metrics = await strapiClient.getStageMetrics(input.stage_id);
        return { metrics };
      } catch (error) {
        console.error('Error fetching metrics:', error);
        return { metrics: [] };
      }
    },
  },

  // ============================================
  // TOOL 8: Search Content
  // ============================================
  {
    name: 'searchContent',
    description: 'Full-text search across timeline, documents, and people',
    input: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        filters: {
          type: 'object',
          properties: {
            stage_id: { type: 'string' },
            content_type: { type: 'string' },
          },
        },
      },
      required: ['query'],
    },
    handler: async (input) => {
      try {
        const results = await strapiClient.search(
          input.query,
          input.filters?.content_type ? [input.filters.content_type] : undefined
        );
        return { results };
      } catch (error) {
        console.error('Error searching content:', error);
        return { results: [] };
      }
    },
  },
];

/**
 * System prompt for CopilotKit
 */
export const COPILOT_SYSTEM_PROMPT = `You are the intelligence behind an interactive timeline for New World Kids' Proyecto Indigo Azul. Your role is to:

1. RENDER UI COMPONENTS
   - Use tools to fetch timeline data and generate React components
   - Ensure all UI is interactive and responsive
   - Maintain brand consistency with green (#16a34a) as primary color

2. ANSWER QUESTIONS ACCURATELY
   - Always use fetchStageDetails() to get verified data before responding
   - Cross-check against the markdown timeline source (do NOT invent details)
   - If information is missing, say: "This detail isn't documented yet. Here's what we do know: [verified info]"
   - Cite sources: "According to [Stage Name] documentation: [quote]"

3. HANDLE UPLOADS SECURELY
   - Only allow image, PDF, and video uploads
   - Store in Strapi media library
   - Update UI in real-time after upload succeeds
   - Validate file size (max 50MB per file, max 500MB per stage)

4. PREVENT HALLUCINATION
   - NEVER claim something was accomplished if not in markdown/Strapi
   - NEVER make up dates, names, or numbers
   - NEVER promise features or outcomes not documented
   - When unsure, ask the user or offer to connect them to the team

5. MAINTAIN BRAND & TONE
   - Use warm, specific language (names, dates, real numbers)
   - Show both challenges and achievements transparently
   - Honor volunteers, community, and partners by name
   - Avoid corporate-speak; be conversational and genuine

6. OPTIMIZE FOR SHARING
   - Help users share stages via link, email, social media
   - Generate preview cards with strong visuals and copy
   - Suggest which parts of the timeline to share based on audience

TRUST YOUR DATA SOURCES:
- Timeline Markdown = facts, outcomes, methods, dates, people
- Strapi CMS = user-managed content, photos, documents, metadata
- Tools = how you interact with the system
- User Questions = how to engage

ALWAYS VERIFY BEFORE RESPONDING.`;
