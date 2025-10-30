export interface EnvVariable {
  key: string;
  description: string;
  required: boolean;
  pattern?: RegExp;
  placeholder?: string;
  defaultValue?: string;
}

export interface StackTemplate {
  name: string;
  description: string;
  variables: EnvVariable[];
}

export const VALIDATION_PATTERNS = {
  OPENAI_API_KEY: /^sk-[a-zA-Z0-9-]{20,}$/,
  ANTHROPIC_API_KEY: /^sk-ant-[a-zA-Z0-9-]{20,}$/,
  SUPABASE_URL: /^https?:\/\/[a-z0-9.-]+\.supabase\.co$/,
  SUPABASE_ANON_KEY: /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/,
  DATABASE_URL: /^(postgres|postgresql):\/\/.+$/,
  STRIPE_KEY: /^(sk|pk)_(test|live)_[a-zA-Z0-9]{24,}$/,
  JWT_SECRET: /^[a-zA-Z0-9_-]{32,}$/,
  AWS_REGION: /^[a-z]{2}-[a-z]+-\d$/,
  VERCEL_TOKEN: /^[a-zA-Z0-9]{24}$/,
  GITHUB_TOKEN: /^gh[a-z]_[a-zA-Z0-9]{36,}$/,
  URL: /^https?:\/\/.+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PORT: /^\d{1,5}$/,
  BOOLEAN: /^(true|false|1|0|yes|no)$/i,
};

