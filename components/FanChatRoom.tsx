'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

function getChatSocketUrl() {
  if (typeof window === 'undefined') return '';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/chat/socket`;
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  return {
    full: date.toLocaleString(),
    short: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  };
}

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
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    async function refreshMessages() {
      const response = await fetch('/api/chat/messages', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setMessages(data.messages);
      setReportCount(data.openReports);
    }

    function connect() {
      socket = new WebSocket(getChatSocketUrl());

      socket.addEventListener('message', () => {
        void refreshMessages();
      });

      socket.addEventListener('close', () => {
        if (cancelled) return;
        reconnectTimer = setTimeout(connect, 1500);
      });
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const sortedMessages = useMemo(() => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [messages]);
  const latestMessage = sortedMessages.at(-1);
  const messageCount = sortedMessages.length;

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
      <section className="hero panel chat-hero chat-hero-friendly">
        <div className="chat-hero-copy">
          <span className="kicker">Daily fan chat</span>
          <h1>One friendly sports room for live match talk.</h1>
          <p>Jump into one shared room for football and cricket banter, match reactions, and quick fan-to-fan conversation. Join with your name and phone number, chat in real time, and flag anything abusive so admins can step in fast.</p>

          <div className="chat-stats-grid">
            <div className="chat-stat-card">
              <span className="chat-stat-label">Messages today</span>
              <strong>{messageCount}</strong>
              <span className="muted-text">Fresh conversation every day.</span>
            </div>
            <div className="chat-stat-card">
              <span className="chat-stat-label">Open reports</span>
              <strong>{reportCount}</strong>
              <span className="muted-text">Fans help keep the room safe.</span>
            </div>
            <div className="chat-stat-card">
              <span className="chat-stat-label">Latest activity</span>
              <strong>{latestMessage ? formatMessageTime(latestMessage.createdAt).short : 'Waiting'}</strong>
              <span className="muted-text">{latestMessage ? `${latestMessage.user.name} was last to post.` : 'Be the first fan to start the chat.'}</span>
            </div>
          </div>

          <div className="inline-actions">
            <span className="utility-chip">Realtime updates</span>
            <span className="utility-chip">History resets daily at 10:00 UTC</span>
            <span className="utility-chip">Phone number hidden from fans</span>
          </div>
        </div>

        {user ? (
          <div className="panel chat-auth-card chat-user-card">
            <span className="kicker">You&apos;re in</span>
            <strong className="chat-user-name">{user.name}</strong>
            <p className="muted-text">You can post instantly, report harmful messages, and leave anytime. Only admins can see your phone number for moderation.</p>
            <div className="chat-user-pills">
              <span className="chat-mini-pill">Safe reporting</span>
              <span className="chat-mini-pill">Real-time room</span>
            </div>
            <button className="button button-secondary" onClick={logout} disabled={busy === 'logout'}>{busy === 'logout' ? 'Leaving…' : 'Leave chat'}</button>
          </div>
        ) : (
          <form className="panel form-stack chat-auth-card chat-auth-form" onSubmit={login}>
            <div>
              <span className="kicker">Join the room</span>
              <h2 className="chat-card-title">Start chatting in under a minute.</h2>
            </div>
            <label className="form-field">
              <span>Your display name</span>
              <input className="input" placeholder="e.g. Rahul, Sam, Priya" value={auth.name} onChange={(e) => setAuth((current) => ({ ...current, name: e.target.value }))} />
            </label>
            <label className="form-field">
              <span>Phone number</span>
              <input className="input" placeholder="Used only for moderation safety" type="tel" value={auth.phone} onChange={(e) => setAuth((current) => ({ ...current, phone: e.target.value }))} />
            </label>
            <div className="notice-banner">Other fans only see your name. Admin can see your phone number for moderation and blocking decisions if someone breaks the rules.</div>
            <button className="button button-primary" disabled={busy === 'login'}>{busy === 'login' ? 'Joining…' : 'Join fan chat'}</button>
          </form>
        )}
      </section>

      <section className="grid-2 page-section chat-grid">
        <article className="panel form-stack chat-info-card">
          <span className="kicker">How it works</span>
          <h2 className="chat-card-title">Simple rules for a better room.</h2>
          <ul className="muted-text ticket-rules">
            <li>Use the room for sports reactions, match opinions, predictions, and fan banter.</li>
            <li>Keep it respectful. Hateful, threatening, abusive, or sexual content can be reported by anyone.</li>
            <li>Admins can remove a bad message or fully block a user if needed.</li>
            <li>The chat refreshes every day at 10:00 UTC, so each day starts clean.</li>
          </ul>
        </article>

        <article className="panel form-stack chat-compose-card">
          <span className="kicker">Send a message</span>
          <h2 className="chat-card-title">What&apos;s your take on today&apos;s action?</h2>
          {user ? (
            <form className="form-stack" onSubmit={sendMessage}>
              <textarea className="input chat-textarea" placeholder="Share a quick reaction, player opinion, score prediction, or fun fan moment..." value={text} onChange={(e) => setText(e.target.value)} maxLength={400} />
              <div className="chat-compose-footer">
                <span className="muted-text">{text.length}/400 characters</span>
                <button className="button button-primary" disabled={busy === 'send' || text.trim().length === 0}>{busy === 'send' ? 'Sending…' : 'Post message'}</button>
              </div>
            </form>
          ) : <div className="notice-banner">Join the chat first to post messages or report anything inappropriate.</div>}
        </article>
      </section>

      <section className="panel page-section form-stack">
        <div className="section-heading compact-heading">
          <div>
            <span className="kicker">Live room</span>
            <h2>Today&apos;s fan chat stream.</h2>
          </div>
          <span className="chat-room-count">{messageCount} message{messageCount === 1 ? '' : 's'} today</span>
        </div>
        <div className="chat-message-list">
          {sortedMessages.map((message) => {
            const timestamp = formatMessageTime(message.createdAt);

            return (
              <article key={message.id} className="chat-message-card">
                <div className="chat-message-head">
                  <div className="chat-message-identity">
                    <div className="chat-avatar" aria-hidden="true">{message.user.name.slice(0, 1).toUpperCase()}</div>
                    <div>
                      <strong>{message.user.name}</strong>
                      <div className="muted-text">{timestamp.full}</div>
                    </div>
                  </div>
                  <div className="chat-message-badges">
                    <span className="chat-time-pill">{timestamp.short}</span>
                    {message.reportCount > 0 ? <span className="badge badge-pending">{message.reportCount} reports</span> : null}
                  </div>
                </div>
                <p className="chat-message-text">{message.text}</p>
                {user && message.canReport ? (
                  <div className="form-stack chat-report-box">
                    <label className="form-field">
                      <span>Report reason</span>
                      <input className="input" placeholder="Briefly explain what is wrong with this message" value={reportReason[message.id] || ''} onChange={(e) => setReportReason((current) => ({ ...current, [message.id]: e.target.value }))} />
                    </label>
                    <button className="button button-secondary" onClick={() => reportMessage(message.id)} disabled={busy === `report-${message.id}`}>{busy === `report-${message.id}` ? 'Reporting…' : 'Report message'}</button>
                  </div>
                ) : null}
              </article>
            );
          })}
          {sortedMessages.length === 0 ? <div className="empty-state chat-empty-state">No messages yet. Join the room and kick off today&apos;s sports conversation.</div> : null}
        </div>
      </section>
    </main>
  );
}
