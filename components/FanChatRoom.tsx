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

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'F';
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
    <main className="shell page-section chat-shell chat-app-shell">
      <section className="chat-app-frame">
        <header className="chat-app-topbar">
          <div>
            <span className="chat-brand">@sportsdraft daily</span>
            <p className="chat-topbar-subtitle">One room for football and cricket fans.</p>
          </div>
          <div className="chat-topbar-icons" aria-hidden="true">
            <span className="chat-icon-dot" />
            <span className="chat-icon-dot" />
            <span className="chat-icon-dot" />
          </div>
        </header>

        <div className="chat-app-body">
          <aside className="chat-app-sidebar">
            <div className="chat-sidebar-badge">Live</div>
            <div className="chat-sidebar-stack">
              <div className="chat-sidebar-card">
                <span className="chat-sidebar-label">Messages</span>
                <strong>{messageCount}</strong>
              </div>
              <div className="chat-sidebar-card">
                <span className="chat-sidebar-label">Reports</span>
                <strong>{reportCount}</strong>
              </div>
              <div className="chat-sidebar-card">
                <span className="chat-sidebar-label">Reset</span>
                <strong>10:00 UTC</strong>
              </div>
            </div>
          </aside>

          <section className="chat-room-panel">
            <div className="chat-room-canvas">
              <div className="chat-room-intro">
                <span className="chat-room-eyebrow">Sports fan chat</span>
                <h1>Talk like a real live chatbox.</h1>
                <p>
                  Join the common room, react to the latest football or cricket action, and report bad behaviour fast.
                  Your phone number stays hidden from other fans and is only visible to admins for moderation.
                </p>
              </div>

              <div className="chat-room-status">
                <span className="chat-room-pill">Realtime updates</span>
                <span className="chat-room-pill">Safe reporting</span>
                <span className="chat-room-pill">History clears daily</span>
                {latestMessage ? <span className="chat-room-pill">Latest post {formatMessageTime(latestMessage.createdAt).short}</span> : null}
              </div>

              {!user ? (
                <form className="chat-join-card" onSubmit={login}>
                  <div>
                    <span className="kicker">Join the room</span>
                    <h2 className="chat-card-title">Start chatting in under a minute.</h2>
                  </div>
                  <label className="form-field">
                    <span>Display name</span>
                    <input className="input chat-dark-input" placeholder="Enter your chat name" value={auth.name} onChange={(e) => setAuth((current) => ({ ...current, name: e.target.value }))} />
                  </label>
                  <label className="form-field">
                    <span>Phone number</span>
                    <input className="input chat-dark-input" placeholder="Used only for moderation safety" type="tel" value={auth.phone} onChange={(e) => setAuth((current) => ({ ...current, phone: e.target.value }))} />
                  </label>
                  <div className="chat-helper-card">Other fans only see your display name. Admins can view your number only when they need to moderate abuse or block a user.</div>
                  <button className="button chat-send-button" disabled={busy === 'login'}>{busy === 'login' ? 'Joining…' : 'Join fan chat'}</button>
                </form>
              ) : null}

              <div className="chat-stream-wrap">
                <div className="chat-stream-banner">
                  <span>
                    You are now chatting with <strong>{user.name}</strong>. Say hi!
                  </span>
                  <button className="button button-secondary chat-leave-button" onClick={logout} disabled={busy === 'logout'}>
                    {busy === 'logout' ? 'Leaving…' : 'Leave'}
                  </button>
                </div>

                <div className="chat-message-list chat-dark-message-list">
                  {sortedMessages.length === 0 ? <div className="empty-state chat-empty-state">No messages yet. Join the room and kick off today&apos;s sports conversation.</div> : null}
                  {sortedMessages.map((message) => {
                    const timestamp = formatMessageTime(message.createdAt);

                    return (
                      <article key={message.id} className="chat-message-card chat-dark-message-card">
                        <div className="chat-message-head">
                          <div className="chat-message-identity">
                            <div className="chat-avatar" aria-hidden="true">{getInitial(message.user.name)}</div>
                            <div>
                              <div className="chat-message-meta-row">
                                <strong>{message.user.name}</strong>
                                <span>{timestamp.short}</span>
                              </div>
                              <div className="muted-text chat-message-date">{timestamp.full}</div>
                            </div>
                          </div>
                          {message.reportCount > 0 ? <span className="badge badge-pending">{message.reportCount} reports</span> : null}
                        </div>
                        <p className="chat-message-text">{message.text}</p>
                        {user && message.canReport ? (
                          <div className="form-stack chat-report-box chat-report-inline">
                            <input className="input chat-dark-input" placeholder="Reason for report" value={reportReason[message.id] || ''} onChange={(e) => setReportReason((current) => ({ ...current, [message.id]: e.target.value }))} />
                            <button className="button button-secondary" onClick={() => reportMessage(message.id)} disabled={busy === `report-${message.id}`}>
                              {busy === `report-${message.id}` ? 'Reporting…' : 'Report'}
                            </button>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className="chat-composer-shell">
              {user ? (
                <form className="chat-composer-bar" onSubmit={sendMessage}>
                  <button type="button" className="chat-action-button chat-action-muted">ESC</button>
                  <button type="button" className="chat-action-button chat-action-primary">SKIP</button>
                  <div className="chat-input-frame">
                    <span className="chat-input-icon" aria-hidden="true">▣</span>
                    <textarea className="input chat-dark-input chat-composer-input" placeholder="Send a message" value={text} onChange={(e) => setText(e.target.value)} maxLength={400} />
                    <div className="chat-composer-tools">
                      <span>{text.length}/400</span>
                      <span>GIF</span>
                      <span>☺</span>
                    </div>
                  </div>
                  <button className="button chat-send-button" disabled={busy === 'send' || text.trim().length === 0}>{busy === 'send' ? 'Sending…' : 'Send'}</button>
                </form>
              ) : (
                <div className="chat-composer-locked">Join the room above to start posting messages and reporting abuse.</div>
              )}
            </footer>
          </section>
        </div>
      </section>
    </main>
  );
}
