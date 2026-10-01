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
      <div className="max-w-2xl">
        <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-semibold mb-2">
          The Archive & Library
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-neutral-950 tracking-tight mb-3">
          Articles & Technical Guides
        </h1>
        <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
          In-depth perspectives on software engineering, distributed systems, web architectures, and developer tooling.
        </p>
      </div>

      {/* Understated Editorial Writer Invitation with Subtle Brand Tint */}
      {!currentUser && (
        <div className="border border-brand-200/80 bg-brand-50/40 rounded-md p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-0.5">
            <h2 className="font-serif text-base font-bold text-neutral-950">Publish with bloggerMe</h2>
            <p className="text-neutral-600 text-xs max-w-lg">
              Write in clean Markdown, build your technical portfolio, and share engineering knowledge with a dedicated audience.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <PenSquare size={13} /> Start Writing
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-3.5 py-2 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 hover:border-brand-300 text-neutral-700 text-xs transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Search and Tags */}
      <div className="space-y-4 pt-2">
        <div className="max-w-md">
          <Input
            type="text"
            placeholder="Search articles by title, topic, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} className="text-neutral-400" />}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${!selectedTag ? 'bg-brand-600 text-white font-semibold shadow-xs' : 'bg-white text-neutral-600 border border-neutral-300 hover:border-brand-300 hover:text-brand-600'}`}
          >
            All Topics
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${selectedTag === tag ? 'bg-brand-600 text-white font-semibold shadow-xs' : 'bg-white text-neutral-600 border border-neutral-300 hover:border-brand-300 hover:text-brand-600'}`}
            >
              #{tag}
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
