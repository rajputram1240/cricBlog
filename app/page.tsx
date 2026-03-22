import Link from 'next/link';
import { BlogCard } from '@/components/BlogCard';
import { SearchFilters } from '@/components/SearchFilters';
import { getPublishedPosts } from '@/lib/data';

const highlights = [
  {
    title: 'Human-reviewed AI stories',
    text: 'Every football and cricket article starts as an assisted draft, then goes through admin editing, image upload, and approval before it is published.',
  },
  {
    title: 'Fast discovery for readers',
    text: 'Visitors can search breaking topics, browse by category, and quickly find match analysis, transfer news, and tournament updates.',
  },
  {
    title: 'Built for content partners',
    text: 'Brands, clubs, and media partners can collaborate with the editorial team to publish campaigns, sponsored features, and audience-first sports stories.',
  },
];

const infoSections = [
  {
    id: 'about',
    kicker: 'About us',
    title: 'A modern sports newsroom for football and cricket fans.',
    body: 'SportsDraft Daily blends AI-assisted drafting with hands-on editorial checks so readers get timely updates without sacrificing quality. Our workflow helps the team move quickly while keeping every story aligned with newsroom standards.',
  },
  {
    id: 'privacy',
    kicker: 'Privacy policy',
    title: 'Your search, browsing, and contact details are handled responsibly.',
    body: 'We only collect the minimum information needed to improve the reading experience, manage contact requests, and maintain site security. Sensitive admin actions remain protected behind the newsroom workflow, and public readers never see draft-only content.',
  },
  {
    id: 'partner',
    kicker: 'Partner with us',
    title: 'Work with our team on campaigns, co-branded coverage, and content distribution.',
    body: 'If you want to promote a sports product, sponsor a special series, or contribute to our fan community, our editorial and admin team can manage assets, upload content, and review each partnership submission before launch.',
  },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; date?: string }> }) {
  const params = await searchParams;
  const posts = await getPublishedPosts({ query: params.q, category: params.category, date: params.date });

  return (
    <main>
      <section className="hero-shell">
        <div className="shell page-section hero hero-landing">
          <div className="hero-copy">
            <span className="kicker">Daily Football & Cricket Coverage</span>
            <h1>Attractive sports coverage powered by AI drafts, polished by editors, and ready for fans every day.</h1>
            <p>
              Discover a smarter sports homepage with featured football and cricket stories, trusted editorial review, and an admin workflow that uploads content, adds visuals, and publishes only after approval.
            </p>
            <div className="hero-actions">
              <Link href="/admin" className="button button-primary">Open admin newsroom</Link>
              <a href="#about" className="button button-secondary">Learn more</a>
            </div>
          </div>

          <div className="hero-panel card">
            <div className="card-body">
              <div className="eyebrow-row">
                <span>Publishing workflow</span>
                <span>Editor approved</span>
              </div>
              <h2 className="feature-title">Admin can generate, upload, review, and publish content from one place.</h2>
              <div className="feature-list">
                <div>
                  <strong>Create draft</strong>
                  <p className="muted-text">Start AI-assisted coverage for match previews, recaps, and transfer updates.</p>
                </div>
                <div>
                  <strong>Upload media</strong>
                  <p className="muted-text">Add feature images and polish story summaries before anything goes live.</p>
                </div>
                <div>
                  <strong>Approve with confidence</strong>
                  <p className="muted-text">Keep all public content behind a review-first workflow for quality and consistency.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell page-section">
        <div className="highlights-grid">
          {highlights.map((item) => (
            <article key={item.title} className="panel feature-card">
              <span className="kicker">Why readers stay</span>
              <h3>{item.title}</h3>
              <p className="muted-text">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell page-section">
        <SearchFilters defaultCategory={params.category} defaultQuery={params.q} defaultDate={params.date} />
      </section>

      <section className="shell page-section info-grid">
        {infoSections.map((section) => (
          <article key={section.id} id={section.id} className="panel info-card">
            <span className="kicker">{section.kicker}</span>
            <h2>{section.title}</h2>
            <p className="muted-text">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="shell page-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Latest stories</span>
            <h2>Fresh football and cricket posts from the public newsroom.</h2>
          </div>
          <p className="muted-text section-copy">Use the search tools above to narrow stories by keyword, category, or publishing date.</p>
        </div>
        <div className="grid-3">
          {posts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
        {posts.length === 0 ? <div className="empty-state card">No published posts matched your filters.</div> : null}
      </section>
    </main>
  );
}
