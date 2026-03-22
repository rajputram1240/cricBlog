import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-layout">
        <div className="footer-copy">
          <strong>SportsDraft Daily</strong>
          <span>Football and cricket fan page.</span>
        </div>
        <div className="footer-links">
          <Link href="/about">About us</Link>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/partner-with-us">Partner with us</Link>
        </div>
      </div>
    </footer>
  );
}
