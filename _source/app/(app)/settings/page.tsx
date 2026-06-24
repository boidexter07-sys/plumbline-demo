import type { Metadata } from "next";
import Link from "next/link";
import { StaticGate } from "../_components/StaticGate";
import { SettingsPanel } from "./_components/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings — Plumbline",
  description: "Your Plumbline account, subscription, and data sources.",
  alternates: { canonical: "/settings/" },
};

export default function SettingsPage() {
  return (
    <StaticGate>
      <section className="app-page app-page-wide">
        <header className="app-page-header">
          <div className="eyebrow">
            <span className="num">·</span> Settings
          </div>
          <h1 className="app-page-h1">
            Account &amp; <span className="app-page-h1-em">subscription</span>.
          </h1>
          <div className="app-page-accent" aria-hidden="true" />
          <p className="app-page-lede">
            Email, password, billing, and the data sources Plumbline reads. Phase 1 ships
            view-only; Phase 2 enables editing.
          </p>
        </header>

        <SettingsPanel />

        <div className="app-prose-foot">
          <Link href="/" className="btn-ghost">← Back to dashboard</Link>
        </div>
      </section>
    </StaticGate>
  );
}
