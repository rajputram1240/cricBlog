const styles: Record<string, string> = {
  draft: 'badge badge-draft',
  pending_review: 'badge badge-pending',
  approved: 'badge badge-approved',
  published: 'badge badge-published',
  rejected: 'badge badge-rejected',
};

export function Badge({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={styles[tone] || styles.draft}>{children}</span>;
}
