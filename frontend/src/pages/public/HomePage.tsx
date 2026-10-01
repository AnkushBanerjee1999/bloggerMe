import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PenSquare, Users, FileText, MessageSquare, TrendingUp, Sparkles, BookOpen, Compass, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockPosts } from '@/data/mockData';
import { api } from '@/utils/api';

export function HomePage() {
  const { posts, users, comments, currentUser } = useApp();
  const [realStats, setRealStats] = useState<{ publishedPosts: number; totalUsers: number; totalComments: number } | null>(null);

  const publishedPosts = posts.filter(p => p.status === 'published');
  
  // Use real DB posts if available; otherwise use curated featured mock posts for public showcase
  const hasRealPosts = publishedPosts.length > 0;
  const displayPosts = hasRealPosts ? publishedPosts : mockPosts.filter(p => p.status === 'published');
  const featured = displayPosts[0];
  const recent = displayPosts.slice(1, 4);

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const res = await api.get('/posts/stats');
        if (mounted && res?.stats) {
          setRealStats(res.stats);
        }
      } catch (err: any) {
        console.warn('Could not load public stats:', err.message);
      }
    }
    fetchStats();
    return () => { mounted = false; };
  }, [posts.length, comments.length]);

  const stats = [
    {
      label: 'Published Articles',
      value: realStats?.publishedPosts ?? (hasRealPosts ? publishedPosts.length : 0),
      icon: FileText
    },
    {
      label: 'Active Writers',
      value: realStats?.totalUsers ?? (users.length > 0 ? users.length : 1),
      icon: Users
    },
    {
      label: 'Community Comments',
      value: realStats?.totalComments ?? (comments.length > 0 ? comments.length : 0),
      icon: MessageSquare
    },
  ];

  const categoryTokens: Record<string, { bg: string; text: string; border: string }> = {
    Frontend: { bg: 'bg-brand-50/70', text: 'text-brand-700', border: 'border-brand-200' },
    Backend: { bg: 'bg-indigo-50/70', text: 'text-indigo-700', border: 'border-indigo-200' },
    Architecture: { bg: 'bg-teal-50/70', text: 'text-teal-700', border: 'border-teal-200' },
    TypeScript: { bg: 'bg-sky-50/70', text: 'text-sky-700', border: 'border-sky-200' },
    DevOps: { bg: 'bg-orange-50/70', text: 'text-orange-700', border: 'border-orange-200' },
    Career: { bg: 'bg-amber-50/70', text: 'text-amber-700', border: 'border-amber-200' },
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. Editorial Hero / Introduction with Subtle Warm-to-Blue Tint */}
      <section className="border-b border-editorial-border pb-14 pt-10 sm:pt-14 bg-gradient-to-b from-brand-50/40 via-paper-50 to-paper-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-700 font-semibold bg-brand-50 border border-brand-200/80 px-2.5 py-1 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-pulse" />
              <span>BloggerMe Dispatch</span>
              <span className="text-brand-300">/</span>
              <span>Engineering & Systems</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 leading-[1.15]">
              Ideas, engineering stories, and practical knowledge from developers.
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 font-normal leading-relaxed max-w-2xl pt-1">
              Explore deep dives on software engineering, distributed systems, web standards, architecture, and technology. An independent technical publication written by practitioners.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/blog"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-xs transition-colors"
              >
                Explore Articles <ArrowRight size={14} />
              </Link>

              {!currentUser && (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-medium text-brand-700 bg-white border border-brand-200 hover:bg-brand-50 hover:border-brand-300 transition-colors shadow-2xs"
                >
                  <PenSquare size={14} className="text-brand-600" /> Start Writing
                </Link>
              )}
            </div>
          </div>

          {/* Understated Editorial Publication Metrics Bar */}
          <div className="mt-12 pt-6 border-t border-editorial-border grid grid-cols-3 max-w-lg gap-6 text-left">
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">{stats[0].value}</p>
              <p className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold mt-0.5">Articles</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">{stats[1].value}</p>
              <p className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold mt-0.5">Authors</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">{stats[2].value}</p>
              <p className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold mt-0.5">Discussions</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Article Showcase */}
      {featured && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-editorial-border">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-600" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
                Featured Story
              </h2>
            </div>
            <Link to="/blog" className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors">
              All articles &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-editorial-border rounded-md p-6 sm:p-8 hover:border-brand-300 transition-colors shadow-2xs">
            <div className="lg:col-span-7 aspect-[16/10] overflow-hidden rounded bg-neutral-100 border border-neutral-100">
              <Link to={`/posts/${featured.slug}`} className="block h-full w-full overflow-hidden">
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
              </Link>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-2">
                {featured.tags[0] && (
                  <span className="text-xs font-mono uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2 py-0.5 rounded font-semibold">
                    {featured.tags[0]}
                  </span>
                )}
                <span className="text-neutral-300">·</span>
                <span className="text-xs text-neutral-500">
                  {new Date(featured.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <Link to={`/posts/${featured.slug}`} className="group">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-950 leading-snug group-hover:text-brand-600 transition-colors">
                  {featured.title}
                </h3>
              </Link>

              <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                {featured.excerpt}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-brand-50 border border-brand-100 flex items-center justify-center font-medium text-xs text-brand-700">
                    {featured.authorAvatar ? (
                      <img src={featured.authorAvatar} alt={featured.authorName} className="h-full w-full object-cover" />
                    ) : (
                      featured.authorName?.[0]?.toUpperCase() || 'A'
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-neutral-900">{featured.authorName}</span>
                    <span className="block text-[11px] text-neutral-400">Contributor</span>
                  </div>
                </div>

                <Link
                  to={`/posts/${featured.slug}`}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
                >
                  Read piece &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Trending Articles Section */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-editorial-border">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-600 font-bold">
              Trending Articles
            </h2>
            <Link to="/blog" className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors">
              Explore library &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {/* 4. Explore Topics / Categories with Subtle Color Identities */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-b border-editorial-border py-8 bg-paper-50/50 rounded-sm px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
                Explore by Topic
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Filter articles by technical field and engineering discipline.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['Frontend', 'Backend', 'Architecture', 'TypeScript', 'DevOps', 'Career'].map((topic) => {
                const colors = categoryTokens[topic] || { bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200' };
                return (
                  <Link
                    key={topic}
                    to={`/blog?tag=${topic.toLowerCase()}`}
                    className={`px-3 py-1.5 text-xs font-medium rounded border ${colors.bg} ${colors.text} ${colors.border} hover:opacity-85 transition-opacity`}
                  >
                    #{topic}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimal Community Invitation / CTA with Subtle Tinted Surface */}
      {!currentUser && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="bg-brand-50/40 border border-brand-200/80 rounded-md p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-2xs">
            <span className="inline-block text-[11px] font-mono uppercase tracking-widest text-brand-700 font-semibold mb-2 bg-brand-100/70 border border-brand-200 px-2 py-0.5 rounded">
              Contribute
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight mb-2">
              Write something worth sharing.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 max-w-md mx-auto">
              Have an engineering story, architectural lesson, or technical idea? Publish directly to a thoughtful developer audience on bloggerMe.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700 active:bg-brand-800 shadow-xs transition-colors"
              >
                Start Writing
              </Link>
              <Link
                to="/login"
                className="px-4 py-2.5 text-xs sm:text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 hover:border-brand-300 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
