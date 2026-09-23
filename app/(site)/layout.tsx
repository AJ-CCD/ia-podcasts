import Header from "@/components/ia/Header";
import Footer from "@/components/ia/Footer";

// Page wrappers match insideadviser.com.au so the synced theme CSS applies
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="page" className="site">
      <Header />
      <div id="content" className="site-content">
        <main className="main">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
