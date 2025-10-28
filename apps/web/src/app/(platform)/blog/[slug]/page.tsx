// ============================================================================
// Blog Post Detail Page - Seattle AI/Nonprofit/Agritech News
// ============================================================================

'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import ReactMarkdown from 'markdown-to-jsx';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author_name: string;
  featured_image_url?: string;
  source_url?: string;
  published_at: string;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', resolvedParams.slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-4">📰</div>
          <div className="font-display text-2xl text-white mb-2">Post Not Found</div>
          <Link href="/impact" className="text-purple-400 hover:text-purple-300">
            ← Back to Impact Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-purple-900/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/impact" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Impact Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <article className="mx-auto max-w-4xl px-8 py-12">
        {/* Category & Date */}
        <div className="mb-6 flex items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-900/30 px-4 py-2 backdrop-blur-sm">
            <span className="font-mono text-sm text-purple-300 uppercase tracking-wider">
              {post.category}
            </span>
          </span>
          <span className="font-mono text-sm text-gray-500">
            {new Date(post.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl font-bold text-white mb-6">
          {post.title}
        </h1>

        {/* Author */}
        {post.author_name && (
          <div className="mb-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {post.author_name.charAt(0)}
            </div>
            <div>
              <div className="font-sans text-sm font-semibold text-white">
                {post.author_name}
              </div>
              <div className="font-sans text-xs text-gray-500">
                New World Kids Team
              </div>
            </div>
          </div>
        )}

        {/* Excerpt */}
        <div className="mb-8 rounded-lg border border-slate-700 bg-slate-900/50 p-6">
          <p className="font-sans text-lg text-gray-300 italic">
            {post.excerpt}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-purple max-w-none mb-12">
          <div className="font-sans text-gray-300 leading-relaxed space-y-6">
            <ReactMarkdown
              options={{
                overrides: {
                  h1: {
                    component: 'h2',
                    props: {
                      className: 'font-display text-3xl font-bold text-white mt-12 mb-6',
                    },
                  },
                  h2: {
                    props: {
                      className: 'font-display text-2xl font-bold text-white mt-10 mb-4',
                    },
                  },
                  h3: {
                    props: {
                      className: 'font-display text-xl font-bold text-white mt-8 mb-3',
                    },
                  },
                  p: {
                    props: {
                      className: 'mb-4 text-gray-300 leading-relaxed',
                    },
                  },
                  a: {
                    props: {
                      className: 'text-purple-400 hover:text-purple-300 underline transition',
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    },
                  },
                  ul: {
                    props: {
                      className: 'list-disc list-inside space-y-2 my-4 text-gray-300',
                    },
                  },
                  ol: {
                    props: {
                      className: 'list-decimal list-inside space-y-2 my-4 text-gray-300',
                    },
                  },
                  strong: {
                    props: {
                      className: 'font-bold text-white',
                    },
                  },
                  code: {
                    props: {
                      className: 'font-mono text-sm bg-slate-800 px-2 py-1 rounded text-purple-300',
                    },
                  },
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <div className="font-sans text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-800 px-3 py-1 font-mono text-xs text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source Link */}
        {post.source_url && (
          <div className="rounded-lg border border-blue-700/30 bg-blue-900/20 p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔗</span>
              <div>
                <div className="font-sans text-sm font-semibold text-white mb-1">
                  Original Source
                </div>
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-blue-400 hover:text-blue-300 transition break-all"
                >
                  {post.source_url}
                </a>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Back to Impact */}
      <div className="border-t border-slate-800 bg-slate-950/50 px-8 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/impact"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-8 py-3 font-sans font-semibold text-white transition hover:bg-purple-700"
          >
            ← View All Updates
          </Link>
        </div>
      </div>
    </div>
  );
}
