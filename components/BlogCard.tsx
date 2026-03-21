import Link from 'next/link';
import { formatDate, excerpt } from '@/lib/utils';

export function BlogCard({ post }: { post: any }) {
  return (
    <article className="card blog-card">
      <img
        src={post.featureImage || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80'}
        alt={post.title}
        className="blog-card-image"
      />
      <div className="card-body">
        <div className="eyebrow-row">
          <span>{post.category.name}</span>
          <span>•</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
        <div>
          <h2 className="blog-card-title"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
          <p className="muted-text">{post.summary || excerpt(post.content)}</p>
        </div>
        <div className="meta-row">
          <span>{post.authorName}</span>
          <Link href={`/blog/${post.slug}`} className="text-link">Read story →</Link>
        </div>
      </div>
    </article>
  );
}
