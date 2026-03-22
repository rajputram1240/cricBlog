import Link from 'next/link';
import { BlogCard } from '@/components/BlogCard';
import { SearchFilters } from '@/components/SearchFilters';
import { getPublishedPosts } from '@/lib/data';

const highlights = [
  {
    title: 'Breaking in one scroll',
    text: 'Lead stories, matchday buzz, and fan tools are surfaced above the fold so visitors instantly know where to go.',
  },
  {
    title: 'Built for football + cricket',
    text: 'Dual-sport storytelling, category shortcuts, and featured reads make the landing page feel more focused and energetic.',
  },
  {
    title: 'Reader-friendly discovery',
    text: 'Cards, spotlight stats, and clear sections guide fans from hero to headlines without visual clutter.',
  },
];

const fanZones = [
  {
    title: 'Football focus',
    body: 'Premier League, Champions League, transfer watch, match previews, post-match analysis, and standout player updates.',
    href: '/category/football',
    label: 'Browse football',
    accent: 'football-zone',
  },
  {
    title: 'Cricket center',
    body: 'International cricket, franchise leagues, squad updates, tactical breakdowns, and tournament momentum stories.',
    href: '/category/cricket',
    label: 'Browse cricket',
    accent: 'cricket-zone',
  },
];

const usefulLinks = [
  'Search by team, player, or topic',
  'Filter by category and date',
  'Catch the latest football and cricket stories',
  'Move quickly between categories and headlines',
];

