import { BlogCard } from '@/components/BlogCard';
import { SearchFilters } from '@/components/SearchFilters';
import { getPublishedPosts } from '@/lib/data';

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; date?: string }> }) {
  const params = await searchParams;
  const posts = await getPublishedPosts({ query: params.q, category: params.category, date: params.date });

  return (
    <main className="shell page-section">
      <section className="hero">
        <span className="kicker">Daily Football & Cricket Coverage</span>
        <h1>AI-generated sports drafts, carefully reviewed by human editors before publication.</h1>
        <p>
          Explore the latest published football and cricket stories, search by keyword, and filter by category or date. Every post enters the newsroom as a draft and only reaches the public site after admin review, image upload, and approval.
        </p>
      </section>

      <SearchFilters defaultCategory={params.category} defaultQuery={params.q} defaultDate={params.date} />

      <section className="page-section">
        <div className="grid-3">
          {posts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
        {posts.length === 0 ? <div className="empty-state card">No published posts matched your filters.</div> : null}
      </section>
    </main>
  );
}
