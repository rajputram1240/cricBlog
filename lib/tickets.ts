export function serializeTicketForViewer(ticket: any, viewerId?: string | null) {
  if (!ticket) return ticket;

  const canViewContactDetails = Boolean(ticket.soldBid && viewerId && (ticket.sellerId === viewerId || ticket.soldBid.bidderId === viewerId));

  return {
    ...ticket,
    seller: ticket.seller
      ? {
          ...ticket.seller,
          phone: canViewContactDetails ? ticket.seller.phone : null,
        }
      : ticket.seller,
    soldBid: ticket.soldBid
      ? {
          ...ticket.soldBid,
          bidder: ticket.soldBid.bidder
            ? {
                ...ticket.soldBid.bidder,
                phone: canViewContactDetails ? ticket.soldBid.bidder.phone : null,
              }
            : ticket.soldBid.bidder,
        }
      : ticket.soldBid,
    bids: Array.isArray(ticket.bids)
      ? ticket.bids.map((bid: any) => ({
          ...bid,
          bidder: bid.bidder
            ? {
                ...bid.bidder,
                phone: bid.isWinningBid && canViewContactDetails ? bid.bidder.phone : null,
              }
            : bid.bidder,
        }))
      : ticket.bids,
  };
}
