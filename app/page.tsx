import Link from 'next/link';
import { BlogCard } from '@/components/BlogCard';
import { SearchFilters } from '@/components/SearchFilters';
import { getPublishedPosts } from '@/lib/data';

const editorialSignals = [
  {
    value: '24/7',
    label: 'Matchday energy',
    detail: 'Built for readers who want fresh football and cricket talking points all day.',
  },
  {
    value: '2',
    label: 'Core sports',
    detail: 'A clean split between football and cricket keeps the homepage focused and easy to scan.',
  },
  {
    value: '3',
    label: 'Fan experiences',
    detail: 'Stories, live community chat, and ticket actions all work together on one front page.',
  },
];

const categoryPillars = [
  {
    title: 'Football pulse',
    description: 'Transfers, tactical storylines, title-race pressure, and the clubs your readers follow most.',
    href: '/category/football',
    cta: 'Explore football',
  },
  {
    title: 'Cricket central',
    description: 'Series narratives, tournament swings, squad selection news, and matchday context in one place.',
    href: '/category/cricket',
    cta: 'Explore cricket',
  },
  {
    title: 'Fan action',
    description: 'Open community chat rooms, browse ticket opportunities, and keep supporters participating beyond reading.',
    href: '/fan-chat',
    cta: 'Join the community',
  },
];

const fanDestinations = [
  {
    eyebrow: 'Live now',
    title: 'Matchday fan chat',
    text: 'Give supporters a dedicated place to debate moments, celebrate wins, and react together in real time.',
    href: '/fan-chat',
  },
  {
    eyebrow: 'Marketplace',
    title: 'Cricket ticket exchange',
    text: 'Turn the homepage into a utility hub where fans can find and bid on the tickets they actually need.',
    href: '/tickets',
  },
  {
    eyebrow: 'Brand story',
    title: 'About SportsDraft',
    text: 'Reinforce trust with a clear explanation of the newsroom, tone, and fan-first mission behind the site.',
    href: '/about',
  },
  {
    eyebrow: 'Growth',
    title: 'Partner with us',
    text: 'Create a polished landing point for sponsors, collaborators, and campaigns that want sports reach.',
    href: '/partner-with-us',
  },
];

const homepagePromises = [
  'A modern hero area that immediately feels premium and sports-focused.',
  'Clear pathways into football, cricket, and fan tools without making readers hunt.',
  'Story sections that stay useful even when filtered content or database data is limited.',
];

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; date?: string }> }) {
  const params = await searchParams;

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  let dataWarning: string | null = null;

  try {
    posts = await getPublishedPosts({ query: params.q, category: params.category, date: params.date });
  } catch {
    dataWarning = 'Stories are temporarily unavailable because the database connection is not configured yet.';
  }

  const featuredPosts = posts.slice(0, 3);
  const morePosts = posts.slice(3, 9);
  const spotlightPost = posts[0];

  return (
    <main className="homepage-main">
      <section className="hero-shell sports-hero-shell homepage-hero">
        <div className="shell homepage-hero-grid page-section">
          <div className="homepage-hero-copy">
            <div className="headline-stack">
              <span className="kicker">SportsDraft Daily</span>
              <span className="live-pill">Redesigned homepage experience</span>
              <h1>Where football headlines, cricket buzz, and fan energy meet in one sharp front page.</h1>
              <p>
                This new home page is designed to feel more premium, more useful, and more exciting at first glance—so readers can discover top stories, dive into categories, and take fan actions without friction.
              </p>
            </div>

            <div className="hero-actions">
              <Link href="#featured-stories" className="button button-primary">View top stories</Link>
              <Link href="/category/football" className="button button-secondary">Football hub</Link>
              <Link href="/category/cricket" className="button button-secondary">Cricket hub</Link>
            </div>

            <div className="homepage-hero-highlights">
              {editorialSignals.map((item) => (
                <article key={item.label} className="homepage-signal-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="homepage-hero-panel card">
            <div className="card-body homepage-panel-body">
              <div className="homepage-panel-top">
                <div>
                  <span className="kicker">Front page spotlight</span>
                  <h2>Built to convert casual readers into active fans.</h2>
                </div>
                <span className="scoreboard-tag">New look</span>
              </div>

              <div className="homepage-spotlight card">
                <div className="card-body homepage-spotlight-body">
                  <span className="homepage-spotlight-label">Editor&apos;s pick</span>
                  <h3>{spotlightPost?.title ?? 'A bold hero still works even before live content is connected.'}</h3>
                  <p className="muted-text">
                    {spotlightPost?.summary ?? 'The layout keeps the homepage visually strong with editorial messaging, category shortcuts, and fan actions while story data is still loading or unavailable.'}
                  </p>
                  <div className="homepage-spotlight-meta">
                    <span>{spotlightPost?.category?.name ?? 'Sports coverage'}</span>
                    <span>{posts.length > 0 ? `${posts.length} stories available` : 'Content-ready design'}</span>
                  </div>
                </div>
              </div>

              <div className="homepage-promise-list">
                {homepagePromises.map((promise) => (
                  <div key={promise} className="homepage-promise-item">
                    <span className="homepage-promise-dot" />
                    <p>{promise}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {dataWarning ? (
        <section className="shell page-section">
          <div className="notice-banner">{dataWarning}</div>
        </section>
      ) : null}

      <section className="shell page-section homepage-pillar-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Navigate faster</span>
            <h2>The homepage now guides readers instead of overwhelming them.</h2>
          </div>
          <p className="muted-text section-copy">Each entry point is designed to give the page stronger visual rhythm and clearer next steps.</p>
        </div>

        <div className="homepage-pillar-grid">
          {categoryPillars.map((pillar) => (
            <Link key={pillar.title} href={pillar.href} className="card homepage-pillar-card">
              <div className="card-body">
                <span className="kicker">Quick access</span>
                <h3>{pillar.title}</h3>
                <p className="muted-text">{pillar.description}</p>
                <span className="text-link">{pillar.cta} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell page-section">
        <SearchFilters defaultCategory={params.category} defaultQuery={params.q} defaultDate={params.date} />
      </section>

      <section className="shell page-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Featured stories</span>
            <h2>Big reads that deserve the first scroll.</h2>
          </div>
          <p className="muted-text section-copy">A stronger visual hierarchy makes the most important stories feel intentional and easy to trust.</p>
        </div>
        <div id="featured-stories" className="grid-3">
          {featuredPosts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
        {featuredPosts.length === 0 ? <div className="empty-state card">No featured stories are available yet, but the homepage design is ready for them.</div> : null}
      </section>

      <section className="shell page-section homepage-fan-zone-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Fan destinations</span>
            <h2>More than a news feed—this homepage now feels like a complete sports platform.</h2>
          </div>
          <p className="muted-text section-copy">These supporting cards create balance on the page and make the ecosystem around the stories much more visible.</p>
        </div>

        <div className="homepage-destination-grid">
          {fanDestinations.map((item) => (
            <Link key={item.title} href={item.href} className="card homepage-destination-card">
              <div className="card-body">
                <span className="kicker">{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p className="muted-text">{item.text}</p>
                <span className="text-link">Open section →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell page-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Latest from the newsroom</span>
            <h2>Keep browsing with a feed that still feels airy and polished.</h2>
          </div>
          <p className="muted-text section-copy">Spacing, grouping, and balanced cards make the lower half of the page feel cleaner and more premium.</p>
        </div>
        <div className="grid-3">
          {morePosts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
        {posts.length === 0 ? <div className="empty-state card">No sports stories matched your filters.</div> : null}
      </section>
    </main>
  );
}