const infoSections = [
  {
    id: 'about',
    href: '/about',
    kicker: 'About us',
    title: 'A modern sports newsroom for football and cricket fans.',
    body: 'SportsDraft Daily delivers football and cricket coverage with a modern sports-news feel, combining quick updates, featured storylines, and easy browsing for fans who want the latest talking points.',
  },
  {
    id: 'privacy',
    href: '/privacy-policy',
    kicker: 'Privacy policy',
    title: 'Your search, browsing, and contact details are handled responsibly.',
    body: 'We only collect the minimum information needed to improve the reading experience, manage contact requests, and maintain site security. Sensitive admin actions remain protected behind the newsroom workflow, and public readers never see draft-only content.',
  },
  {
    id: 'partner',
    href: '/partner-with-us',
    kicker: 'Partner with us',
    title: 'Work with our team on campaigns, co-branded coverage, and content distribution.',
    body: 'If you want to promote a sports product, sponsor a special series, or contribute to our fan community, our editorial and admin team can manage assets, upload content, and review each partnership submission before launch.',
  },
  {
    id: 'tickets',
    href: '/tickets',
    kicker: 'Ticket auction',
    title: 'Fans can list upcoming cricket tickets, collect bids, and sell to the best offer.',
    body: 'The new fan exchange lets supporters log in, post one ticket per day, accept auction-style comments from buyers, delete weak listings, and reward standout bidders after the sale.',
  },
  {
    id: 'fan-chat',
    href: '/fan-chat',
    kicker: 'Fan chat',
    title: 'One shared sports chat for daily banter with reporting and admin moderation.',
    body: 'Fans join the common chat using only a name and phone number, while admins can review reports, hide abusive or sexual messages, block repeat offenders, and let the room auto-reset every morning at 10:00 UTC.',
  },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; date?: string }> }) {
  const params = await searchParams;
  const posts = await getPublishedPosts({ query: params.q, category: params.category, date: params.date });
  const featuredPosts = posts.slice(0, 3);

  return (
    <main>
      <section className="hero-shell sports-hero-shell home-hero-shell">
        <div className="shell page-section hero hero-landing sports-hero-grid home-hero-grid">
          <div className="hero-copy">
            <span className="kicker">Sports news hub</span>
            <div className="headline-stack">
              <span className="live-pill">Live style sports coverage</span>
              <h1>Make every homepage visit feel like walking into a buzzing matchday newsroom.</h1>
            </div>
            <p>
              Discover football and cricket stories through a brighter, layered landing page with stronger hierarchy, spotlighted fan tools, and fast paths into the latest talking points.
            </p>
            <div className="hero-actions">
              <Link href="/category/football" className="button button-primary">Football news</Link>
              <Link href="/category/cricket" className="button button-secondary">Cricket news</Link>
              <Link href="/tickets" className="button button-secondary">Ticket auction</Link>
              <Link href="/fan-chat" className="button button-secondary">Fan chat</Link>
              <Link href="/#featured-stories" className="button button-secondary">Top stories</Link>
            </div>
            <div className="utility-list">
              {usefulLinks.map((item) => (
                <span key={item} className="utility-chip">{item}</span>
              ))}
            </div>
          </div>

          <div className="hero-side-stack">
            <div className="hero-scoreboard card hero-glow-card">
              <div className="card-body scoreboard-body">
                <div className="scoreboard-top">
                  <span className="kicker">Fan dashboard</span>
                  <span className="scoreboard-tag">Top stories now</span>
                </div>
                <div className="score-lines">
                  <div className="score-line football-line">
                    <div>
                      <strong>Football</strong>
                      <p className="muted-text">Transfer buzz, title races, tactical reads</p>
                    </div>
                    <span>90&apos;</span>
                  </div>
                  <div className="score-line cricket-line">
                    <div>
                      <strong>Cricket</strong>
                      <p className="muted-text">Series stories, squad calls, tournament pulse</p>
                    </div>
                    <span>50 ov</span>
                  </div>
                </div>
                <div className="feature-list">
                  <div>
                    <strong>Breaking headlines</strong>
                    <p className="muted-text">Big match updates, transfer stories, and tournament buzz surfaced fast.</p>
                  </div>
                  <div>
                    <strong>Matchday pulse</strong>
                    <p className="muted-text">Follow previews, key moments, and post-match reaction across major fixtures.</p>
                  </div>
                  <div>
                    <strong>Fan-first reads</strong>
                    <p className="muted-text">Clean sports storytelling focused on football rivalries and cricket storylines.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-stats-strip">
              <div className="mini-stat card">
                <div className="card-body">
                  <span className="kicker">Coverage</span>
                  <strong>{posts.length}</strong>
                  <p className="muted-text">Stories available to explore right now.</p>
                </div>
              </div>
              <div className="mini-stat card">
                <div className="card-body">
                  <span className="kicker">Featured</span>
                  <strong>{featuredPosts.length}</strong>
                  <p className="muted-text">Top stories highlighted for fast reading.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell page-section home-overview-grid">
        <div className="card sports-panel overview-panel">
          <div className="card-body">
            <div className="section-heading compact-section-heading">
              <div>
                <span className="kicker">Why this homepage feels better</span>
                <h2>Sharper sections, stronger contrast, and a more premium first impression.</h2>
              </div>
            </div>
            <div className="highlights-grid">
              {highlights.map((item, index) => (
                <article key={item.title} className="feature-card home-feature-card">
                  <span className="feature-index">0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p className="muted-text">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="card sports-panel quick-links-panel">
          <div className="card-body">
            <span className="kicker">Quick fan routes</span>
            <h2 className="feature-title">Jump from the homepage to the experience you want.</h2>
            <div className="fan-zone-grid home-fan-zone-grid">
              {fanZones.map((zone) => (
                <Link key={zone.title} href={zone.href} className={`fan-zone-card ${zone.accent}`}>
                  <span className="kicker">{zone.label}</span>
                  <h3>{zone.title}</h3>
                  <p className="muted-text">{zone.body}</p>
                  <span className="text-link">Open section →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell page-section">
        <SearchFilters defaultCategory={params.category} defaultQuery={params.q} defaultDate={params.date} />
      </section>

      <section className="shell page-section content-spotlight-section">
        <div className="section-heading">
          <div>
            <span className="kicker">Featured stories</span>
            <h2>Latest football and cricket stories ready for sports fans.</h2>
          </div>
          <p className="muted-text section-copy">Read the newest football and cricket coverage below, then use search and category filters to find exactly what you want.</p>
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
            <span className="kicker">More from the newsroom</span>
            <h2>Fresh football and cricket posts from the public newsroom.</h2>
          </div>
          <p className="muted-text section-copy">Use the search tools above to narrow stories by keyword, category, or publishing date.</p>
        </div>
        <div className="grid-3">
          {posts.slice(3).map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
        {posts.length === 0 ? <div className="empty-state card">No sports stories matched your filters.</div> : null}
      </section>
    </main>
  );
}
