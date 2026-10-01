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

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800/80">
        {/* Modern Dynamic Mesh & Glowing Orbs Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        
        {/* Subtle geometric dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} 
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm shadow-inner">
                <Sparkles size={14} className="text-blue-400 animate-pulse" /> Modern Publishing Community
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] mb-6">
                Stories, ideas, & insights from the{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  developer world
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-8 max-w-xl">
                A modern publishing platform where developers, designers, and tech leaders share knowledge, architectural patterns, tutorials, and deep dives.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/blog"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-200"
                >
                  Explore Articles <ArrowRight size={18} />
                </Link>

                {!currentUser && (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md hover:border-white/30 active:scale-[0.98] transition-all duration-200 shadow-sm"
                  >
                    <PenSquare size={18} className="text-blue-400" /> Get Started Free
                  </Link>
                )}
              </div>

              {/* Highlights */}
              <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Always free to read & publish</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  <span>Curated tech categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span>Global developer network</span>
                </div>
              </div>
            </div>

            {/* Visual Glass Terminal Preview */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur-xl" />
                <div className="relative rounded-2xl border border-white/10 bg-slate-900/85 p-6 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/80" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">bloggerme.dev</span>
                  </div>

                  <div className="mt-5 space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span># Featured Topics</span>
                      <span className="text-blue-400 text-[11px]">Trending</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex flex-col hover:border-slate-600 transition-colors">
                        <span className="text-cyan-400 font-semibold text-xs">Full-Stack MERN</span>
                        <span className="text-[11px] text-slate-400 mt-1">Architecture & APIs</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex flex-col hover:border-slate-600 transition-colors">
                        <span className="text-indigo-400 font-semibold text-xs">React 18 & Vite</span>
                        <span className="text-[11px] text-slate-400 mt-1">Performance Tuning</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex flex-col hover:border-slate-600 transition-colors">
                        <span className="text-blue-400 font-semibold text-xs">TypeScript 5</span>
                        <span className="text-[11px] text-slate-400 mt-1">Clean Design Patterns</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex flex-col hover:border-slate-600 transition-colors">
                        <span className="text-emerald-400 font-semibold text-xs">Cloud & DevOps</span>
                        <span className="text-[11px] text-slate-400 mt-1">Production Best Practices</span>
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="text-slate-500">Ready to contribute?</span>
                      <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                        Join the community &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Metrics (Integrated Seamlessly with Overlap & Glassmorphic Elevation) */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl bg-white/95 p-6 border border-slate-200/80 shadow-xl shadow-slate-200/40 backdrop-blur-md hover:border-blue-300 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 shadow-inner group-hover:scale-105 transition-transform duration-200">
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Unauthenticated Visitor Spotlight */}
      {!currentUser && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 p-8 sm:p-12 text-white shadow-2xl">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center lg:text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide backdrop-blur-sm">
                  <Sparkles size={14} className="text-blue-400 animate-pulse" />
                  <span>Early Author Spotlight</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
                  Claim your voice.{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                    Share your expertise on bloggerMe.
                  </span>
                </h3>
                
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Join a high-performance publishing space tailored for tech minds. Write in clean Markdown, enjoy zero bloat, build your readership, and showcase your engineering craft.
                </p>

                {/* Micro-perks */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-3 text-xs sm:text-sm text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>Instant publishing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>Markdown support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>SEO-ready articles</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 flex-shrink-0 w-full sm:w-auto justify-center">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
                >
                  <PenSquare size={17} /> Start Writing Today
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md active:scale-[0.98] transition-all"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Post */}
      {featured && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                <span>Curated Story</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Featured Article</h2>
            </div>
            <Link to="/blog" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors">
              View all articles <ArrowRight size={16} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 md:flex group">
            <div className="md:w-1/2 aspect-[16/9] md:aspect-auto overflow-hidden bg-slate-100 relative">
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent md:hidden" />
            </div>

            <div className="p-7 sm:p-10 flex flex-col justify-center md:w-1/2">
              <div className="flex flex-wrap gap-2 mb-4">
                {featured.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                {featured.title}
              </h3>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-6 line-clamp-3">
                {featured.excerpt}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full ring-2 ring-blue-100 overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-xs text-blue-600">
                    {featured.authorAvatar ? (
                      <img src={featured.authorAvatar} alt={featured.authorName} className="h-full w-full object-cover" />
                    ) : (
                      featured.authorName?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800">{featured.authorName}</span>
                    <span className="block text-[11px] text-slate-400">
                      {new Date(featured.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/posts/${featured.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  Read story <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Trending Articles Grid */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                <span>From The Community</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Trending Articles</h2>
            </div>
            <Link to="/blog" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors">
              Explore library <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {/* 6. Topics & Categories Discovery */}
      {!currentUser && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Domains of Expertise</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Explore by Category</h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">Discover comprehensive writeups, architecture breakdowns, and tech tutorials.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Frontend & UI', desc: 'React 18, Tailwind, Accessibility, State', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
              { title: 'Backend & Cloud', desc: 'Node.js, Express, MongoDB, Microservices', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
              { title: 'DevOps & CI/CD', desc: 'Docker, GitHub Actions, AWS, Observability', icon: Compass, color: 'text-cyan-600 bg-cyan-50' },
              { title: 'Engineering Craft', desc: 'System Design, Team Culture, Clean Code', icon: Users, color: 'text-purple-600 bg-purple-50' },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="rounded-2xl bg-white border border-slate-200/80 p-6 text-center hover:border-blue-300 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cat.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{cat.title}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. Bottom CTA */}
      {!currentUser && (
        <section className="mx-4 sm:mx-6 max-w-6xl lg:mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-2xl">
            {/* Ambient glows & radial mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.2),rgba(255,255,255,0))]" />
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
            
            {/* Grid overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ 
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '28px 28px'
              }} 
            />

            <div className="relative z-10 px-6 py-16 sm:py-20 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-400 mb-6 shadow-inner">
                <TrendingUp size={24} />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">
                Join our community of{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  writers & readers
                </span>
              </h2>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8 max-w-xl mx-auto">
                Share your engineering knowledge, publish technical guides, grow your readership, and join discussions with passionate developers worldwide.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
                >
                  <PenSquare size={17} /> Create an account
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md hover:border-white/30 active:scale-[0.98] transition-all"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
