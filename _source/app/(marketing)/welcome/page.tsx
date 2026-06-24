import type { Metadata } from "next";
import { MarketingPage, LockedDisclaimer } from "../../_components/MarketingChrome";
import { StartTrialButton } from "../../_components/StartTrialButton";

export const metadata: Metadata = {
  title: "Plumbline — A driver's-seat view of your investments.",
  description:
    "Plumbline is calm guidance for noisy markets. See your investments clearly. Understand what they mean. Built for Canadian investors, $4.99 CAD/mo after a 7-day free trial.",
  alternates: { canonical: "/welcome/" },
  openGraph: {
    type: "website",
    url: "https://boidexter07-sys.github.io/plumbline-demo/",
    title: "Plumbline — A driver's-seat view of your investments.",
    description:
      "See your investments clearly. Understand what they mean. Calm guidance for the active Canadian investor. $4.99 CAD/mo after a 7-day free trial.",
    images: [
      {
        url: "/plumbline-demo/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Plumbline — A driver's-seat view of your investments.",
      },
    ],
  },
};

export default function LandingPage() {
  return (
    <MarketingPage
      currentPath="/welcome/"
      ribbonLeft="Vol. 01 · The Plumbline Method · Issue 1 · 2026-06-24"
      ribbonRightHref="/welcome/#legend"
      ribbonRightLabel="The 29-factor Pulse is live — read the method →"
    >
      {/* HERO */}
      <section className="hero" style={{ padding: "96px 20px 80px", background: "var(--bg-base)", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px", alignItems: "center" }}>
          <div className="hero-copy">
            <div className="hero-pill"><span className="pulse-dot" />29-factor Pulse · reads intensity, not direction</div>
            <h1>A driver&apos;s-seat view of your investments.</h1>
            <p className="lede">Plumbline is calm guidance for noisy markets — a dashboard, a daily brief, and a single number called Pulse that tells you how conditions are shifting. Not what to do. Just what is happening.</p>
            <div className="hero-actions">
              <StartTrialButton variant="primary">Start 7-day free trial</StartTrialButton>
              <a className="btn-ghost" href="/welcome/#method">How Pulse is built →</a>
            </div>
            <div style={{ marginTop: 18, fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 18, flexWrap: "wrap" }}>
              <span>$4.99 CAD / month</span>
              <span>·</span>
              <span>Canadian market scope</span>
              <span>·</span>
              <span>$0/month in data costs</span>
            </div>
          </div>
          <div className="hero-vis" style={{ background: "var(--bg-deep)", padding: 48, border: "1px solid var(--bg-deep-2)", position: "relative", minHeight: 520, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="orbit" aria-hidden="true">
              <svg viewBox="0 0 480 480" fill="none" style={{ width: "100%", height: "100%", maxWidth: 480, maxHeight: 480 }}>
                <circle cx="240" cy="240" r="220" stroke="rgba(245,241,232,0.06)" strokeWidth="1" />
                <circle cx="240" cy="240" r="180" stroke="rgba(245,241,232,0.10)" strokeWidth="1" />
                <circle cx="240" cy="240" r="140" stroke="rgba(245,241,232,0.14)" strokeWidth="1" />
                <g stroke="rgba(245,241,232,0.6)">
                  <line x1="240" y1="20" x2="240" y2="32" strokeWidth="2" />
                  <line x1="368.5" y1="47.6" x2="363.7" y2="58.7" strokeWidth="2" />
                  <line x1="432.4" y1="111.5" x2="421.3" y2="116.3" strokeWidth="2" />
                  <line x1="460" y1="240" x2="448" y2="240" strokeWidth="2" />
                  <line x1="432.4" y1="368.5" x2="421.3" y2="363.7" strokeWidth="2" />
                  <line x1="368.5" y1="432.4" x2="363.7" y2="421.3" strokeWidth="2" />
                  <line x1="240" y1="460" x2="240" y2="448" strokeWidth="2" />
                  <line x1="111.5" y1="432.4" x2="116.3" y2="421.3" strokeWidth="2" />
                  <line x1="47.6" y1="368.5" x2="58.7" y2="363.7" strokeWidth="2" />
                  <line x1="20" y1="240" x2="32" y2="240" strokeWidth="2" />
                  <line x1="47.6" y1="111.5" x2="58.7" y2="116.3" strokeWidth="2" />
                  <line x1="111.5" y1="47.6" x2="116.3" y2="58.7" strokeWidth="2" />
                </g>
                <g fill="#B8542B">
                  <circle cx="240" cy="22" r="3.5" /><circle cx="346" cy="48.8" r="3.5" /><circle cx="431" cy="134" r="3.5" />
                  <circle cx="458" cy="240" r="3.5" /><circle cx="431" cy="346" r="3.5" /><circle cx="346" cy="431" r="3.5" />
                  <circle cx="240" cy="458" r="3.5" /><circle cx="134" cy="431" r="3.5" /><circle cx="49" cy="346" r="3.5" />
                  <circle cx="22" cy="240" r="3.5" /><circle cx="49" cy="134" r="3.5" /><circle cx="134" cy="49" r="3.5" />
                </g>
                <g fill="rgba(245,241,232,0.5)">
                  <circle cx="305" cy="28" r="2.5" /><circle cx="395" cy="80" r="2.5" /><circle cx="450" cy="170" r="2.5" />
                  <circle cx="450" cy="310" r="2.5" /><circle cx="395" cy="400" r="2.5" /><circle cx="305" cy="452" r="2.5" />
                  <circle cx="175" cy="452" r="2.5" /><circle cx="85" cy="400" r="2.5" /><circle cx="30" cy="310" r="2.5" />
                  <circle cx="30" cy="170" r="2.5" /><circle cx="85" cy="80" r="2.5" /><circle cx="175" cy="28" r="2.5" />
                  <circle cx="262" cy="20" r="2" /><circle cx="370" cy="60" r="2" /><circle cx="425" cy="146" r="2" />
                  <circle cx="455" cy="262" r="2" /><circle cx="425" cy="370" r="2" /><circle cx="370" cy="425" r="2" />
                  <circle cx="262" cy="460" r="2" /><circle cx="146" cy="425" r="2" /><circle cx="60" cy="370" r="2" />
                  <circle cx="25" cy="262" r="2" /><circle cx="60" cy="146" r="2" /><circle cx="146" cy="60" r="2" /><circle cx="220" cy="22" r="2" />
                </g>
              </svg>
            </div>
            <div className="score-block" style={{ position: "relative", textAlign: "center", color: "var(--text-on-deep)" }}>
              <div style={{ fontSize: "clamp(80px, 12vw, 128px)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>0.72</div>
              <div style={{ fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent-soft)", fontWeight: 700, marginTop: 8 }}>Strong · ~92nd percentile</div>
              <div style={{ fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-on-deep-dim)", marginTop: 6 }}>Pulse · SHOP.TO · 14:00 ET rebuild</div>
            </div>
            <div style={{ position: "absolute", left: 24, bottom: 24, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 11.5, color: "var(--text-on-deep-dim)", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: "50%" }} />27 of 29 factors live · <strong style={{ color: "var(--text-on-deep)", fontWeight: 600 }}>91%</strong> coverage</div>
              <div style={{ fontSize: 11.5, color: "var(--text-on-deep-dim)", letterSpacing: "0.04em" }}>~<strong style={{ color: "var(--text-on-deep)", fontWeight: 600 }}>12</strong> independent signals today</div>
              <div style={{ fontSize: 11.5, color: "var(--text-on-deep-dim)", letterSpacing: "0.04em" }}>Σ weight = <strong style={{ color: "var(--text-on-deep)", fontWeight: 600 }}>1.000</strong> · verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* 29-FACTOR LEGEND STRIP */}
      <section id="legend" style={{ padding: "60px 20px", background: "var(--bg-muted)", borderTop: "var(--rule)", borderBottom: "var(--rule)" }}>
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          <div className="legend-lead">
            <div>
              <div className="eyebrow"><span className="num">02</span> · Twenty-nine signals, one read</div>
              <h2>Pulse is built from <span style={{ color: "var(--accent)", fontStyle: "italic" }}>29</span> measurable factors.</h2>
            </div>
            <p className="lede" style={{ marginBottom: 0 }}>Twelve of those are price-and-macro signals you&apos;ve heard of. Seventeen are things that quietly shape every position in your book whether you&apos;re watching them or not — Bank of Canada policy, Canadian headline inflation, gold as a risk-off hedge, the credit spread, the VIX. Pulse blends them, drops what&apos;s missing, and gives you a single number between zero and one.</p>
          </div>
          <div className="num-row">
            <div className="num-tile"><div className="big">29</div><div className="lbl">factors blended into one score</div></div>
            <div className="num-tile"><div className="big">5</div><div className="lbl">named bands · Quiet → Intense</div></div>
            <div className="num-tile"><div className="big">$0</div><div className="lbl">monthly data cost · free public sources</div></div>
            <div className="num-tile"><div className="big">14:00</div><div className="lbl">ET · daily rebuild · same number morning or night</div></div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}><span className="num">02.1</span> · The full PulseLegend</div>
            <div className="mini-legend" role="list">
              {LEGEND_FACTORS.map((f) => (
                <div key={f.n} className="item" role="listitem">
                  <span className="glyph" style={{ color: f.color }}>{f.glyph}</span>
                  {f.n} · {f.name}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 18, maxWidth: "70ch" }}>
              The 29 factors break into five lanes — price, macro, FX, news, and prediction-market sentiment. They are colour-coded so a glance tells you which lane a signal belongs to. Real term first, then the translation — that&apos;s the Quiet edge voice.
            </p>
          </div>
        </div>
      </section>

      {/* BANDS */}
      <section id="bands" style={{ padding: "60px 20px", background: "var(--bg-base)" }}>
        <div className="container">
          <div className="eyebrow"><span className="num">03</span> · The five bands</div>
          <h2>Five bands. <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Named, not numbered.</span></h2>
          <div className="band-row">
            {BANDS.map((b) => (
              <div key={b.tag} className={`band-cell ${b.cls}`}>
                <span className="pct">{b.pct}</span>
                <span className="tag">{b.tag}</span>
                <span className="nm">{b.name}</span>
                <span className="desc">{b.desc}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 18, maxWidth: "80ch" }}>
            The bands are fixed by name and by approximate percentile — Quiet covers the typical day, Intense stays rare by construction. The names don&apos;t change.
          </p>
        </div>
      </section>

      <section id="method" style={{ background: "var(--bg-base)" }}>
        {/* Layer 1 */}
        <div className="layer" style={{ padding: "60px 20px", borderTop: "var(--rule)" }}>
          <div className="container layer-grid">
            <div>
              <div className="layer-num">04 · Layer 1</div>
              <h2>One read on <span style={{ color: "var(--accent)", fontStyle: "italic" }}>how much</span> is happening, per holding.</h2>
              <p className="lede">The first thing Plumbline owes you is a clear picture of what you own. Not a wall of tickers. Not a sea of red and green. A picture. Each holding appears once, with the things that actually matter about it in plain sight — what it is, what sector it lives in, and the Pulse score that says, in one number, how much attention the position is asking for.</p>
            </div>
            <div className="vis-block">
              <div className="eyebrow"><span className="num">04.1</span> · Your holdings today</div>
              <h3 style={{ fontSize: "1.0625rem", marginBottom: 6 }}>Sample book · 4 positions</h3>
              <div className="mini-hold">
                <div className="row" style={{ background: "var(--bg-muted)", fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700 }}>
                  <span>Holding</span><span style={{ textAlign: "right" }}>Today</span><span style={{ textAlign: "right" }}>Pulse</span>
                </div>
                <div className="row"><span><span className="tk">SHOP</span><span className="nm">Shopify · TSX</span></span><span className="chg">+2.1%</span><span className="pulse" style={{ color: "var(--accent)" }}>Strong · 0.72</span></div>
                <div className="row"><span><span className="tk">RY</span><span className="nm">Royal Bank · TSX</span></span><span className="chg">+0.4%</span><span className="pulse" style={{ color: "var(--status-pos)" }}>Light · 0.34</span></div>
                <div className="row"><span><span className="tk">ENB</span><span className="nm">Enbridge · TSX</span></span><span className="chg warn">−0.6%</span><span className="pulse" style={{ color: "var(--status-watch)" }}>Active · 0.58</span></div>
                <div className="row"><span><span className="tk">BTC</span><span className="nm">Bitcoin · 0.18</span></span><span className="chg warn">−1.4%</span><span className="pulse" style={{ color: "var(--text-primary)" }}>Intense · 0.86</span></div>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 14, lineHeight: 1.5 }}>The same 2% move on the same day, on two different positions, gets two different Pulses — because the signals around the move are different. That&apos;s the read.</p>
            </div>
          </div>
        </div>

        {/* Layer 2 reverse */}
        <div className="layer reverse" style={{ padding: "60px 20px", borderTop: "var(--rule)" }}>
          <div className="container layer-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="vis-block" style={{ order: 1 }}>
              <div className="eyebrow"><span className="num">05.1</span> · The Daily Brief</div>
              <h3 style={{ fontSize: "1.0625rem", marginBottom: 6 }}>3–5 stories · curated · every morning</h3>
              <div className="mini-hold" style={{ marginTop: 14 }}>
                <div className="row" style={{ gridTemplateColumns: "64px 1fr" }}><span className="tk" style={{ color: "var(--accent-soft)" }}>RY</span><span><strong>Big Six banks brace for Q4 earnings</strong><span className="nm" style={{ display: "block", marginTop: 2 }}>Globe &amp; Mail · 06:42 ET</span></span></div>
                <div className="row" style={{ gridTemplateColumns: "64px 1fr" }}><span className="tk" style={{ color: "var(--accent-soft)" }}>ENB</span><span><strong>Crude holds near $78 as supply tightens</strong><span className="nm" style={{ display: "block", marginTop: 2 }}>Reuters · 05:58 ET</span></span></div>
                <div className="row" style={{ gridTemplateColumns: "64px 1fr" }}><span className="tk" style={{ color: "var(--accent-soft)" }}>CAD</span><span><strong>Loonie steady ahead of BoC decision Friday</strong><span className="nm" style={{ display: "block", marginTop: 2 }}>Bloomberg · 07:12 ET</span></span></div>
              </div>
            </div>
            <div style={{ order: 2 }}>
              <div className="layer-num">05 · Layer 2</div>
              <h2>The day&apos;s story, <span style={{ color: "var(--accent)", fontStyle: "italic" }}>in your language</span>.</h2>
              <p className="lede">Three to five stories each morning, hand-curated, each tied to a holding you actually own. No firehose. No hysteria. The Daily Brief tells you what the day sounded like for the positions you hold — not what Twitter thought of it.</p>
            </div>
          </div>
        </div>

        {/* Layer 3 */}
        <div className="layer" style={{ padding: "60px 20px", borderTop: "var(--rule)" }}>
          <div className="container layer-grid">
            <div>
              <div className="layer-num">06 · Layer 3</div>
              <h2>Decide well. <span style={{ color: "var(--accent)", fontStyle: "italic" }}>A rehearsal room</span>, not a recommendation engine.</h2>
              <p className="lede">The sandbox is the most important tool in Plumbline. You can build a paper portfolio — a pretend book, with pretend positions and real Pulse scores — in private, with no money at risk, and watch it behave against the same Pulse model and the same Daily Brief that your real portfolio lives inside. The decisions you make in the rehearsal room are yours, and the consequences are not real, and that is exactly why the rehearsal is useful.</p>
            </div>
            <div className="vis-block">
              <div className="eyebrow"><span className="num">06.1</span> · My Sandbox · &ldquo;Energy tilt — 2026&rdquo;</div>
              <div className="mini-hold">
                <div className="row"><span><span className="tk">ENB</span><span className="nm">Enbridge · 40%</span></span><span className="chg">+1.8%</span><span className="pulse" style={{ color: "var(--status-watch)" }}>Active · 0.58</span></div>
                <div className="row"><span><span className="tk">CNQ</span><span className="nm">Canadian Natural · 30%</span></span><span className="chg">+2.2%</span><span className="pulse" style={{ color: "var(--status-watch)" }}>Active · 0.61</span></div>
                <div className="row"><span><span className="tk">SU</span><span className="nm">Suncor · 20%</span></span><span className="chg">+0.9%</span><span className="pulse" style={{ color: "var(--status-pos)" }}>Light · 0.38</span></div>
                <div className="row"><span><span className="tk">CASH</span><span className="nm">Cash · 10%</span></span><span className="chg" style={{ color: "var(--text-secondary)" }}>—</span><span className="pulse" style={{ color: "var(--text-secondary)" }}>—</span></div>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 14 }}>Composite Pulse: <strong style={{ color: "var(--status-watch)" }}>0.51 · Active</strong>. Paper value <strong style={{ color: "var(--text-primary)" }}>$10,824</strong> vs cost <strong style={{ color: "var(--text-primary)" }}>$10,000</strong>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section id="pricing" className="cta-band" style={{ padding: "60px 20px", background: "var(--bg-deep)", color: "var(--text-on-deep)", textAlign: "center", position: "relative", overflow: "hidden", borderTop: "1px solid var(--accent-soft)" }}>
        <div className="container">
          <div className="eyebrow" style={{ color: "var(--accent-soft)" }}><span className="num" style={{ color: "var(--bg-base)" }}>$</span> · $4.99 CAD · monthly</div>
          <h2 style={{ color: "var(--text-on-deep)", maxWidth: "20ch", margin: "0 auto 18px" }}>One subscription. <span style={{ color: "var(--accent-soft)" }}>$4.99</span> per month, after a 7-day free trial.</h2>
          <p style={{ color: "var(--text-on-deep-dim)", maxWidth: "50ch", margin: "0 auto 32px", fontSize: "1.0625rem" }}>Cancel anytime — no questions, no retention call, no dark patterns. The data costs us $0/month because every source is free and public. The price is what it is.</p>
          <StartTrialButton variant="cta-band">Start 7-day free trial</StartTrialButton>
          <div style={{ fontSize: 12, color: "var(--text-on-deep-dim)", marginTop: 18, letterSpacing: "0.04em" }}>14-day money-back guarantee · Cancel from your account page · No card-on-file for the trial</div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section style={{ padding: "40px 20px", background: "var(--bg-base)" }}>
        <div className="container">
          <LockedDisclaimer />
          <p style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 12, maxWidth: "80ch" }}>Past conditions are not a forecast of future ones.</p>
        </div>
      </section>

      {/* Inline page CSS (landing-specific styles that aren't in globals) */}
      <style>{`
        .hero-pill{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:var(--bg-surface);border:1px solid var(--border-rule);font-size:12px;color:var(--text-secondary);font-weight:500;margin-bottom:24px}
        .hero-pill .pulse-dot{width:6px;height:6px;background:var(--accent);border-radius:50%;animation:p 2.4s infinite}
        @keyframes p{0%,100%{opacity:1}50%{opacity:.4}}
        .hero-actions{display:flex;align-items:center;gap:16px;margin-top:12px;flex-wrap:wrap}
        .hero .container{display:grid;grid-template-columns:1fr;gap:48px}
        .hero .orbit{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
        @media (min-width: 980px){
          .hero .container{grid-template-columns:1.1fr .9fr;gap:60px}
          .layer-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:80px;align-items:start}
          .layer.reverse .layer-grid{grid-template-columns:1.1fr 1fr}
          .layer.reverse .vis-block{order:-1}
          .legend-lead{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:end}
          .num-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border-subtle);border:1px solid var(--border-subtle)}
          .band-row{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--border-subtle);border:1px solid var(--border-subtle)}
          .before-after{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:8px}
        }
        @media (max-width: 979px){
          .num-row{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border-subtle);border:1px solid var(--border-subtle)}
          .band-row{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border-subtle);border:1px solid var(--border-subtle)}
        }
        .num-tile{background:var(--bg-surface);padding:24px 22px;display:flex;flex-direction:column;gap:6px}
        .num-tile .big{font-size:48px;font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--accent);font-variant-numeric:tabular-nums}
        .num-tile .lbl{font-size:12.5px;color:var(--text-secondary);letter-spacing:.06em;font-weight:500}
        .band-cell{background:var(--bg-surface);padding:24px 22px;display:flex;flex-direction:column;gap:8px;min-height:140px;position:relative}
        .band-cell .tag{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-secondary);font-weight:700}
        .band-cell .nm{font-size:1.5rem;font-weight:700;letter-spacing:-.01em}
        .band-cell.q{border-top:4px solid #C7BFA9}
        .band-cell.l{border-top:4px solid #B89346}
        .band-cell.a{border-top:4px solid #D87B52}
        .band-cell.s{border-top:4px solid #B8542B}
        .band-cell.i{border-top:4px solid #1B1A17}
        .band-cell .desc{font-size:12.5px;color:var(--text-secondary);line-height:1.5}
        .band-cell .pct{position:absolute;top:24px;right:22px;font-size:10.5px;color:var(--text-secondary);font-variant-numeric:tabular-nums;letter-spacing:.04em}
        .mini-legend{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1px;background:var(--border-subtle);border:1px solid var(--border-subtle)}
        .mini-legend .item{background:var(--bg-surface);padding:14px 16px;display:flex;align-items:center;gap:10px;font-size:12.5px;font-weight:500}
        .mini-legend .item .glyph{width:18px;height:18px;display:grid;place-items:center}
        .mini-legend .item .glyph svg{width:14px;height:14px;display:block}
        .vis-block{background:var(--bg-surface);border:1px solid var(--border-subtle);padding:32px;min-height:380px;position:relative}
        .layer-num{font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:18px}
        .layer h2{font-size:2rem;line-height:1.15;margin-bottom:20px;max-width:20ch}
        .layer .lede{font-size:1rem;max-width:50ch}
        .mini-hold{display:flex;flex-direction:column;gap:1px;background:var(--border-subtle);border:1px solid var(--border-subtle);margin-top:18px}
        .mini-hold .row{background:var(--bg-surface);display:grid;grid-template-columns:1fr 80px 80px;align-items:center;padding:12px 16px;font-size:13px}
        .mini-hold .row .tk{font-weight:700;font-variant-numeric:tabular-nums}
        .mini-hold .row .nm{font-size:11px;color:var(--text-secondary);font-weight:400;display:block;margin-top:2px}
        .mini-hold .row .pulse{text-align:right;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
        .mini-hold .row .chg{text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:var(--status-pos)}
        .mini-hold .row .chg.warn{color:var(--status-watch)}
      `}</style>
    </MarketingPage>
  );
}

// Inline legend factors (subset of full 29 — visual treatment only)
const LEGEND_FACTORS: Array<{ n: string; name: string; color: string; glyph: JSX.Element }> = [
  { n: "F1", name: "Return 1d", color: "#1B1A17", glyph: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor" /></svg> },
  { n: "F2", name: "Return vs sector", color: "#B8542B", glyph: <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="currentColor" /></svg> },
  { n: "F3", name: "Volatility 30d", color: "#B89346", glyph: <svg viewBox="0 0 24 24"><polygon points="12,3 21,20 3,20" fill="currentColor" /></svg> },
  { n: "F4", name: "Drawdown depth", color: "#4A6E3A", glyph: <svg viewBox="0 0 24 24"><polygon points="12,3 21,12 12,21 3,12" fill="currentColor" /></svg> },
  { n: "F5", name: "BoC rate", color: "#2E6B7A", glyph: <svg viewBox="0 0 24 24"><polygon points="12,3 21,8 21,17 12,22 3,17 3,8" fill="currentColor" /></svg> },
  { n: "F6+16", name: "FX", color: "#5C7A8C", glyph: <svg viewBox="0 0 24 24"><polygon points="12,3 19,12 12,21 5,12" fill="currentColor" /></svg> },
  { n: "F7", name: "Commodity", color: "#8C6F3F", glyph: <svg viewBox="0 0 24 24"><polygon points="12,3 21,9 17,20 7,20 3,9" fill="currentColor" /></svg> },
  { n: "F8", name: "Sector rotation", color: "#6B5B95", glyph: <svg viewBox="0 0 24 24"><polygon points="6,3 18,3 22,8 22,16 18,21 6,21 2,16 2,8" fill="currentColor" /></svg> },
  { n: "F9", name: "News tone", color: "#C26456", glyph: <svg viewBox="0 0 24 24"><path d="M12 4 L20 13 L16 13 L16 21 L8 21 L8 13 L4 13 Z" fill="currentColor" /></svg> },
  { n: "F10", name: "Event volume", color: "#8E9FAA", glyph: <svg viewBox="0 0 24 24"><path d="M10 4 H14 V10 H20 V14 H14 V20 H10 V14 H4 V10 H10 Z" fill="currentColor" /></svg> },
  { n: "F11", name: "Story direction", color: "#4D8B6E", glyph: <svg viewBox="0 0 24 24"><path d="M12 20 L4 11 L8 11 L8 3 L16 3 L16 11 L20 11 Z" fill="currentColor" /></svg> },
  { n: "F12", name: "News-macro align", color: "#56524A", glyph: <svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="4" fill="currentColor" /></svg> },
  { n: "F13", name: "Headline CPI", color: "#9A4A2A", glyph: <svg viewBox="0 0 24 24"><polygon points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9" fill="currentColor" /></svg> },
  { n: "F14", name: "Gas CAD/L", color: "#A6613A", glyph: <svg viewBox="0 0 24 24"><path d="M12 3 C7 3 5 7 5 11 C5 17 12 22 12 22 C12 22 19 17 19 11 C19 7 17 3 12 3 Z" fill="currentColor" /></svg> },
  { n: "F15", name: "Gold USD/oz", color: "#C9A24A", glyph: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg> },
  { n: "F17", name: "Oil embargoed", color: "#5A4E3A", glyph: <svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="14" fill="currentColor" /></svg> },
  { n: "F18", name: "Renewables", color: "#6B8E5A", glyph: <svg viewBox="0 0 24 24"><path d="M4 18 C4 11 12 4 20 12 C16 14 12 18 4 18 Z" fill="currentColor" /></svg> },
  { n: "F19", name: "Auto sales", color: "#4A5E70", glyph: <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="6" rx="2" fill="currentColor" /></svg> },
  { n: "F20", name: "GDP per capita", color: "#3D5466", glyph: <svg viewBox="0 0 24 24"><rect x="4" y="14" width="3" height="6" fill="currentColor" /><rect x="10.5" y="9" width="3" height="11" fill="currentColor" /><rect x="17" y="4" width="3" height="16" fill="currentColor" /></svg> },
  { n: "F21", name: "US Fed funds", color: "#1B3A4B", glyph: <svg viewBox="0 0 24 24"><circle cx="12" cy="6" r="2.5" fill="currentColor" /><rect x="11" y="9" width="2" height="9" fill="currentColor" /><path d="M6 14 H18 L12 22 Z" fill="currentColor" /></svg> },
  { n: "F22", name: "10y-2y spread", color: "#264653", glyph: <svg viewBox="0 0 24 24"><path d="M2 14 Q6 6 10 12 T18 10 T22 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg> },
  { n: "F23", name: "Labour Heat", color: "#7A5C3A", glyph: <svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" fill="currentColor" /><path d="M4 22 C4 16 8 14 12 14 C16 14 20 16 20 22 Z" fill="currentColor" /></svg> },
  { n: "F24", name: "Shelter NHPI", color: "#8A6F4A", glyph: <svg viewBox="0 0 24 24"><path d="M4 12 L12 4 L20 12 L20 20 L4 20 Z" fill="currentColor" /></svg> },
  { n: "F25", name: "Trade balance", color: "#3F5E5A", glyph: <svg viewBox="0 0 24 24"><path d="M2 18 L7 14 L11 17 L17 9 L22 6 L22 18 Z" fill="currentColor" /></svg> },
  { n: "F26", name: "Breakeven 10y", color: "#6E5B95", glyph: <svg viewBox="0 0 24 24"><path d="M3 18 C7 18 9 6 12 6 C15 6 17 18 21 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg> },
  { n: "F27", name: "HY OAS", color: "#A04A3A", glyph: <svg viewBox="0 0 24 24"><rect x="2" y="9" width="4" height="9" fill="currentColor" /><rect x="10" y="5" width="4" height="13" fill="currentColor" /><rect x="18" y="11" width="4" height="7" fill="currentColor" /></svg> },
  { n: "F28", name: "VIX", color: "#3F4A56", glyph: <svg viewBox="0 0 24 24"><path d="M2 14 L7 8 L11 16 L14 6 L17 14 L22 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { n: "F29", name: "Prediction mkts", color: "#7A6F4A", glyph: <svg viewBox="0 0 24 24"><polygon points="12,3 15,10 22,10 16,15 18,22 12,18 6,22 8,15 2,10 9,10" fill="none" stroke="currentColor" strokeWidth="2" /></svg> },
  { n: "F30", name: "News spike", color: "#B8442B", glyph: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor" /><path d="M12 5 V8 M12 16 V19 M5 12 H8 M16 12 H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> },
];

const BANDS = [
  { tag: "Band 1", name: "Quiet", cls: "q", pct: "below ~50th", desc: "The holding is doing what it usually does. Nothing is asking for your attention." },
  { tag: "Band 2", name: "Light", cls: "l", pct: "~50th – 75th", desc: "Something small has shifted. Worth being aware of, not enough to act on." },
  { tag: "Band 3", name: "Active", cls: "a", pct: "~75th – 90th", desc: "Conditions are in motion. A thoughtful look is reasonable." },
  { tag: "Band 4", name: "Strong", cls: "s", pct: "~90th – 98th", desc: "Several signals are lined up. The story has shape. Read before you do anything." },
  { tag: "Band 5", name: "Intense", cls: "i", pct: "top ~2%", desc: "Most or all factors are signalling. Rare. Cross-check before you draw conclusions." },
];
