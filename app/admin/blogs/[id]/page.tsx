import { notFound, redirect } from 'next/navigation';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminBlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!post) notFound();
  return <BlogEditor post={post} categories={categories} />;
}
