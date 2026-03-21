import { notFound } from 'next/navigation';
import { BlogCard } from '@/components/BlogCard';
import { getPublishedPosts } from '@/lib/data';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!['football', 'cricket'].includes(slug)) notFound();
  const posts = await getPublishedPosts({ category: slug });

  return (
    <main className="shell page-section">
      <section className="hero">
        <span className="kicker">Category</span>
        <h1>{slug === 'football' ? 'Football' : 'Cricket'} stories</h1>
        <p>Browse the latest published {slug} analysis, reports, previews, and tactical breakdowns.</p>
      </section>
      <section className="grid-3">
        {posts.map((post) => <BlogCard key={post.id} post={post} />)}
      </section>
    </main>
  );
}
