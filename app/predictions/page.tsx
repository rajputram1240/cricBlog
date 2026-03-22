import { PredictionHub } from '@/components/predictions/PredictionHub';
import { getFanSession, getPredictionMasterSession } from '@/lib/auth';
import { getPredictionHubData } from '@/lib/data';

export default async function PredictionsPage() {
  const [fan, master] = await Promise.all([getFanSession(), getPredictionMasterSession()]);
  const data = await getPredictionHubData(fan?.id, master?.id);

  return <PredictionHub initialPosts={data.posts} initialMyPurchases={data.myPurchases} initialMasterPurchases={data.masterPurchases} fan={fan} master={master} />;
}
