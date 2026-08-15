/** Precision Console design reminder: anchored workbench layout, left navigation rail, low-chrome header, and no marketing clutter. */
// DEVTOOLS shell: preserve the near-black IDE workbench and quiet, accessible sidebar controls without reintroducing removed brand chrome.
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, PanelLeftClose, PanelLeftOpen, Search, Settings2, ShieldCheck, X } from "lucide-react";
import { PreferencesPanel } from "@/components/PreferencesPanel";
import { useWorkspacePreferences } from "@/contexts/WorkspacePreferences";
import { trackEvent } from "@/lib/analytics";
import { categories, tools } from "@/lib/toolRegistry";

function SignalMark() {
  return <span className="signal-mark" aria-hidden="true"><i /><b /><i /></span>;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { preferences, updatePreferences } = useWorkspacePreferences();
  const filteredTools = useMemo(() => tools.filter((tool) => `${tool.name} ${tool.description}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const activeTool = tools.find((tool) => location === `/${tool.slug}`);
  const workspaceLabel = activeTool ? `WORKBENCH / ${activeTool.shortName.toUpperCase()}` : "WORKBENCH / READY";
  const activeName = activeTool?.name ?? "Utility inventory";
  const toolCount = String(tools.length).padStart(2, "0");

  const sidebar = (
    <nav className="tool-nav" aria-label="Developer tools">
      <div className="sidebar-brand">
        <div className="sidebar-mark-zone" aria-label="DevTools">
          <SignalMark />
        </div>
        <button type="button" className="sidebar-collapse-control" onClick={() => updatePreferences({ sidebarCollapsed: !preferences.sidebarCollapsed })} aria-label={preferences.sidebarCollapsed ? "Expand desktop sidebar" : "Collapse desktop sidebar"} title={preferences.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>{preferences.sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
        <button type="button" className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={19} /></button>
      </div>
      <section className="rail-system-state" aria-label="Current workbench state"><span><i className="rail-live-dot" />ACTIVE WORKSPACE</span><strong><i aria-hidden="true">[•]</i> {activeName}</strong><small>{activeTool ? `ROUTE / ${activeTool.slug.toUpperCase()} · LOCAL` : `${toolCount} LOCAL UTILITIES ONLINE`}</small></section>
      <label className="tool-search"><Search size={15} /><span className="sr-only">Filter tools</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter tools" /></label>
      <div className="rail-inventory-heading"><span>UTILITY INVENTORY</span><b>{toolCount}/{toolCount}</b></div>
      <div className="tool-nav-scroll">
        {categories.map((category) => {
          const items = filteredTools.filter((tool) => tool.category === category);
          if (!items.length) return null;
          return <div className="nav-group" key={category}>
            <p>{category}</p>
            {items.map((tool) => {
              const Icon = tool.icon;
              const active = location === `/${tool.slug}`;
              return <Link key={tool.slug} href={`/${tool.slug}`} onClick={() => { trackEvent("tool_navigation_clicked", { tool_slug: tool.slug, tool_category: tool.category, source: "sidebar" }); setMobileOpen(false); }} className={`nav-tool ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined} aria-label={tool.name} data-tooltip={tool.name}><Icon size={16} /><span className="nav-tool-label">{tool.shortName}</span>{active && <i className="nav-active-mark" aria-hidden="true">[•] RUN</i>}</Link>;
            })}
          </div>;
        })}
      </div>
      <div className="sidebar-local"><ShieldCheck size={15} /><div><span>EXECUTION</span><b>LOCAL-FIRST</b></div><div><span>MEMORY</span><b>SESSION ONLY</b></div></div>
      <div className="sidebar-site-links" aria-label="Site information"><Link href="/about" onClick={() => setMobileOpen(false)}>About</Link><Link href="/privacy" onClick={() => setMobileOpen(false)}>Privacy</Link><Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link></div>
    </nav>
  );

  return (
    <div className="app-frame" data-density={preferences.density} data-sidebar={preferences.sidebarCollapsed ? "collapsed" : "expanded"}>
      <aside className="desktop-sidebar">{sidebar}</aside>
      {mobileOpen && <div className="mobile-nav-layer"><div className="mobile-scrim" onClick={() => setMobileOpen(false)} /><aside className="mobile-sidebar">{sidebar}</aside></div>}
      <div className="workspace">
        <header className="app-header">
          <button type="button" className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open tool navigation"><Menu size={20} /></button>
          <Link href="/" className="mobile-brand"><SignalMark /><span>DEVTOOLS</span></Link>
          <div className="header-console-context"><span className="pulse-dot" />{workspaceLabel}</div>
          <div className="header-status"><span>{tools.length} UTILITIES</span><span className="header-divider" /><span>NO ACCOUNT</span></div>
          <button type="button" className="preferences-trigger" onClick={() => setPreferencesOpen(true)} aria-label="Open workspace preferences" title="Workspace preferences"><Settings2 size={15} /><span>PREFERENCES</span></button>
          <span className="session-status">SESSION: BROWSER · MODE: LOCAL</span>
        </header>
        <main className="workspace-main">{children}</main>
        <footer className="app-footer"><span>DEVTOOLS / BROWSER-FIRST UTILITIES</span><span>NO INPUT PERSISTENCE · SESSION MEMORY ONLY</span><span className="footer-links"><Link href="/about">ABOUT</Link><Link href="/privacy">PRIVACY</Link><Link href="/contact">CONTACT</Link></span></footer>
      </div>
      <PreferencesPanel open={preferencesOpen} onOpenChange={setPreferencesOpen} />
    </div>
  );
}
