import type { TimelineStage, TimelinePerson, TimelineMetric, TimelineDocument, StrapiMedia } from './types';

/**
 * Mock data for development and deployment without Strapi
 * This allows the app to work immediately after deployment
 */

export const MOCK_MEDIA: StrapiMedia = {
  id: 1,
  name: 'placeholder',
  alternativeText: 'Placeholder image',
  width: 800,
  height: 600,
  hash: 'placeholder',
  ext: '.jpg',
  mime: 'image/jpeg',
  size: 100,
  url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop',
  provider: 'unsplash',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_STAGES: TimelineStage[] = [
  {
    id: 1,
    stage_id: 'prologue',
    title: 'Prologue: The Vision',
    date_range: 'December 2019',
    status: 'BUILT',
    completion_percentage: 100,
    description: 'The seeds of New World Kids were planted in late 2019 when a group of visionaries came together with a shared dream: to create a regenerative community that demonstrates a new way of living in harmony with nature.',
    featured_image: {
      ...MOCK_MEDIA,
      url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop',
    },
    gallery_images: [
      { ...MOCK_MEDIA, id: 101, url: 'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?w=400&h=400&fit=crop' },
      { ...MOCK_MEDIA, id: 102, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop' },
    ],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    stage_id: 'season-1',
    title: 'Season 1: Foundation',
    date_range: 'January 2020 - December 2020',
    status: 'BUILT',
    completion_percentage: 100,
    description: 'Season 1 marked the beginning of our journey. We acquired our first parcel of land and began laying the foundations for what would become Proyecto Indigo Azul.',
    featured_image: {
      ...MOCK_MEDIA,
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    },
    gallery_images: [
      { ...MOCK_MEDIA, id: 201, url: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=400&h=400&fit=crop' },
      { ...MOCK_MEDIA, id: 202, url: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=400&h=400&fit=crop' },
      { ...MOCK_MEDIA, id: 203, url: 'https://images.unsplash.com/photo-1492496913980-501348b61469?w=400&h=400&fit=crop' },
    ],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    stage_id: 'season-2',
    title: 'Season 2: Growth',
    date_range: 'January 2021 - December 2021',
    status: 'BUILT',
    completion_percentage: 100,
    description: 'With foundations in place, Season 2 focused on implementing regenerative agriculture systems and expanding our community.',
    featured_image: {
      ...MOCK_MEDIA,
      url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop',
    },
    gallery_images: [
      { ...MOCK_MEDIA, id: 301, url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop' },
      { ...MOCK_MEDIA, id: 302, url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop' },
    ],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    stage_id: 'season-3',
    title: 'Season 3: Integration',
    date_range: 'January 2022 - Present',
    status: 'STUBBED',
    completion_percentage: 75,
    description: 'Season 3 represents our current phase: integrating all systems and moving toward self-sufficiency while scaling our impact.',
    featured_image: {
      ...MOCK_MEDIA,
      url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=600&fit=crop',
    },
    gallery_images: [
      { ...MOCK_MEDIA, id: 401, url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=400&fit=crop' },
    ],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    stage_id: 'season-4',
    title: 'Season 4: Scaling',
    date_range: 'January 2024 - December 2025',
    status: 'PLANNED',
    completion_percentage: 0,
    description: 'Complete infrastructure and begin replicating the model in other communities.',
    featured_image: {
      ...MOCK_MEDIA,
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop',
    },
    gallery_images: [],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    stage_id: 'season-5',
    title: 'Season 5: Multiplication',
    date_range: 'January 2026 - December 2028',
    status: 'PLANNED',
    completion_percentage: 0,
    description: 'Spread the model globally while deepening local impact.',
    featured_image: {
      ...MOCK_MEDIA,
      url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    },
    gallery_images: [],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    stage_id: 'season-6',
    title: 'Season 6: Legacy',
    date_range: 'January 2029 - December 2035',
    status: 'FUTURE',
    completion_percentage: 0,
    description: 'Establish a self-replicating global movement of regenerative communities.',
    featured_image: {
      ...MOCK_MEDIA,
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
    },
    gallery_images: [],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_PEOPLE: Record<string, TimelinePerson[]> = {
  'prologue': [
    {
      id: 1,
      name: 'Trevor Patterson',
      role: 'Founder & Visionary',
      bio: 'Trevor brings 15+ years of experience in regenerative agriculture and community building.',
      location: 'Serbia',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'season-1': [
    {
      id: 2,
      name: 'Maria Garcia',
      role: 'Volunteer Coordinator',
      bio: 'Maria coordinated our initial volunteer program and helped build our community.',
      location: 'Local Community',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'season-2': [],
  'season-3': [],
  'season-4': [],
  'season-5': [],
  'season-6': [],
};

export const MOCK_METRICS: Record<string, TimelineMetric[]> = {
  'prologue': [],
  'season-1': [
    {
      id: 1,
      label: 'Land Acquired',
      start_value: '0 acres',
      end_value: '25 acres',
      icon: '🌱',
      category: 'Land',
      visualization_type: 'bar',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      label: 'Volunteers',
      start_value: '0',
      end_value: '12',
      icon: '👥',
      category: 'People',
      visualization_type: 'number',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'season-2': [
    {
      id: 3,
      label: 'Food Forest',
      start_value: '0 acres',
      end_value: '5 acres',
      icon: '🌳',
      category: 'Land',
      visualization_type: 'bar',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      label: 'Volunteers',
      start_value: '12',
      end_value: '42',
      icon: '👥',
      category: 'People',
      visualization_type: 'number',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      label: 'Budget',
      start_value: '$15,000',
      end_value: '$48,000',
      icon: '💵',
      category: 'Financial',
      visualization_type: 'number',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'season-3': [
    {
      id: 6,
      label: 'Completion',
      start_value: '0',
      end_value: '75',
      icon: '✓',
      category: 'Impact',
      visualization_type: 'progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'season-4': [],
  'season-5': [],
  'season-6': [],
};

export const MOCK_DOCUMENTS: Record<string, TimelineDocument[]> = {
  'prologue': [],
  'season-1': [
    {
      id: 1,
      title: 'Season 1 Master Plan',
      description: 'Comprehensive master plan for the first year of operations.',
      document_type: 'Plan',
      visibility: 'Public',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  'season-2': [],
  'season-3': [],
  'season-4': [],
  'season-5': [],
  'season-6': [],
};

// Add metrics to stages
MOCK_STAGES.forEach((stage) => {
  if (MOCK_METRICS[stage.stage_id]) {
    stage.metrics = MOCK_METRICS[stage.stage_id];
  }
});
