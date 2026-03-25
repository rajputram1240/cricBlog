import Link from 'next/link';

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-row">
        <Link href="/" className="brand">SportsDraft Daily</Link>
        <nav className="nav-links">
          <Link href="/category/football">Football</Link>
          <Link href="/category/cricket">Cricket</Link>
          <Link href="/tickets">Ticket auction</Link>
          <Link href="/predictions">Predictions</Link>
        </nav>
      </div>
    </header>
  );
}
