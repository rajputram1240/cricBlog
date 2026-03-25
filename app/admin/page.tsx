import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { getAdminDashboardData } from '@/lib/data';
import { getAdminSession } from '@/lib/auth';

export default async function AdminPage() {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');
  const data = await getAdminDashboardData();

  return <AdminDashboard initialPosts={data.posts} categories={data.categories} stats={data.stats} initialSiteContent={data.siteContent} adminName={admin.name} />;
}
