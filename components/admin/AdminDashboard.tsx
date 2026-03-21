'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/Badge';

export function AdminDashboard({ initialPosts, categories, stats }: { initialPosts: any[]; categories: any[]; stats: Record<string, number> }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filters, setFilters] = useState({ q: '', status: '', category: '', date: '' });
  const [generate, setGenerate] = useState({ category: 'football', topic: 'Premier League title race update' });
  const [busy, setBusy] = useState(false);

  const filteredPosts = useMemo(() => posts.filter((post) => {
    const matchText = !filters.q || [post.title, post.summary, post.tags].join(' ').toLowerCase().includes(filters.q.toLowerCase());
    const matchStatus = !filters.status || post.status === filters.status;
    const matchCategory = !filters.category || post.category.slug === filters.category;
    const dateValue = post.publishedAt || post.createdAt;
    const matchDate = !filters.date || new Date(dateValue).toISOString().slice(0, 10) === filters.date;
    return matchText && matchStatus && matchCategory && matchDate;
  }), [filters, posts]);

  async function generateBlog() {
    setBusy(true);
    const response = await fetch('/api/admin/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generate),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return alert(data.error || 'Generation failed');
    setPosts((current) => [data.post, ...current]);
  }

  async function deletePost(id: string) {
    if (!window.confirm('Delete this blog post?')) return;
    const response = await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' });
    if (response.ok) setPosts((current) => current.filter((post) => post.id !== id));
  }

  return (
    <div className="page-section shell">
      <section className="hero">
        <span className="kicker">Admin newsroom</span>
        <h1>Review AI-generated drafts, upload feature images, and publish safely.</h1>
        <p>The dashboard keeps generated stories in draft or pending review until an admin edits the outline, finalizes content, uploads the feature image, and approves publication.</p>
      </section>

      <section className="stats-grid page-section">
        {Object.entries(stats).map(([key, value]) => (
          <div className="stat-card" key={key}>
            <div className="stat-label">{key}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </section>

      <section className="split">
        <div className="panel form-stack">
          <h2>Generate blog</h2>
          <select className="input" value={generate.category} onChange={(e) => setGenerate((current) => ({ ...current, category: e.target.value }))}>
            <option value="football">Football</option>
            <option value="cricket">Cricket</option>
          </select>
          <input className="input" value={generate.topic} onChange={(e) => setGenerate((current) => ({ ...current, topic: e.target.value }))} placeholder="Enter a topic" />
          <button className="button button-primary" onClick={generateBlog} disabled={busy}>{busy ? 'Generating…' : 'Generate Blog'}</button>
        </div>

        <div className="panel form-stack">
          <h2>Filter drafts</h2>
          <input className="input" placeholder="Search drafts" value={filters.q} onChange={(e) => setFilters((current) => ({ ...current, q: e.target.value }))} />
          <select className="input" value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="input" value={filters.category} onChange={(e) => setFilters((current) => ({ ...current, category: e.target.value }))}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
          </select>
          <input className="input" type="date" value={filters.date} onChange={(e) => setFilters((current) => ({ ...current, date: e.target.value }))} />
        </div>
      </section>

      <section className="panel page-section">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>AI</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <strong>{post.title}</strong>
                    <div className="muted-text">{post.summary}</div>
                  </td>
                  <td>{post.category.name}</td>
                  <td><Badge tone={post.status}>{post.status.replace('_', ' ')}</Badge></td>
                  <td>{post.generatedByAI ? 'Yes' : 'No'}</td>
                  <td>{new Date(post.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="inline-actions">
                      <a className="button button-secondary" href={`/admin/blogs/${post.id}`}>Review</a>
                      <button className="button button-danger" onClick={() => deletePost(post.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
