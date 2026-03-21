'use client';

import { useState } from 'react';

export function BlogEditor({ post, categories }: { post: any; categories: any[] }) {
  const [form, setForm] = useState({
    title: post.title,
    slug: post.slug,
    categoryId: post.categoryId,
    summary: post.summary,
    outline: post.outline,
    content: post.content,
    featureImage: post.featureImage || '',
    tags: post.tags,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    status: post.status,
    generatedByAI: post.generatedByAI,
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update(key: string, value: any) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadFile(file?: File) {
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    const response = await fetch('/api/admin/upload', { method: 'POST', body: data });
    const json = await response.json();
    setUploading(false);
    if (!response.ok) return alert(json.error || 'Upload failed');
    update('featureImage', json.url);
  }

  async function save() {
    setSaving(true);
    const response = await fetch('/api/admin/blogs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, ...form }),
    });
    const json = await response.json();
    setSaving(false);
    if (!response.ok) return alert(json.error || 'Save failed');
    alert('Blog saved successfully');
  }

  return (
    <div className="shell page-section form-stack">
      <section className="hero">
        <span className="kicker">Draft review</span>
        <h1>{post.title}</h1>
        <p>Update the AI-generated outline, refine the article, upload the feature image, and move the story through draft, review, approval, publishing, rejection, or unpublishing.</p>
      </section>

      <section className="split">
        <div className="panel form-stack">
          <input className="input" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Title" />
          <input className="input" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="Slug" />
          <select className="input" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <textarea value={form.summary} onChange={(e) => update('summary', e.target.value)} placeholder="Summary" />
          <textarea value={form.outline} onChange={(e) => update('outline', e.target.value)} placeholder="Detailed outline" />
          <textarea value={form.content} onChange={(e) => update('content', e.target.value)} placeholder="Full content" style={{ minHeight: 360 }} />
          <input className="input" value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="Tags" />
          <input className="input" value={form.metaTitle} onChange={(e) => update('metaTitle', e.target.value)} placeholder="SEO meta title" />
          <textarea value={form.metaDescription} onChange={(e) => update('metaDescription', e.target.value)} placeholder="SEO meta description" />
          <div className="inline-actions">
            <input className="input" value={form.featureImage} onChange={(e) => update('featureImage', e.target.value)} placeholder="Feature image URL" />
            <input className="input" type="file" accept="image/*" onChange={(e) => uploadFile(e.target.files?.[0])} />
          </div>
          <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="inline-actions">
            <button className="button button-primary" onClick={save} disabled={saving || uploading}>{saving ? 'Saving…' : 'Save changes'}</button>
            <a className="button button-secondary" href="/admin">Back to dashboard</a>
          </div>
          <p className="muted-text">Rule enforced: a feature image is required before a blog can be approved or published.</p>
        </div>

        <aside className="panel form-stack">
          <h2>Preview</h2>
          {form.featureImage ? <img src={form.featureImage} alt={form.title} className="blog-card-image" /> : <div className="empty-state">Upload a feature image to prepare this draft for approval.</div>}
          <div className="eyebrow-row"><span>{categories.find((item) => item.id === form.categoryId)?.name}</span><span>•</span><span>{form.status}</span></div>
          <h3>{form.title}</h3>
          <p className="muted-text">{form.summary}</p>
          <h4>Outline</h4>
          <div className="markdown-preview">{form.outline}</div>
          <h4>Article</h4>
          <div className="markdown-preview">{form.content}</div>
        </aside>
      </section>
    </div>
  );
}
