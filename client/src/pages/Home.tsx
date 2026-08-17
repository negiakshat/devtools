/** Precision Console design reminder: the landing state is a usable-looking workbench, with tool inventory and runtime telemetry prioritized over marketing decoration. */
import { Activity, ArrowRight, Braces, Database, ShieldCheck, Terminal, Zap } from "lucide-react";
import { Link } from "wouter";
import AppShell from "@/components/AppShell";
import DocumentHead from "@/components/DocumentHead";
import AdSlot from "@/components/AdSlot";
import { categories, tools } from "@/lib/toolRegistry";
import { trackEvent } from "@/lib/analytics";
// Precision Console home: public visitors receive utility context, not internal project structure.
export default function Home() {
  const toolCount = String(tools.length).padStart(2, "0");
  return (
    <AppShell>
      <DocumentHead page={{ path: "/", title: "Developer Tools — Free, Local-First Browser Utilities", description: "Free browser-based developer utilities for JSON, data conversion, JWT inspection, and Base64 workflows. Process input locally with no account required.", type: "WebSite" }} />
      <div className="home-page">
        <section className="home-hero">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="pulse-dot" />Console environment / ready</div>
            <h1>Open a<br /><em>ready workbench.</em></h1>
            <p className="hero-lede">{tools.length} focused browser utilities for shaping real developer data.</p>
            <p className="hero-support">No signup. No paywall. Deterministic transformations stay in browser memory whenever possible.</p>
            <div className="home-runtime-ledger" aria-label="Workbench system status"><span><i />EXECUTION <b>LOCAL</b></span><span><i />INPUT STORAGE <b>VOLATILE</b></span><span><i />UTILITY SET <b>{toolCount} READY</b></span></div>
            <div className="hero-actions"><Link href="/json-formatter" className="primary-link">Run JSON Formatter <ArrowRight size={16} /></Link><a href="#tools" className="secondary-link">View utility inventory <ArrowRight size={15} /></a></div>
            <div className="hero-technical" aria-label="Product characteristics"><span><Zap size={14} />Client-side execution</span><span><ShieldCheck size={14} />No input persistence</span><span><Braces size={14} />Structured output</span></div>
          </div>
          <section className="home-live-console" aria-label="Ready workbench preview">
            <header><span><span className="pulse-dot" />[•] WORKBENCH / JSON FORMATTER</span><small>READY</small></header>
            <div className="live-console-body">
              <div className="live-code"><span className="live-line-number">1</span><code><i>{"{"}</i></code><span className="live-line-number">2</span><code>&nbsp;&nbsp;<b>"service"</b>: <em>"devtools"</em>,</code><span className="live-line-number">3</span><code>&nbsp;&nbsp;<b>"process"</b>: <em>"local"</em></code><span className="live-line-number">4</span><code><i>{"}"}</i></code></div>
              <div className="live-console-actions"><span><Database size={15} />INPUT · 54 B</span><span><Activity size={15} />VALID JSON</span><span><Terminal size={15} />OUTPUT READY</span></div>
            </div>
            <footer><span>{toolCount} TOOLS AVAILABLE · SESSION: LOCAL</span><Link href="/json-formatter">OPEN WORKBENCH <ArrowRight size={13} /></Link></footer>
          </section>
        </section>

        <section className="tool-directory" id="tools" aria-labelledby="tool-directory-title">
          <div className="directory-header"><div><p className="eyebrow">Utility inventory / {toolCount} online</p><h2 id="tool-directory-title">Choose a workbench.</h2></div><p>Every tool is an independent local utility. Open one, paste data, run the command, and copy or download the result.</p></div>
          {categories.map((category) => <div key={category} className="directory-section"><div className="category-label"><span>{category}</span><i /></div><div className="tool-grid">{tools.filter((tool) => tool.category === category).map((tool) => { const Icon = tool.icon; return <Link href={`/${tool.slug}`} className="tool-card" key={tool.slug} onClick={() => trackEvent("tool_navigation_clicked", { tool_slug: tool.slug, tool_category: tool.category, source: "directory" })}><span className="tool-card-icon"><Icon size={20} /></span><span className="tool-card-content"><strong>{tool.name}</strong><small>{tool.description}</small></span><ArrowRight className="tool-arrow" size={16} /></Link>; })}</div></div>)}
        </section>
        <section className="home-proof"><div className="proof-icon"><ShieldCheck size={23} /></div><div><p className="eyebrow">Private by architecture</p><h2>Data transformations belong on your machine.</h2><p>These deterministic tools do not need an account or a server round trip. Input stays in browser memory and is discarded when you leave or clear a tool.</p></div><Link href="/json-formatter" className="text-link">Open a local tool <ArrowRight size={15} /></Link></section>
        <AdSlot label="Optional sponsor reserve · never in the execution path" />
      </div>
    </AppShell>
  );
}
