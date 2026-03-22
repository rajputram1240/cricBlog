import Link from 'next/link';

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-row">
        <Link href="/" className="brand">SportsDraft Daily</Link>
        <nav className="nav-links">
          <Link href="/category/football">Football</Link>
          <Link href="/category/cricket">Cricket</Link>
          <Link href="/about">About us</Link>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/partner-with-us">Partner with us</Link>
          <Link href="/tickets">Ticket auction</Link>
          <Link href="/fan-chat">Fan chat</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
