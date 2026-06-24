import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "./_components/MarketingChrome";

export const metadata: Metadata = {
  title: "Not found — Plumbline",
  description: "The page you're looking for doesn't exist.",
  alternates: { canonical: "/404" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <MarketingPage currentPath="/404">
      <section style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 640 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            <span className="num">404</span> · Not found
          </div>
          <div
            style={{
              fontSize: "clamp(7rem, 16vw, 11rem)",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: "var(--text-primary)",
              margin: "0 0 24px",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            4<span style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 700 }}>0</span>4
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", margin: "0 0 20px", maxWidth: "22ch", marginLeft: "auto", marginRight: "auto" }}>
            This page doesn&apos;t <span style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 600 }}>exist.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--text-secondary)", maxWidth: "46ch", margin: "0 auto 24px" }}>
            The link you followed does not lead anywhere. It might be an old URL from a previous version of the site, a mis-typed address, or a link shared by someone before the page was renamed. Nothing here is broken on your end — the page just isn&apos;t here.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--text-primary)", fontWeight: 500, maxWidth: "46ch", margin: "0 auto 40px" }}>
            Your book is the same, wherever you go next.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn-primary">
              Back to Plumbline <span aria-hidden="true">→</span>
            </Link>
            <a href="mailto:hello@plumbline.app" className="btn-secondary">
              Tell us what you were looking for
            </a>
          </div>
          <div style={{ marginTop: 56, paddingTop: 24, borderTop: "var(--rule)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text-secondary)", display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <span><strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>Error 404</strong></span>
            <span>Page not found</span>
            <span>No portfolio data was lost</span>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
