import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { getPostBySlug } from '@/lib/data';

export default async function BlogDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== 'published') notFound();

  return (
    <main className="shell page-section">
      <article className="article">
        <img src={post.featureImage || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80'} alt={post.title} className="blog-card-image" />
        <div className="article-content">
          <div className="eyebrow-row">
            <span>{post.category.name}</span>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{post.authorName}</span>
          </div>
          <h1>{post.title}</h1>
          <p className="muted-text">{post.summary}</p>
          <div className="markdown-preview">{post.content}</div>
        </div>
      </article>
    </main>
  );
}