export const TEMPLATES: Record<string, StackTemplate> = {
  nextjs: {
    name: 'Next.js',
    description: 'Next.js application with common integrations',
    variables: [
      {
        key: 'NEXT_PUBLIC_APP_URL',
        description: 'Public application URL',
        required: true,
        pattern: VALIDATION_PATTERNS.URL,
        placeholder: 'https://example.com',
      },
      {
        key: 'DATABASE_URL',
        description: 'PostgreSQL connection string',
        required: true,
        pattern: VALIDATION_PATTERNS.DATABASE_URL,
        placeholder: 'postgresql://user:pass@host:5432/db',
      },
      {
        key: 'NEXTAUTH_URL',
        description: 'NextAuth.js base URL',
        required: true,
        pattern: VALIDATION_PATTERNS.URL,
        placeholder: 'https://example.com',
      },
      {
        key: 'NEXTAUTH_SECRET',
        description: 'NextAuth.js encryption secret',
        required: true,
        pattern: VALIDATION_PATTERNS.JWT_SECRET,
        placeholder: 'Generate with: openssl rand -base64 32',
      },
    ],
  },
  'node-express': {
    name: 'Node.js + Express',
    description: 'Express.js backend API',
    variables: [
      {
        key: 'NODE_ENV',
        description: 'Node environment',
        required: true,
        defaultValue: 'development',
        placeholder: 'development',
      },
      {
        key: 'PORT',
        description: 'Server port',
        required: true,
        pattern: VALIDATION_PATTERNS.PORT,
        defaultValue: '3000',
      },
      {
        key: 'DATABASE_URL',
        description: 'Database connection string',
        required: true,
        pattern: VALIDATION_PATTERNS.DATABASE_URL,
        placeholder: 'postgresql://user:pass@host:5432/db',
      },
      {
        key: 'JWT_SECRET',
        description: 'JWT signing secret',
        required: true,
        pattern: VALIDATION_PATTERNS.JWT_SECRET,
        placeholder: 'your-secret-key',
      },
      {
        key: 'CORS_ORIGIN',
        description: 'Allowed CORS origins',
        required: false,
        placeholder: 'https://example.com',
      },
    ],
  },
  supabase: {
    name: 'Supabase',
    description: 'Supabase backend integration',
    variables: [
      {
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        description: 'Supabase project URL',
        required: true,
        pattern: VALIDATION_PATTERNS.SUPABASE_URL,
        placeholder: 'https://xxxxx.supabase.co',
      },
      {
        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        description: 'Supabase anonymous key',
        required: true,
        pattern: VALIDATION_PATTERNS.SUPABASE_ANON_KEY,
        placeholder: 'eyJhbGc...',
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        description: 'Supabase service role key (server-only)',
        required: false,
        pattern: VALIDATION_PATTERNS.SUPABASE_ANON_KEY,
        placeholder: 'eyJhbGc...',
      },
    ],
  },
  postgres: {
    name: 'PostgreSQL',
    description: 'PostgreSQL database configuration',
    variables: [
      {
        key: 'DATABASE_URL',
        description: 'PostgreSQL connection string',
        required: true,
        pattern: VALIDATION_PATTERNS.DATABASE_URL,
        placeholder: 'postgresql://user:password@localhost:5432/dbname',
      },
      {
        key: 'POSTGRES_HOST',
        description: 'PostgreSQL host',
        required: false,
        placeholder: 'localhost',
      },
      {
        key: 'POSTGRES_PORT',
        description: 'PostgreSQL port',
        required: false,
        pattern: VALIDATION_PATTERNS.PORT,
        defaultValue: '5432',
      },
      {
        key: 'POSTGRES_USER',
        description: 'PostgreSQL user',
        required: false,
        placeholder: 'postgres',
      },
      {
        key: 'POSTGRES_PASSWORD',
        description: 'PostgreSQL password',
        required: false,
        placeholder: 'password',
      },
      {
        key: 'POSTGRES_DB',
        description: 'PostgreSQL database name',
        required: false,
        placeholder: 'myapp',
      },
    ],
  },
  stripe: {
    name: 'Stripe',
    description: 'Stripe payment processing',
    variables: [
      {
        key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        description: 'Stripe publishable key',
        required: true,
        pattern: VALIDATION_PATTERNS.STRIPE_KEY,
        placeholder: 'pk_test_...',
      },
      {
        key: 'STRIPE_SECRET_KEY',
        description: 'Stripe secret key',
        required: true,
        pattern: VALIDATION_PATTERNS.STRIPE_KEY,
        placeholder: 'sk_test_...',
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        description: 'Stripe webhook signing secret',
        required: false,
        placeholder: 'whsec_...',
      },
    ],
  },
  openai: {
    name: 'OpenAI',
    description: 'OpenAI API integration',
    variables: [
      {
        key: 'OPENAI_API_KEY',
        description: 'OpenAI API key',
        required: true,
        pattern: VALIDATION_PATTERNS.OPENAI_API_KEY,
        placeholder: 'sk-...',
      },
      {
        key: 'OPENAI_ORG_ID',
        description: 'OpenAI organization ID',
        required: false,
        placeholder: 'org-...',
      },
    ],
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Anthropic Claude API',
    variables: [
      {
        key: 'ANTHROPIC_API_KEY',
        description: 'Anthropic API key',
        required: true,
        pattern: VALIDATION_PATTERNS.ANTHROPIC_API_KEY,
        placeholder: 'sk-ant-...',
      },
    ],
  },
  google: {
    name: 'Google Cloud',
    description: 'Google Cloud Platform services',
    variables: [
      {
        key: 'GOOGLE_CLIENT_ID',
        description: 'Google OAuth client ID',
        required: false,
        placeholder: '*.apps.googleusercontent.com',
      },
      {
        key: 'GOOGLE_CLIENT_SECRET',
        description: 'Google OAuth client secret',
        required: false,
        placeholder: 'GOCSPX-...',
      },
      {
        key: 'GOOGLE_APPLICATION_CREDENTIALS',
        description: 'Path to service account JSON',
        required: false,
        placeholder: './service-account.json',
      },
    ],
  },
  aws: {
    name: 'AWS',
    description: 'Amazon Web Services',
    variables: [
      {
        key: 'AWS_REGION',
        description: 'AWS region',
        required: true,
        pattern: VALIDATION_PATTERNS.AWS_REGION,
        placeholder: 'us-east-1',
      },
      {
        key: 'AWS_ACCESS_KEY_ID',
        description: 'AWS access key ID',
        required: true,
        placeholder: 'AKIA...',
      },
      {
        key: 'AWS_SECRET_ACCESS_KEY',
        description: 'AWS secret access key',
        required: true,
        placeholder: 'your-secret-key',
      },
      {
        key: 'AWS_S3_BUCKET',
        description: 'S3 bucket name',
        required: false,
        placeholder: 'my-bucket',
      },
    ],
  },
  django: {
    name: 'Django',
    description: 'Django web framework',
    variables: [
      {
        key: 'DJANGO_SECRET_KEY',
        description: 'Django secret key',
        required: true,
        pattern: VALIDATION_PATTERNS.JWT_SECRET,
        placeholder: 'django-insecure-...',
      },
      {
        key: 'DJANGO_DEBUG',
        description: 'Enable debug mode',
        required: true,
        pattern: VALIDATION_PATTERNS.BOOLEAN,
        defaultValue: 'False',
      },
      {
        key: 'DATABASE_URL',
        description: 'Database connection string',
        required: true,
        pattern: VALIDATION_PATTERNS.DATABASE_URL,
        placeholder: 'postgresql://user:pass@host:5432/db',
      },
      {
        key: 'ALLOWED_HOSTS',
        description: 'Allowed hosts (comma-separated)',
        required: true,
        placeholder: 'localhost,example.com',
      },
    ],
  },
  rails: {
    name: 'Ruby on Rails',
    description: 'Ruby on Rails application',
    variables: [
      {
        key: 'RAILS_ENV',
        description: 'Rails environment',
        required: true,
        defaultValue: 'development',
      },
      {
        key: 'SECRET_KEY_BASE',
        description: 'Rails secret key base',
        required: true,
        pattern: VALIDATION_PATTERNS.JWT_SECRET,
        placeholder: 'Generate with: rails secret',
      },
      {
        key: 'DATABASE_URL',
        description: 'Database connection string',
        required: true,
        pattern: VALIDATION_PATTERNS.DATABASE_URL,
        placeholder: 'postgresql://user:pass@host:5432/db',
      },
    ],
  },
};

export function getTemplate(stackName: string): StackTemplate | null {
  return TEMPLATES[stackName] || null;
}

export function getAllTemplates(): StackTemplate[] {
  return Object.values(TEMPLATES);
}

export function validateEnvValue(key: string, value: string, pattern?: RegExp): boolean {
  if (!value) return false;
  if (pattern) {
    return pattern.test(value);
  }
  return true;
}
