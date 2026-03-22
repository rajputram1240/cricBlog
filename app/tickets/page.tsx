import { getFanSession } from '@/lib/auth';
import { getTicketMarketplace } from '@/lib/data';
import { TicketMarketplace } from '@/components/tickets/TicketMarketplace';

export default async function TicketsPage() {
  const fan = await getFanSession();
  const { tickets, activeSale, dailyTicket } = await getTicketMarketplace(fan?.id);
  const canCreateTicket = !!fan && !activeSale && !dailyTicket;
  const limitReason = activeSale
    ? 'You already have one active ticket listed. Sell it or delete it before creating another listing.'
    : dailyTicket
      ? 'You already listed one ticket today. Come back tomorrow unless that listing is deleted before posting again.'
      : null;

  return <TicketMarketplace initialTickets={tickets} fan={fan} canCreateTicket={canCreateTicket} limitReason={limitReason} />;
}
