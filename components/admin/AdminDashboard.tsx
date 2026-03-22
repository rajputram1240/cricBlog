'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/Badge';

export function AdminDashboard({ initialPosts, categories, stats, initialSiteContent, adminName, initialChat }: { initialPosts: any[]; categories: any[]; stats: Record<string, number>; initialSiteContent: any[]; adminName: string; initialChat: { users: any[]; messages: any[]; reports: any[] } }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [filters, setFilters] = useState({ q: '', status: '', category: '', date: '' });
  const [generate, setGenerate] = useState({ category: 'football', topic: 'Premier League title race update' });
  const [siteContent, setSiteContent] = useState(initialSiteContent);
  const [chat, setChat] = useState(initialChat);
  const [busy, setBusy] = useState(false);
  const [savingSlug, setSavingSlug] = useState('');
  const [chatBusy, setChatBusy] = useState('');
  const [adminReason, setAdminReason] = useState<Record<string, string>>({});

  const filteredPosts = useMemo(() => posts.filter((post) => {
    const matchText = !filters.q || [post.title, post.summary, post.tags].join(' ').toLowerCase().includes(filters.q.toLowerCase());
    const matchStatus = !filters.status || post.status === filters.status;
    const matchCategory = !filters.category || post.category.slug === filters.category;
    const dateValue = post.publishedAt || post.createdAt;
    const matchDate = !filters.date || new Date(dateValue).toISOString().slice(0, 10) === filters.date;
    return matchText && matchStatus && matchCategory && matchDate;
  }), [filters, posts]);

  async function refreshChat() {
    router.refresh();
  }

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

  async function saveContent(entry: any) {
    setSavingSlug(entry.slug);
    const response = await fetch('/api/admin/site-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    const data = await response.json();
    setSavingSlug('');
    if (!response.ok) return alert(data.error || 'Unable to save content');
    setSiteContent((current) => current.map((item) => (item.slug === entry.slug ? data.content : item)));
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  async function runChatAction(id: string, action: 'delete_message' | 'block_user' | 'dismiss_report') {
    setChatBusy(`${action}-${id}`);
    const response = await fetch(`/api/admin/chat/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason: adminReason[id] || '' }),
    });
    const data = await response.json().catch(() => ({}));
    setChatBusy('');
    if (!response.ok) return alert(data.error || 'Chat action failed');
    setChat((current) => ({
      ...current,
      messages: current.messages.filter((message) => action === 'delete_message' ? message.id !== id : true),
      users: current.users.map((user) => action === 'block_user' && user.id === id ? { ...user, isBlocked: true, blockReason: adminReason[id] || 'Blocked by admin' } : user),
      reports: current.reports.filter((report) => action === 'dismiss_report' ? report.id !== id : true).map((report) => {
        if (action === 'delete_message' && report.messageId === id) return { ...report, status: 'actioned' };
        if (action === 'block_user' && report.reportedUserId === id) return { ...report, status: 'actioned' };
        return report;
      }),
    }));
    await refreshChat();
  }

  return (
    <div className="page-section shell">
      <section className="hero admin-hero">
        <div>
          <span className="kicker">Admin newsroom</span>
          <h1>Review stories, manage your public pages, and publish safely.</h1>
          <p>The dashboard keeps generated stories in draft or pending review until an admin edits the outline, finalizes content, uploads the feature image, and approves publication.</p>
        </div>
        <div className="admin-toolbar">
          <div className="panel admin-welcome">
            <span className="kicker">Signed in</span>
            <strong>{adminName}</strong>
            <span className="muted-text">Manage blogs, public pages, and fan chat moderation.</span>
          </div>
          <button className="button button-secondary" onClick={logout}>Logout</button>
        </div>
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

      <section className="panel page-section form-stack">
        <div className="section-heading compact-heading">
          <div>
            <span className="kicker">Fan chat moderation</span>
            <h2>Review reported messages, hidden phone numbers, and block abusive users.</h2>
          </div>
          <p className="muted-text section-copy">Phone numbers stay hidden from fans but are visible here for admin safety review.</p>
        </div>
        <div className="content-admin-grid admin-chat-grid">
          <article className="panel form-stack content-editor-card">
            <span className="kicker">Recent chat messages</span>
            {chat.messages.map((message) => (
              <div key={message.id} className="subtle-panel panel form-stack">
                <div>
                  <strong>{message.user.name}</strong>
                  <div className="muted-text">{message.user.phone} • {new Date(message.createdAt).toLocaleString()}</div>
                </div>
                <div>{message.text}</div>
                <div className="inline-actions">
                  <input className="input" placeholder="Admin note or reason" value={adminReason[message.id] || ''} onChange={(e) => setAdminReason((current) => ({ ...current, [message.id]: e.target.value }))} />
                  <button className="button button-danger" onClick={() => runChatAction(message.id, 'delete_message')} disabled={chatBusy === `delete_message-${message.id}`}>{chatBusy === `delete_message-${message.id}` ? 'Deleting…' : 'Delete message'}</button>
                </div>
              </div>
            ))}
            {chat.messages.length === 0 ? <div className="empty-state">No chat messages available after the latest daily reset.</div> : null}
          </article>

          <article className="panel form-stack content-editor-card">
            <span className="kicker">Reported users</span>
            {chat.users.map((user) => (
              <div key={user.id} className="subtle-panel panel form-stack">
                <div className="inline-actions">
                  <strong>{user.name}</strong>
                  {user.isBlocked ? <span className="badge badge-rejected">Blocked</span> : null}
                </div>
                <div className="muted-text">Phone: {user.phone}</div>
                <div className="muted-text">Messages: {user._count.messages} • Reports against user: {user._count.reportsOnMe}</div>
                {!user.isBlocked ? (
                  <>
                    <input className="input" placeholder="Reason for block" value={adminReason[user.id] || ''} onChange={(e) => setAdminReason((current) => ({ ...current, [user.id]: e.target.value }))} />
                    <button className="button button-danger" onClick={() => runChatAction(user.id, 'block_user')} disabled={chatBusy === `block_user-${user.id}`}>{chatBusy === `block_user-${user.id}` ? 'Blocking…' : 'Block user'}</button>
                  </>
                ) : <div className="notice-banner">{user.blockReason || 'Blocked by admin'}</div>}
              </div>
            ))}
          </article>

          <article className="panel form-stack content-editor-card">
            <span className="kicker">Open and recent reports</span>
            {chat.reports.map((report) => (
              <div key={report.id} className="subtle-panel panel form-stack">
                <div className="inline-actions">
                  <strong>{report.reporter.name} reported {report.reportedUser.name}</strong>
                  <span className={`badge ${report.status === 'open' ? 'badge-pending' : 'badge-approved'}`}>{report.status}</span>
                </div>
                <div className="muted-text">Reported user phone: {report.reportedUser.phone}</div>
                <div className="muted-text">Reason: {report.reason}</div>
                <div className="muted-text">Message: {report.message?.text || 'Message removed'}</div>
                {report.status === 'open' ? (
                  <>
                    <input className="input" placeholder="Dismiss note" value={adminReason[report.id] || ''} onChange={(e) => setAdminReason((current) => ({ ...current, [report.id]: e.target.value }))} />
                    <button className="button button-secondary" onClick={() => runChatAction(report.id, 'dismiss_report')} disabled={chatBusy === `dismiss_report-${report.id}`}>{chatBusy === `dismiss_report-${report.id}` ? 'Dismissing…' : 'Dismiss report'}</button>
                  </>
                ) : <div className="muted-text">{report.adminNote || 'Admin reviewed this report.'}</div>}
              </div>
            ))}
            {chat.reports.length === 0 ? <div className="empty-state">No reports have been submitted yet.</div> : null}
          </article>
        </div>
      </section>

      <section className="panel page-section form-stack">
        <div className="section-heading compact-heading">
          <div>
            <span className="kicker">Website pages</span>
            <h2>Update About, Privacy Policy, and Partner With Us content.</h2>
          </div>
          <p className="muted-text section-copy">Changes made here appear on the separate public pages linked from the header and footer.</p>
        </div>
        <div className="content-admin-grid">
          {siteContent.map((entry) => (
            <article key={entry.slug} className="panel form-stack content-editor-card">
              <span className="kicker">{entry.slug}</span>
              <input className="input" value={entry.title} onChange={(e) => setSiteContent((current) => current.map((item) => (item.slug === entry.slug ? { ...item, title: e.target.value } : item)))} placeholder="Page title" />
              <input className="input" value={entry.description} onChange={(e) => setSiteContent((current) => current.map((item) => (item.slug === entry.slug ? { ...item, description: e.target.value } : item)))} placeholder="Short description" />
              <textarea className="input" value={entry.body} onChange={(e) => setSiteContent((current) => current.map((item) => (item.slug === entry.slug ? { ...item, body: e.target.value } : item)))} placeholder="Page content" />
              <button className="button button-primary" onClick={() => saveContent(entry)} disabled={savingSlug === entry.slug}>
                {savingSlug === entry.slug ? 'Saving…' : 'Save page content'}
              </button>
            </article>
          ))}
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
