// Application Constants

export const APP_CONFIG = {
  name: 'New World Kids Interactive Timeline',
  version: '1.0.0',
  description: 'CopilotKit Agent-to-UI Interactive Timeline for Proyecto Indigo Azul',
} as const;

// Strapi Configuration
export const STRAPI_CONFIG = {
  url: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  apiToken: process.env.STRAPI_API_TOKEN || '',
  webhookSecret: process.env.STRAPI_WEBHOOK_SECRET || '',
} as const;

// Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '52428800'), // 50MB
  maxFilesPerStage: parseInt(process.env.UPLOAD_MAX_FILES_PER_STAGE || '50'),
  allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp,image/avif,application/pdf,video/mp4,video/webm').split(','),
} as const;

// Feature Flags
export const FEATURES = {
  userUploads: process.env.ENABLE_USER_UPLOADS === 'true',
  adminPanel: process.env.ENABLE_ADMIN_PANEL === 'true',
  requireAdminApproval: process.env.REQUIRE_ADMIN_APPROVAL === 'true',
  authEnabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
} as const;

// Timeline Configuration
export const TIMELINE_CONFIG = {
  markdownPath: process.env.MARKDOWN_TIMELINE_PATH || './public/data/timeline.md',
} as const;

// Stage Status Configuration
export const STAGE_STATUS = {
  BUILT: {
    label: 'Built',
    color: '#d1fae5',
    textColor: '#065f46',
    description: 'Successfully completed and operational',
  },
  STUBBED: {
    label: 'Stubbed',
    color: '#fef3c7',
    textColor: '#92400e',
    description: 'Initial foundation in place, ongoing development',
  },
  PLANNED: {
    label: 'Planned',
    color: '#dbeafe',
    textColor: '#1e40af',
    description: 'Designed and ready for implementation',
  },
  FUTURE: {
    label: 'Future',
    color: '#f3e8ff',
    textColor: '#6b21a8',
    description: 'Vision for future development',
  },
} as const;

// Document Types Configuration
export const DOCUMENT_TYPES = {
  Budget: { icon: '💰', color: '#16a34a' },
  Plan: { icon: '📋', color: '#2563eb' },
  Partnership: { icon: '🤝', color: '#7c3aed' },
  Impact: { icon: '📊', color: '#dc2626' },
  Video: { icon: '🎥', color: '#ea580c' },
  Photo: { icon: '📷', color: '#0891b2' },
} as const;

// Metric Categories Configuration
export const METRIC_CATEGORIES = {
  Land: { icon: '🌱', color: '#16a34a' },
  People: { icon: '👥', color: '#2563eb' },
  Financial: { icon: '💵', color: '#eab308' },
  Impact: { icon: '⭐', color: '#dc2626' },
} as const;

// Pre-seeded Chat Questions per Stage
export const PRE_SEEDED_QUESTIONS: Record<string, string[]> = {
  'prologue': [
    'What inspired the creation of New World Kids?',
    'Who are the founding members?',
    'What was the initial vision?',
  ],
  'season-1': [
    'How much land was acquired in Season 1?',
    'What was the primary focus of this stage?',
    'Who were the key partners involved?',
  ],
  'season-2': [
    'What agricultural methods were implemented?',
    'How many people participated in Season 2?',
    'What were the main outcomes?',
  ],
  'season-3': [
    'What is the current status of Season 3?',
    'What are the funding needs?',
    'What infrastructure is being built?',
  ],
  'season-4': [
    'What are the plans for Season 4?',
    'How will this stage differ from previous ones?',
    'What are the expected outcomes?',
  ],
  'season-5': [
    'What is the vision for Season 5?',
    'What scale of impact is planned?',
    'What partnerships are being considered?',
  ],
  'season-6': [
    'What does the future hold for New World Kids?',
    'How can people get involved?',
    'What is the ultimate goal?',
  ],
} as const;

// Tab Configuration
export const MODAL_TABS = [
  { id: 'gallery', label: 'Gallery', icon: '🖼️' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'people', label: 'People & Partners', icon: '👥' },
  { id: 'chat', label: 'Ask About This Stage', icon: '💬' },
  { id: 'metrics', label: 'Metrics & Outcomes', icon: '📊' },
] as const;

// API Endpoints
export const API_ENDPOINTS = {
  timeline: {
    stages: '/api/timeline/stages',
    stageById: (id: string) => `/api/timeline/stages/${id}`,
    gallery: (id: string) => `/api/timeline/stages/${id}/gallery`,
    documents: (id: string) => `/api/timeline/stages/${id}/documents`,
    people: (id: string) => `/api/timeline/stages/${id}/people`,
    metrics: (id: string) => `/api/timeline/metrics/${id}`,
  },
  upload: {
    base: '/api/upload',
    gallery: (id: string) => `/api/upload/gallery/${id}`,
    documents: (id: string) => `/api/upload/documents/${id}`,
  },
  strapi: {
    stages: '/api/strapi/stages',
    sync: '/api/strapi/sync',
  },
  copilot: '/api/copilot',
} as const;

// Responsive Breakpoints
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
} as const;

// Brand Colors (matching Tailwind config)
export const COLORS = {
  primary: '#16a34a',
  earth: '#8B6F47',
  water: '#5EEAD4',
  accent: '#F97316',
  dark: '#1F2937',
  light: '#FAFAF8',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  upload: {
    fileTooBig: 'File size exceeds maximum allowed size',
    invalidType: 'File type not supported',
    uploadFailed: 'Upload failed. Please try again.',
    networkError: 'Network error. Please check your connection.',
  },
  api: {
    fetchFailed: 'Failed to fetch data. Please try again.',
    unauthorized: 'You do not have permission to perform this action.',
    notFound: 'Resource not found.',
    serverError: 'Server error. Please try again later.',
  },
  validation: {
    required: 'This field is required',
    invalidFormat: 'Invalid format',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  upload: {
    photoUploaded: 'Photo uploaded successfully!',
    documentUploaded: 'Document uploaded successfully!',
  },
  share: {
    linkCopied: 'Link copied to clipboard!',
  },
} as const;
