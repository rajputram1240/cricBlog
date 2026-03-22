'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export function FanChatRoom({ initialMessages, user, openReports }: { initialMessages: any[]; user: any; openReports: number }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [reportCount, setReportCount] = useState(openReports);
  const [auth, setAuth] = useState({ name: '', phone: '' });
  const [text, setText] = useState('');
  const [reportReason, setReportReason] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setReportCount(openReports);
  }, [openReports]);

  useEffect(() => {
    const eventSource = new EventSource('/api/chat/stream');

    async function refreshMessages() {
      const response = await fetch('/api/chat/messages', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setMessages(data.messages);
      setReportCount(data.openReports);
    }

    eventSource.onmessage = () => {
      void refreshMessages();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const sortedMessages = useMemo(() => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [messages]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy('login');
    const response = await fetch('/api/chat/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(auth) });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to join chat');
    router.refresh();
  }

  async function logout() {
    setBusy('logout');
    await fetch('/api/chat/logout', { method: 'POST' });
    setBusy('');
    router.refresh();
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    setBusy('send');
    const response = await fetch('/api/chat/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to send message');
    setText('');
    setMessages(data.messages);
    setReportCount(data.openReports);
  }

  async function reportMessage(id: string) {
    const reason = reportReason[id] || '';
    setBusy(`report-${id}`);
    const response = await fetch(`/api/chat/messages/${id}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to report message');
    setMessages(data.messages);
    setReportCount(data.openReports);
    setReportReason((current) => ({ ...current, [id]: '' }));
    alert('Report sent to admin for review.');
  }

  return (
    <main className="shell page-section chat-shell">
      <section className="hero panel chat-hero">
        <div>
          <span className="kicker">Daily fan chat</span>
          <h1>One common sports chat for daily fan fun.</h1>
          <p>Fans can join with only their name and phone number, talk about football or cricket all day, and report abusive or sexual content so the admin can remove messages or block accounts. The room resets automatically every morning at 10:00 UTC.</p>
          <div className="inline-actions">
            <span className="utility-chip">Open reports: {reportCount}</span>
            <span className="utility-chip">Messages reset daily at 10:00 UTC</span>
          </div>
        </div>
        {user ? (
          <div className="panel chat-auth-card">
            <span className="kicker">You are chatting as</span>
            <strong>{user.name}</strong>
            <span className="muted-text">Your phone number is hidden from other fans and visible only inside admin moderation tools.</span>
            <button className="button button-secondary" onClick={logout} disabled={busy === 'logout'}>{busy === 'logout' ? 'Leaving…' : 'Leave chat'}</button>
          </div>
        ) : (
          <form className="panel form-stack chat-auth-card" onSubmit={login}>
            <span className="kicker">Join the room</span>
            <input className="input" placeholder="Your name" value={auth.name} onChange={(e) => setAuth((current) => ({ ...current, name: e.target.value }))} />
            <input className="input" placeholder="Phone number" type="tel" value={auth.phone} onChange={(e) => setAuth((current) => ({ ...current, phone: e.target.value }))} />
            <div className="notice-banner">Other fans only see your name. Admin can see your phone number for moderation and blocking decisions.</div>
            <button className="button button-primary" disabled={busy === 'login'}>{busy === 'login' ? 'Joining…' : 'Join fan chat'}</button>
          </form>
        )}
      </section>

      <section className="grid-2 page-section chat-grid">
        <article className="panel form-stack">
          <span className="kicker">Chat rules</span>
          <ul className="muted-text ticket-rules">
            <li>Use the room for sports fan fun, banter, reactions, and match talk.</li>
            <li>Abusive, hateful, threatening, or sexual content can be reported by any fan.</li>
            <li>Admin may delete a single bad message or block the user completely.</li>
            <li>Every morning at 10:00 UTC the old chat history is automatically deleted.</li>
          </ul>
        </article>

        <article className="panel form-stack">
          <span className="kicker">Send a message</span>
          {user ? (
            <form className="form-stack" onSubmit={sendMessage}>
              <textarea className="input" placeholder="Talk about today’s matches, players, banter, or fan moments" value={text} onChange={(e) => setText(e.target.value)} />
              <button className="button button-primary" disabled={busy === 'send'}>{busy === 'send' ? 'Sending…' : 'Post message'}</button>
            </form>
          ) : <div className="notice-banner">Join the chat first to post or report messages.</div>}
        </article>
      </section>

      <section className="panel page-section form-stack">
        <div className="section-heading compact-heading">
          <div>
            <span className="kicker">Live room</span>
            <h2>Today's fan chat stream.</h2>
          </div>
        </div>
        <div className="chat-message-list">
          {sortedMessages.map((message) => (
            <article key={message.id} className="chat-message-card">
              <div className="chat-message-head">
                <div>
                  <strong>{message.user.name}</strong>
                  <div className="muted-text">{new Date(message.createdAt).toLocaleString()}</div>
                </div>
                {message.reportCount > 0 ? <span className="badge badge-pending">{message.reportCount} reports</span> : null}
              </div>
              <p>{message.text}</p>
              {user && message.canReport ? (
                <div className="form-stack chat-report-box">
                  <input className="input" placeholder="Reason for report" value={reportReason[message.id] || ''} onChange={(e) => setReportReason((current) => ({ ...current, [message.id]: e.target.value }))} />
                  <button className="button button-secondary" onClick={() => reportMessage(message.id)} disabled={busy === `report-${message.id}`}>{busy === `report-${message.id}` ? 'Reporting…' : 'Report message'}</button>
                </div>
              ) : null}
            </article>
          ))}
          {sortedMessages.length === 0 ? <div className="empty-state">No messages yet. Start today's sports conversation.</div> : null}
        </div>
      </section>
    </main>
  );
}
