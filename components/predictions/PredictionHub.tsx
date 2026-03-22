'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export function PredictionHub({ initialPosts, initialMyPurchases, initialMasterPurchases, fan, master }: { initialPosts: any[]; initialMyPurchases: any[]; initialMasterPurchases: any[]; fan: any; master: any }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [myPurchases] = useState(initialMyPurchases);
  const [masterPurchases, setMasterPurchases] = useState(initialMasterPurchases);
  const [busy, setBusy] = useState('');
  const [fanAuth, setFanAuth] = useState({ name: '', email: '', phone: '' });
  const [masterAuth, setMasterAuth] = useState({ name: '', email: '', phone: '', upiId: '' });
  const [postForm, setPostForm] = useState({ matchTitle: '', title: '', content: '', slipId: '', fee: '', platform: '', chanceToWin: '' });
  const [purchaseForms, setPurchaseForms] = useState<Record<string, { utr: string; buyerPhone: string; buyerEmail: string; initiatedAt: string }>>({});
  const [reviewForms, setReviewForms] = useState<Record<string, { status: 'approved' | 'rejected'; masterNote: string }>>({});

  const orderedPosts = useMemo(() => [...posts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [posts]);

  async function loginFan(e: React.FormEvent) {
    e.preventDefault();
    setBusy('fan-login');
    const response = await fetch('/api/fan/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fanAuth) });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to login as user');
    router.refresh();
  }

  async function logoutFan() {
    setBusy('fan-logout');
    await fetch('/api/fan/logout', { method: 'POST' });
    setBusy('');
    router.refresh();
  }

  async function loginMaster(e: React.FormEvent) {
    e.preventDefault();
    setBusy('master-login');
    const response = await fetch('/api/prediction-master/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(masterAuth) });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to register as prediction master');
    router.refresh();
  }

  async function logoutMaster() {
    setBusy('master-logout');
    await fetch('/api/prediction-master/logout', { method: 'POST' });
    setBusy('');
    router.refresh();
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    setBusy('create-post');
    const response = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...postForm, fee: Number(postForm.fee), chanceToWin: Number(postForm.chanceToWin) }),
    });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to publish prediction');
    setPostForm({ matchTitle: '', title: '', content: '', slipId: '', fee: '', platform: '', chanceToWin: '' });
    setPosts((current) => [{ ...data.post, reveal: { slipId: data.post.slipId, platform: data.post.platform }, myPurchase: null }, ...current]);
    router.refresh();
  }

  function startPayment(post: any) {
    setPurchaseForms((current) => ({
      ...current,
      [post.id]: {
        utr: current[post.id]?.utr || '',
        buyerPhone: current[post.id]?.buyerPhone || fan?.phone || '',
        buyerEmail: current[post.id]?.buyerEmail || fan?.email || '',
        initiatedAt: new Date().toISOString(),
      },
    }));
  }

  async function submitPurchase(postId: string, e: React.FormEvent) {
    e.preventDefault();
    const form = purchaseForms[postId];
    if (!form?.initiatedAt) return alert('Click the payment start button first so the 5 minute window can begin.');
    setBusy(`purchase-${postId}`);
    const response = await fetch('/api/predictions/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, ...form }),
    });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to submit payment proof');
    alert('Payment proof submitted. Wait for the prediction master to approve it from their dashboard.');
    router.refresh();
  }

  async function updateApproval(purchaseId: string) {
    const form = reviewForms[purchaseId] || { status: 'approved', masterNote: '' };
    setBusy(`review-${purchaseId}`);
    const response = await fetch('/api/predictions/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId, ...form }),
    });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to update request');
    setMasterPurchases((current) => current.map((purchase) => purchase.id === purchaseId ? { ...purchase, ...data.purchase } : purchase));
    router.refresh();
  }

  return (
    <div className="shell page-section prediction-shell">
      <section className="hero panel prediction-hero">
        <div>
          <span className="kicker">Prediction master flow</span>
          <h1>Let any tipster register, publish free match blogs, collect UPI payments, and manually unlock premium slip details after approval.</h1>
          <p className="muted-text">Readers can freely consume the blog write-up for each match, but the slip ID and platform stay hidden until a user pays the listed fee, submits a UTR inside a 5 minute payment window, and the prediction master approves the request.</p>
        </div>
        <div className="prediction-hero-points">
          <div className="panel subtle-panel"><strong>Master signup</strong><span className="muted-text">Name, email, phone, and UPI ID only.</span></div>
          <div className="panel subtle-panel"><strong>Buyer proof</strong><span className="muted-text">UTR, phone, and email captured per purchase.</span></div>
          <div className="panel subtle-panel"><strong>Controlled reveal</strong><span className="muted-text">Slip ID + platform appear only after approval.</span></div>
        </div>
      </section>

      <section className="grid-2 page-section prediction-auth-grid">
        <article className="panel form-stack">
          <span className="kicker">Normal users</span>
          <h2>Login to buy prediction slips.</h2>
          {fan ? (
            <div className="form-stack">
              <strong>{fan.name}</strong>
              <span className="muted-text">{fan.email}</span>
              <span className="muted-text">{fan.phone || 'Phone not saved yet'}</span>
              <button className="button button-secondary" onClick={logoutFan} disabled={busy === 'fan-logout'}>{busy === 'fan-logout' ? 'Logging out…' : 'Logout user'}</button>
            </div>
          ) : (
            <form className="form-stack" onSubmit={loginFan}>
              <input className="input" placeholder="Name" value={fanAuth.name} onChange={(e) => setFanAuth((current) => ({ ...current, name: e.target.value }))} />
              <input className="input" type="email" placeholder="Email" value={fanAuth.email} onChange={(e) => setFanAuth((current) => ({ ...current, email: e.target.value }))} />
              <input className="input" type="tel" placeholder="Phone" value={fanAuth.phone} onChange={(e) => setFanAuth((current) => ({ ...current, phone: e.target.value }))} />
              <button className="button button-primary" disabled={busy === 'fan-login'}>{busy === 'fan-login' ? 'Logging in…' : 'Login as user'}</button>
            </form>
          )}
        </article>

        <article className="panel form-stack">
          <span className="kicker">Prediction masters</span>
          <h2>Register and manage approvals.</h2>
          {master ? (
            <div className="form-stack">
              <strong>{master.name}</strong>
              <span className="muted-text">{master.email}</span>
              <span className="muted-text">{master.phone}</span>
              <span className="muted-text">UPI: {master.upiId}</span>
              <button className="button button-secondary" onClick={logoutMaster} disabled={busy === 'master-logout'}>{busy === 'master-logout' ? 'Logging out…' : 'Logout master'}</button>
            </div>
          ) : (
            <form className="form-stack" onSubmit={loginMaster}>
              <input className="input" placeholder="Name" value={masterAuth.name} onChange={(e) => setMasterAuth((current) => ({ ...current, name: e.target.value }))} />
              <input className="input" type="email" placeholder="Email" value={masterAuth.email} onChange={(e) => setMasterAuth((current) => ({ ...current, email: e.target.value }))} />
              <input className="input" type="tel" placeholder="Phone" value={masterAuth.phone} onChange={(e) => setMasterAuth((current) => ({ ...current, phone: e.target.value }))} />
              <input className="input" placeholder="UPI ID" value={masterAuth.upiId} onChange={(e) => setMasterAuth((current) => ({ ...current, upiId: e.target.value }))} />
              <button className="button button-primary" disabled={busy === 'master-login'}>{busy === 'master-login' ? 'Registering…' : 'Register as prediction master'}</button>
            </form>
          )}
        </article>
      </section>

      {master ? (
        <section className="grid-2 page-section prediction-dashboard-grid">
          <article className="panel form-stack">
            <span className="kicker">Publish free blog</span>
            <h2>Create a match prediction post.</h2>
            <form className="form-stack" onSubmit={createPost}>
              <input className="input" placeholder="Match title" value={postForm.matchTitle} onChange={(e) => setPostForm((current) => ({ ...current, matchTitle: e.target.value }))} />
              <input className="input" placeholder="Blog title" value={postForm.title} onChange={(e) => setPostForm((current) => ({ ...current, title: e.target.value }))} />
              <textarea className="input" placeholder="Free blog content" value={postForm.content} onChange={(e) => setPostForm((current) => ({ ...current, content: e.target.value }))} />
              <input className="input" placeholder="Slip ID" value={postForm.slipId} onChange={(e) => setPostForm((current) => ({ ...current, slipId: e.target.value }))} />
              <input className="input" type="number" min="1" placeholder="Fee" value={postForm.fee} onChange={(e) => setPostForm((current) => ({ ...current, fee: e.target.value }))} />
              <input className="input" placeholder="Platform" value={postForm.platform} onChange={(e) => setPostForm((current) => ({ ...current, platform: e.target.value }))} />
              <input className="input" type="number" min="1" max="100" placeholder="Chance to win %" value={postForm.chanceToWin} onChange={(e) => setPostForm((current) => ({ ...current, chanceToWin: e.target.value }))} />
              <button className="button button-primary" disabled={busy === 'create-post'}>{busy === 'create-post' ? 'Publishing…' : 'Publish prediction post'}</button>
            </form>
          </article>

          <article className="panel form-stack">
            <span className="kicker">Approval dashboard</span>
            <h2>Review buyer payment proofs.</h2>
            <div className="prediction-request-list">
              {masterPurchases.map((purchase: any) => {
                const form = reviewForms[purchase.id] || { status: 'approved', masterNote: '' };
                return (
                  <div key={purchase.id} className="subtle-panel panel form-stack">
                    <strong>{purchase.post.title}</strong>
                    <span className="muted-text">Buyer: {purchase.buyer.name} • {purchase.buyerEmail} • {purchase.buyerPhone}</span>
                    <span className="muted-text">UTR: {purchase.utr}</span>
                    <span className="muted-text">Status: {purchase.status}</span>
                    <select className="input" value={form.status} onChange={(e) => setReviewForms((current) => ({ ...current, [purchase.id]: { ...form, status: e.target.value as 'approved' | 'rejected' } }))}>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                    <input className="input" placeholder="Optional note" value={form.masterNote} onChange={(e) => setReviewForms((current) => ({ ...current, [purchase.id]: { ...form, masterNote: e.target.value } }))} />
                    <button className="button button-success" onClick={() => updateApproval(purchase.id)} disabled={busy === `review-${purchase.id}`}>{busy === `review-${purchase.id}` ? 'Saving…' : 'Save decision'}</button>
                  </div>
                );
              })}
              {masterPurchases.length === 0 ? <div className="empty-state">No payment approvals yet.</div> : null}
            </div>
          </article>
        </section>
      ) : null}

      <section className="page-section form-stack">
        <div className="section-heading">
          <div>
            <span className="kicker">Live prediction blogs</span>
            <h2>Free write-ups with gated slip delivery.</h2>
          </div>
        </div>
        <div className="prediction-post-list">
          {orderedPosts.map((post: any) => {
            const form = purchaseForms[post.id] || { utr: '', buyerPhone: fan?.phone || '', buyerEmail: fan?.email || '', initiatedAt: '' };
            return (
              <article key={post.id} className="panel prediction-post-card">
                <div className="prediction-post-head">
                  <div>
                    <span className="kicker">{post.matchTitle}</span>
                    <h3>{post.title}</h3>
                    <p className="muted-text">By {post.master.name}</p>
                  </div>
                  <div className="prediction-price-box">
                    <strong>₹{Number(post.fee).toFixed(0)}</strong>
                    <span>{post.chanceToWin}% chance</span>
                  </div>
                </div>
                <p className="muted-text prediction-content">{post.content}</p>
                <div className="prediction-summary-grid">
                  <div className="panel subtle-panel"><span className="kicker">UPI payment</span><strong>{post.master.upiId}</strong><span className="muted-text">Pay this master directly.</span></div>
                  <div className="panel subtle-panel"><span className="kicker">Slip access</span><strong>{post.reveal ? post.reveal.slipId : 'Hidden until approval'}</strong><span className="muted-text">{post.reveal ? `Platform: ${post.reveal.platform}` : 'Platform unlocks after payment approval.'}</span></div>
                </div>
                {post.myPurchase ? <div className="notice-banner">Your request is {post.myPurchase.status}. {post.myPurchase.status === 'approved' ? `Slip ID: ${post.reveal?.slipId}. Platform: ${post.reveal?.platform}.` : 'Wait for the prediction master to approve your payment.'}{post.myPurchase.masterNote ? ` Note: ${post.myPurchase.masterNote}` : ''}</div> : null}
                {fan && !post.myPurchase ? (
                  <form className="form-stack bid-form" onSubmit={(e) => submitPurchase(post.id, e)}>
                    <button type="button" className="button button-secondary" onClick={() => startPayment(post)}>Start 5 minute payment window</button>
                    <input className="input" placeholder="UTR / transaction ref" value={form.utr} onChange={(e) => setPurchaseForms((current) => ({ ...current, [post.id]: { ...form, utr: e.target.value } }))} />
                    <input className="input" placeholder="Phone number" value={form.buyerPhone} onChange={(e) => setPurchaseForms((current) => ({ ...current, [post.id]: { ...form, buyerPhone: e.target.value } }))} />
                    <input className="input" type="email" placeholder="Email" value={form.buyerEmail} onChange={(e) => setPurchaseForms((current) => ({ ...current, [post.id]: { ...form, buyerEmail: e.target.value } }))} />
                    <button className="button button-primary" disabled={busy === `purchase-${post.id}`}>{busy === `purchase-${post.id}` ? 'Submitting…' : 'Submit payment proof'}</button>
                  </form>
                ) : null}
              </article>
            );
          })}
          {orderedPosts.length === 0 ? <div className="empty-state card">No prediction blogs have been published yet.</div> : null}
        </div>
      </section>

      {fan ? (
        <section className="page-section panel form-stack">
          <span className="kicker">My slip dashboard</span>
          <h2>Track approvals and unlocked slips.</h2>
          <div className="prediction-request-list">
            {myPurchases.map((purchase: any) => (
              <div key={purchase.id} className="subtle-panel panel form-stack">
                <strong>{purchase.post.title}</strong>
                <span className="muted-text">{purchase.post.master.name} • ₹{purchase.post.fee.toFixed(0)}</span>
                <span className="muted-text">Status: {purchase.status}</span>
                <span className="muted-text">UTR: {purchase.utr}</span>
                {purchase.status === 'approved' ? <div className="notice-banner">Slip ID: {purchase.post.slipId} • Platform: {purchase.post.platform}</div> : null}
                {purchase.masterNote ? <span className="muted-text">Master note: {purchase.masterNote}</span> : null}
              </div>
            ))}
            {myPurchases.length === 0 ? <div className="empty-state">No purchases yet.</div> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
