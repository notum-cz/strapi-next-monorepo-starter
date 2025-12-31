// Core Timeline Types

export type StageStatus = 'BUILT' | 'STUBBED' | 'PLANNED' | 'FUTURE';

export type DocumentType = 'Budget' | 'Plan' | 'Partnership' | 'Impact' | 'Video' | 'Photo';

export type DocumentVisibility = 'Public' | 'AdminOnly' | 'AuthorizedOnly';

export type MetricCategory = 'Land' | 'People' | 'Financial' | 'Impact';

export type MetricVisualizationType = 'bar' | 'number' | 'progress' | 'icon';

export type ShareType = 'link' | 'social' | 'embed' | 'email';

export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineStage {
  id: number;
  stage_id: string; // e.g., "season-1"
  title: string;
  date_range: string;
  status: StageStatus;
  completion_percentage: number;
  description: string;
  featured_image?: StrapiMedia;
  gallery_images?: StrapiMedia[];
  documents?: TimelineDocument[];
  metadata?: Record<string, any>;
  published_at?: string;
  people?: TimelinePerson[];
  metrics?: TimelineMetric[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelinePerson {
  id: number;
  name: string;
  role: string;
  bio: string;
  avatar?: StrapiMedia;
  email?: string;
  website?: string;
  location?: string;
  stages_involved?: TimelineStage[];
  social_links?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TimelineMetric {
  id: number;
  label: string;
  start_value: string | number;
  end_value: string | number;
  icon: string;
  stage?: TimelineStage;
  category: MetricCategory;
  visualization_type: MetricVisualizationType;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineDocument {
  id: number;
  title: string;
  description: string;
  file?: StrapiMedia;
  document_type: DocumentType;
  stage?: TimelineStage;
  visibility: DocumentVisibility;
  published_at?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types

export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StageDetailsResponse {
  stage: TimelineStage;
  gallery: StrapiMedia[];
  documents: TimelineDocument[];
  people: TimelinePerson[];
  metrics: TimelineMetric[];
}

// Upload Types

export interface UploadProgress {
  progress: number;
  file_id?: string;
  url?: string;
  success: boolean;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  file_id: string;
  url: string;
  thumbnail_url?: string;
  error?: string;
}

// Chat Types

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  sources?: string[];
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  sources: string[];
  context_used: string[];
}

// Share Types

export interface ShareResult {
  url: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  embed_code?: string;
  qr_code?: string;
}

// Search Types

export interface SearchResult {
  id: string;
  type: 'stage' | 'document' | 'person';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  stage_id?: string;
  relevance: number;
}

// CopilotKit Tool Types

export interface CopilotToolInput {
  [key: string]: any;
}

export interface CopilotTool {
  name: string;
  description: string;
  input: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (input: CopilotToolInput) => Promise<any> | any;
}

// Validation Types

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

// Component Props Types

export interface StageCardProps {
  stage: TimelineStage;
  layout?: 'compact' | 'detailed';
  onClick?: () => void;
}

export interface StageModalProps {
  stage_id: string;
  initial_tab?: 'gallery' | 'documents' | 'people' | 'chat' | 'metrics';
  isOpen: boolean;
  onClose: () => void;
}

export interface PhotoGalleryProps {
  stage_id: string;
  photos: StrapiMedia[];
  isAdmin?: boolean;
  onUpload?: (file: File, caption: string) => Promise<void>;
}

export interface ChatPanelProps {
  stage_id: string;
  initialMessages?: ChatMessage[];
}

export interface DocumentViewerProps {
  documents: TimelineDocument[];
  stage_id: string;
  isAdmin?: boolean;
}

export interface PeoplePanelProps {
  people: TimelinePerson[];
  stage_id: string;
}

export interface MetricsPanelProps {
  metrics: TimelineMetric[];
  stage_id: string;
}

export interface SharePanelProps {
  stage_id: string;
  stage_title: string;
}
