import { FanChatRoom } from '@/components/FanChatRoom';
import { getChatRoomData } from '@/lib/chat';
import { getChatUserSession } from '@/lib/auth';

export default async function FanChatPage() {
  const user = await getChatUserSession();
  const data = await getChatRoomData(user?.id);

  return <FanChatRoom initialMessages={data.messages} user={user} openReports={data.openReports} />;
}
