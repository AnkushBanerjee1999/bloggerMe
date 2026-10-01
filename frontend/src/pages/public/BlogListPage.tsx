import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Sparkles, PenSquare, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PostCard } from '@/components/PostCard';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { mockPosts } from '@/data/mockData';

export function BlogListPage() {
  const { posts, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const publishedPosts = posts.filter(p => p.status === 'published');
  const hasRealPosts = publishedPosts.length > 0;
  // If DB is empty, provide curated community sample posts for discovery
  const basePosts = hasRealPosts ? publishedPosts : mockPosts.filter(p => p.status === 'published');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    basePosts.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [basePosts]);

  const filtered = useMemo(() => {
    let result = basePosts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTag) {
      result = result.filter(p => p.tags.includes(selectedTag));
    }
    return result;
  }, [basePosts, search, selectedTag]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-16 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-3">
          <Sparkles size={14} /> Knowledge Hub
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">The Blog</h1>
        <p className="text-gray-500 text-base">Browse all technical articles, explore popular topics, or search for tutorials.</p>
      </div>

      {/* Unauthenticated Visitor Join Banner */}
      {!currentUser && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-lg md:text-xl font-bold">Write and share your own stories</h2>
            <p className="text-blue-100 text-sm max-w-md">
              Join our developer community to publish articles, highlight code snippets, and receive feedback.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-blue-700 font-semibold text-sm shadow hover:bg-blue-50 transition-colors"
            >
              <PenSquare size={16} /> Start Writing
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/40 bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-sm transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Search and Tags */}
      <div className="space-y-4">
        <div className="max-w-xl mx-auto">
          <Input
            type="text"
            placeholder="Search articles by title, summary, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${!selectedTag ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            All Topics
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${selectedTag === tag ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <span>{filtered.length} {filtered.length === 1 ? 'article' : 'articles'} found</span>
        {!hasRealPosts && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
            Sample Preview Collection
          </span>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No articles found"
          description="Try adjusting your search terms or clearing the selected tag filter."
          action={
            <Button variant="outline" size="sm" onClick={() => { setSearch(''); setSelectedTag(null); }}>
              Reset Filters
            </Button>
          }
        />
      )}
    </div>
  );
}
