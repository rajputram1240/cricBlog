import { getSiteContent } from '@/lib/data';

export default async function AboutPage() {
  const content = await getSiteContent('about');

  return (
    <main className="shell page-section info-page">
      <section className="panel info-page-card">
        <span className="kicker">About us</span>
        <h1>{content.title}</h1>
        <p className="info-page-lead">{content.description}</p>
        <div className="info-page-body">
          <p>{content.body}</p>
        </div>
      </section>
    </main>
  );
}
