'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export function TicketMarketplace({ initialTickets, fan, canCreateTicket, limitReason }: { initialTickets: any[]; fan: any; canCreateTicket: boolean; limitReason: string | null }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [busy, setBusy] = useState('');
  const [auth, setAuth] = useState({ name: '', email: '', phone: '' });
  const [ticketForm, setTicketForm] = useState({ matchTitle: '', venue: '', matchDate: '', seatDetails: '', basePrice: '', description: '' });
  const [bidForms, setBidForms] = useState<Record<string, { amount: string; comment: string; rewardNote: string }>>({});

  const sortedTickets = useMemo(() => [...tickets].sort((a, b) => {
    if (a.status === b.status) return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
    return a.status === 'open' ? -1 : 1;
  }), [tickets]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy('login');
    const response = await fetch('/api/fan/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(auth) });
    setBusy('');
    const data = await response.json();
    if (!response.ok) return alert(data.error || 'Unable to login');
    router.refresh();
  }

  async function logout() {
    setBusy('logout');
    await fetch('/api/fan/logout', { method: 'POST' });
    setBusy('');
    router.refresh();
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setBusy('create');
    const response = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...ticketForm, basePrice: Number(ticketForm.basePrice), matchDate: new Date(ticketForm.matchDate).toISOString() }) });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to create ticket');
    setTicketForm({ matchTitle: '', venue: '', matchDate: '', seatDetails: '', basePrice: '', description: '' });
    setTickets((current) => [data.ticket, ...current]);
    router.refresh();
  }

  async function deleteTicket(id: string) {
    if (!window.confirm('Delete this unsold ticket listing?')) return;
    setBusy(`delete-${id}`);
    const response = await fetch(`/api/tickets?id=${id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to delete ticket');
    setTickets((current) => current.filter((ticket) => ticket.id !== id));
    router.refresh();
  }

  async function placeBid(ticketId: string, e: React.FormEvent) {
    e.preventDefault();
    const form = bidForms[ticketId] || { amount: '', comment: '', rewardNote: '' };
    setBusy(`bid-${ticketId}`);
    const response = await fetch(`/api/tickets/${ticketId}/bids`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(form.amount), comment: form.comment }) });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to place bid');
    setTickets((current) => current.map((ticket) => ticket.id === ticketId ? data.ticket : ticket));
    setBidForms((current) => ({ ...current, [ticketId]: { amount: '', comment: '', rewardNote: current[ticketId]?.rewardNote || '' } }));
  }

  async function closeAuction(ticketId: string, bidId: string) {
    const rewardNote = bidForms[ticketId]?.rewardNote || '';
    setBusy(`close-${ticketId}`);
    const response = await fetch(`/api/tickets/${ticketId}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bidId, rewardNote }) });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to close auction');
    setTickets((current) => current.map((ticket) => ticket.id === ticketId ? data.ticket : ticket));
    router.refresh();
  }

  async function rewardBid(ticketId: string, bidId: string) {
    setBusy(`reward-${bidId}`);
    const response = await fetch(`/api/tickets/${ticketId}/reward`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bidId }) });
    const data = await response.json();
    setBusy('');
    if (!response.ok) return alert(data.error || 'Unable to reward bidder');
    setTickets((current) => current.map((ticket) => ticket.id === ticketId ? data.ticket : ticket));
  }

  return (
    <div className="shell page-section ticket-shell">
      <section className="hero ticket-hero panel">
        <div>
          <span className="kicker">Fan ticket exchange</span>
          <h1>Login, list one match ticket per day, collect bids, and sell to the best cricket fan offer.</h1>
          <p>Fans can post a single upcoming-match ticket, let buyers comment with auction-style offers, remove the listing before it is sold, then exchange phone numbers only after the seller confirms the winning buyer.</p>
        </div>
        {fan ? (
          <div className="panel ticket-user-card">
            <span className="kicker">Logged in fan</span>
            <strong>{fan.name}</strong>
            <span className="muted-text">{fan.email}</span>
            <span className="muted-text">Phone: {fan.phone || 'Add a phone number next login to unlock confirmed-buyer contact sharing.'}</span>
            <button className="button button-secondary" onClick={logout} disabled={busy === 'logout'}>{busy === 'logout' ? 'Logging out…' : 'Logout'}</button>
          </div>
        ) : (
          <form className="panel form-stack ticket-login" onSubmit={login}>
            <span className="kicker">Fan login</span>
            <input className="input" placeholder="Your name" value={auth.name} onChange={(e) => setAuth((current) => ({ ...current, name: e.target.value }))} />
            <input className="input" placeholder="Email address" type="email" value={auth.email} onChange={(e) => setAuth((current) => ({ ...current, email: e.target.value }))} />
            <input className="input" placeholder="Phone number" type="tel" value={auth.phone} onChange={(e) => setAuth((current) => ({ ...current, phone: e.target.value }))} />
            <div className="notice-banner">Phone numbers stay hidden during bidding and are only shared with the seller and winning buyer after the auction is confirmed.</div>
            <button className="button button-primary" disabled={busy === 'login'}>{busy === 'login' ? 'Signing in…' : 'Login as fan'}</button>
          </form>
        )}
      </section>

      <section className="grid-2 page-section ticket-top-grid">
        <article className="panel form-stack">
          <span className="kicker">Sell a ticket</span>
          <h2>Create a daily auction listing.</h2>
          <p className="muted-text">Each fan can keep only one open ticket at a time. If today&apos;s listing is still open, you must sell or delete it before posting again.</p>
          {fan ? (
            <form className="form-stack" onSubmit={createTicket}>
              <input className="input" placeholder="Match title" value={ticketForm.matchTitle} onChange={(e) => setTicketForm((current) => ({ ...current, matchTitle: e.target.value }))} disabled={!canCreateTicket} />
              <input className="input" placeholder="Venue" value={ticketForm.venue} onChange={(e) => setTicketForm((current) => ({ ...current, venue: e.target.value }))} disabled={!canCreateTicket} />
              <input className="input" type="datetime-local" value={ticketForm.matchDate} onChange={(e) => setTicketForm((current) => ({ ...current, matchDate: e.target.value }))} disabled={!canCreateTicket} />
              <input className="input" placeholder="Seat / stand details" value={ticketForm.seatDetails} onChange={(e) => setTicketForm((current) => ({ ...current, seatDetails: e.target.value }))} disabled={!canCreateTicket} />
              <input className="input" placeholder="Base price" type="number" min="1" value={ticketForm.basePrice} onChange={(e) => setTicketForm((current) => ({ ...current, basePrice: e.target.value }))} disabled={!canCreateTicket} />
              <textarea className="input" placeholder="Describe the ticket and any handoff details" value={ticketForm.description} onChange={(e) => setTicketForm((current) => ({ ...current, description: e.target.value }))} disabled={!canCreateTicket} />
              {limitReason ? <div className="notice-banner">{limitReason}</div> : null}
              <button className="button button-primary" disabled={!canCreateTicket || busy === 'create'}>{busy === 'create' ? 'Listing…' : 'List ticket for auction'}</button>
            </form>
          ) : <div className="notice-banner">Login first to sell or bid on a ticket.</div>}
        </article>

        <article className="panel form-stack">
          <span className="kicker">How it works</span>
          <ul className="muted-text ticket-rules">
            <li>Only upcoming cricket match tickets should be listed.</li>
            <li>One active listing per fan is enforced, with one ticket listing allowed each day until it is sold or deleted.</li>
            <li>Interested buyers can comment with bid amounts and short notes.</li>
            <li>Sellers can delete unsold listings whenever they do not like the auction price.</li>
            <li>When a seller picks the winning bid, the ticket is marked sold and both sides instantly see each other&apos;s phone numbers.</li>
          </ul>
        </article>
      </section>

      <section className="page-section form-stack">
        <div className="section-heading">
          <div>
            <span className="kicker">Live auctions</span>
            <h2>Upcoming match tickets from the fan community.</h2>
          </div>
        </div>
        <div className="ticket-list">
          {sortedTickets.map((ticket) => {
            const topBid = ticket.bids[0];
            const isSeller = fan?.id === ticket.sellerId;
            const isWinningBuyer = fan?.id && ticket.soldBid?.bidderId === fan.id;
            const canViewContactDetails = Boolean(ticket.soldBid && (isSeller || isWinningBuyer));
            const isOpen = ticket.status === 'open';
            const form = bidForms[ticket.id] || { amount: '', comment: '', rewardNote: '' };
            return (
              <article key={ticket.id} className="panel ticket-card">
                <div className="ticket-card-head">
                  <div>
                    <div className="inline-actions">
                      <span className="kicker">{ticket.status === 'open' ? 'Open auction' : 'Sold ticket'}</span>
                      <span className={`badge ${ticket.status === 'open' ? 'badge-approved' : 'badge-pending'}`}>{ticket.status}</span>
                    </div>
                    <h3>{ticket.matchTitle}</h3>
                    <p className="muted-text">{ticket.venue} • {new Date(ticket.matchDate).toLocaleString()} • {ticket.seatDetails}</p>
                  </div>
                  <div className="ticket-price-box">
                    <strong>₹{ticket.basePrice.toFixed(0)}</strong>
                    <span className="muted-text">Base price</span>
                  </div>
                </div>
                <p className="muted-text">{ticket.description}</p>
                <div className="ticket-meta-grid">
                  <div className="panel subtle-panel">
                    <span className="kicker">Seller</span>
                    <strong>{ticket.seller.name}</strong>
                    <span className="muted-text">{ticket.seller.email}</span>
                    <span className="muted-text">{canViewContactDetails ? `Phone: ${ticket.seller.phone || 'Not provided yet'}` : 'Phone hidden until a winner is confirmed'}</span>
                  </div>
                  <div className="panel subtle-panel">
                    <span className="kicker">Auction pulse</span>
                    <strong>{ticket.bids.length} bids</strong>
                    <span className="muted-text">{topBid ? `Top offer ₹${topBid.amount.toFixed(0)}` : 'No bids yet'}</span>
                  </div>
                </div>

                {isSeller && isOpen ? (
                  <div className="inline-actions">
                    <button className="button button-danger" onClick={() => deleteTicket(ticket.id)} disabled={busy === `delete-${ticket.id}`}>{busy === `delete-${ticket.id}` ? 'Deleting…' : 'Delete unsold ticket'}</button>
                    <input className="input reward-input" placeholder="Optional reward note after sale" value={form.rewardNote} onChange={(e) => setBidForms((current) => ({ ...current, [ticket.id]: { ...form, rewardNote: e.target.value } }))} />
                  </div>
                ) : null}

                <div className="ticket-bids">
                  {ticket.bids.map((bid: any) => {
                    const isWinningBidder = bid.isWinningBid && fan?.id === bid.bidderId;
                    const showBidderPhone = bid.isWinningBid && (isSeller || isWinningBidder);

                    return (
                      <div key={bid.id} className="bid-row">
                        <div>
                          <strong>{bid.bidder.name}</strong>
                          <span className="muted-text"> offered ₹{bid.amount.toFixed(0)}</span>
                          <p className="muted-text">{bid.comment}</p>
                          <div className="inline-actions">
                            {bid.isWinningBid ? <span className="badge badge-published">Winning bid</span> : null}
                            {bid.isRewarded ? <span className="badge badge-approved">Rewarded by seller</span> : null}
                          </div>
                          {showBidderPhone ? <p className="muted-text">Buyer phone: {bid.bidder.phone || 'Not provided yet'}</p> : null}
                        </div>
                        {isSeller && isOpen ? <button className="button button-success" onClick={() => closeAuction(ticket.id, bid.id)} disabled={busy === `close-${ticket.id}`}>{busy === `close-${ticket.id}` ? 'Closing…' : 'Sell to this fan'}</button> : null}
                        {isSeller && !isOpen && !bid.isWinningBid && !bid.isRewarded ? <button className="button button-secondary" onClick={() => rewardBid(ticket.id, bid.id)} disabled={busy === `reward-${bid.id}`}>{busy === `reward-${bid.id}` ? 'Rewarding…' : 'Reward bidder'}</button> : null}
                      </div>
                    );
                  })}
                  {ticket.bids.length === 0 ? <div className="empty-state">No buyer comments yet.</div> : null}
                </div>

                {fan && !isSeller && isOpen ? (
                  <form className="form-stack bid-form" onSubmit={(e) => placeBid(ticket.id, e)}>
                    <input className="input" type="number" min="1" placeholder="Your offer" value={form.amount} onChange={(e) => setBidForms((current) => ({ ...current, [ticket.id]: { ...form, amount: e.target.value } }))} />
                    <textarea className="input" placeholder="Why should the seller choose you?" value={form.comment} onChange={(e) => setBidForms((current) => ({ ...current, [ticket.id]: { ...form, comment: e.target.value } }))} />
                    <button className="button button-primary" disabled={busy === `bid-${ticket.id}`}>{busy === `bid-${ticket.id}` ? 'Posting bid…' : 'Comment with bid'}</button>
                  </form>
                ) : null}

                {!isOpen && ticket.soldBid ? <div className="notice-banner">Sold to {ticket.soldBid.bidder.name} for ₹{ticket.soldBid.amount.toFixed(0)}. {canViewContactDetails ? `Call seller at ${ticket.seller.phone || 'not provided'} and buyer at ${ticket.soldBid.bidder.phone || 'not provided'} to complete the handoff.` : 'Phone numbers are visible only to the seller and confirmed buyer.'}{ticket.sellerRewardNote ? ` Reward note: ${ticket.sellerRewardNote}` : ''}</div> : null}
              </article>
            );
          })}
          {sortedTickets.length === 0 ? <div className="empty-state card">No ticket auctions yet. Be the first seller.</div> : null}
        </div>
      </section>
    </div>
  );
}
