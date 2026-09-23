import Link from "next/link";
import site from "@/config/site.json";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <a className="brand" href={site.parentUrl}>{site.parentName}</a>
          <nav aria-label="Main">
            {site.nav.map((n) =>
              n.href.startsWith("/") ? <Link key={n.href} href={n.href}>{n.label}</Link> : <a key={n.href} href={n.href}>{n.label}</a>
            )}
          </nav>
        </div>
      </header>
      <main className="wrap">{children}</main>
      <footer className="site-footer">
        <div className="wrap">
          <a href={site.parentUrl}>{site.parentName}</a>
          <span>&copy; {new Date().getFullYear()} {site.parentName}</span>
        </div>
      </footer>
    </>
  );
}
