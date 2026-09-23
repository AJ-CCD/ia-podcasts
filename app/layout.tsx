import type { Metadata } from "next";
import Script from "next/script";
import site from "@/config/site.json";
import "@/styles/ia-theme.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://podcasts.insideadviser.com.au"),
  title: { default: site.siteName, template: `%s | ${site.siteName}` },
  icons: { icon: `${site.assets}/favicon.png` },
  openGraph: { siteName: site.parentName, images: [`${site.assets}/og.png`] },
};

const GTM = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="archive post-type-archive post-type-archive-captivate_podcast wp-theme-the-inside-advisor">
        {GTM && (
          <>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');`}
            </Script>
            <noscript>
              <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
            </noscript>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
