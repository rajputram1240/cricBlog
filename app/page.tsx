import Link from 'next/link';
import { BlogCard } from '@/components/BlogCard';
import { SearchFilters } from '@/components/SearchFilters';
import { getPublishedPosts } from '@/lib/data';

const highlights = [
  {
    title: 'Fast discovery',
    text: 'Readers can jump from the hero to the biggest stories in one scroll.',
  },
  {
    title: 'Fan-friendly actions',
    text: 'Football, cricket, chat, and tickets stay easy to reach from the homepage.',
  },
  {
    title: 'Cleaner reading flow',
    text: 'The homepage stays simple while still encouraging deeper browsing.',
  },
];

const infoSections = [
  {
    id: 1,
    kicker: 'About',
    title: 'About SportsDraft',
    body: 'Learn what we cover and how we bring sports stories to fans.',
    href: '/about',
  },
  {
    id: 2,
    kicker: 'Partner',
    title: 'Partner With Us',
    body: 'Collaborate with us for campaigns and promotions.',
    href: '/partner-with-us',
  },
  {
    id: 3,
    kicker: 'Community',
    title: 'Fan Features',
    body: 'Explore chat, tickets, and engagement tools.',
    href: '/fan-chat',
  },
];

const fanZones = [
  {
    label: 'Community',
    title: 'Fan Chat',
    body: 'Discuss matches, share opinions, and connect with fans.',
    href: '/fan-chat',
    accent: 'accent-blue',
  },
  {
    label: 'Tickets',
    title: 'Buy Tickets',
    body: 'Find and bid on cricket match tickets easily.',
    href: '/tickets',
    accent: 'accent-green',
  },
  {
    label: 'Explore',
    title: 'Football Hub',
    body: 'All football stories, transfers, and match previews.',
    href: '/category/football',
    accent: 'accent-purple',
  },
];

const engagementCards = [
  {
    title: 'Football stories',
    text: 'Go straight to transfer news, match previews, and big-club updates.',
    href: '/category/football',
    cta: 'Explore football',
  },
  {
    title: 'Cricket stories',
    text: 'Follow series drama, squad changes, and tournament momentum in one place.',
    href: '/category/cricket',
    cta: 'Explore cricket',
  },
  {
    title: 'Fan community',
    text: 'Join chat, browse tickets, and keep the homepage useful beyond headlines.',
    href: '/fan-chat',
    cta: 'Open fan chat',
  },
];

const quickStats = [
  { label: 'Stories live', value: 'Always fresh' },
  { label: 'Sports covered', value: 'Football + Cricket' },
  { label: 'Fan tools', value: 'Chat + Tickets' },
];

const simpleLinks = [
  { title: 'Ticket auction', text: 'Buy and sell cricket tickets with fan bidding.', href: '/tickets' },
  { title: 'About newsroom', text: 'Learn what SportsDraft Daily covers and why.', href: '/about' },
  { title: 'Partner with us', text: 'Promote campaigns, products, or content together.', href: '/partner-with-us' },
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

  return (
    <main>
      <section className="hero-shell sports-hero-shell simple-home-hero">
        <div className="shell page-section simple-home-grid">
          <div className="simple-home-copy">
            <span className="kicker">SportsDraft Daily</span>
            <span className="live-pill">Simple, fan-first sports home</span>
            <h1>Catch football and cricket stories faster, with less clutter.</h1>
            <p>
              The homepage is now cleaner and more engaging, so readers can quickly discover breaking stories, jump into categories, and join fan features without feeling overloaded.
            </p>
            <div className="hero-actions">
              <Link href="/#featured-stories" className="button button-primary">Read top stories</Link>
              <Link href="/category/football" className="button button-secondary">Football</Link>
              <Link href="/category/cricket" className="button button-secondary">Cricket</Link>
            </div>

            <div className="simple-stat-row">
              {quickStats.map((item) => (
                <div key={item.label} className="simple-stat-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell page-section simple-highlights-section">
        <div className="highlights-grid simple-highlights-grid">
          {highlights.map((item, index) => (
            <article key={item.title} className="simple-highlight-card">
              <span className="feature-index">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p className="muted-text">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {dataWarning ? (
        <section className="shell page-section">
          <div className="notice-banner">{dataWarning}</div>
        </section>
      ) : null}

      <section className="shell page-section">
        <SearchFilters defaultCategory={params.category} defaultQuery={params.q} defaultDate={params.date} />
      </section>

      <section className="shell page-section simple-strip-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Quick sections</span>
            <h2>Useful homepage links for readers and fans.</h2>
          </div>
          <p className="muted-text section-copy">A simple set of actions keeps engagement high without making the page feel busy.</p>
        </div>

        <div className="simple-link-grid">
          {simpleLinks.map((item) => (
            <Link key={item.title} href={item.href} className="simple-link-card card">
              <div className="card-body">
                <h3>{item.title}</h3>
                <p className="muted-text">{item.text}</p>
                <span className="text-link">Open page →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell page-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Featured stories</span>
            <h2>Top football and cricket reads right now.</h2>
          </div>
          <p className="muted-text section-copy">Start with the biggest stories, then continue into the full feed below.</p>
        </div>
        <div id="featured-stories" className="grid-3">
          {featuredPosts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
      </section>

      <section className="shell page-section info-band-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Beyond the headlines</span>
            <h2>Extra ways fans can engage with the platform.</h2>
          </div>
          <p className="muted-text section-copy">These sections add community, utility, and trust signals so the homepage feels full and purposeful.</p>
        </div>
        <div className="info-grid home-info-grid">
          {infoSections.map((section) => (
            <Link key={section.id} href={section.href} className="card info-card home-info-card">
              <div className="card-body">
                <span className="kicker">{section.kicker}</span>
                <h3>{section.title}</h3>
                <p className="muted-text">{section.body}</p>
                <span className="text-link">Learn more →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell page-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Latest from the newsroom</span>
            <h2>More stories for fans who want to keep browsing.</h2>
          </div>
          <p className="muted-text section-copy">New stories stay easy to scan with a cleaner feed layout.</p>
        </div>
        <div className="grid-3">
          {morePosts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
        {posts.length === 0 ? <div className="empty-state card">No sports stories matched your filters.</div> : null}
      </section>
    </main>
  );
}
