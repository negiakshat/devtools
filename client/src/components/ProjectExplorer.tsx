import { useEffect, useState } from "react";
import { Braces, ChevronRight, ChevronsUp, FileCode2, FileCog, FileJson2, FileText, Folder, FolderOpen, Palette } from "lucide-react";
import { tools } from "@/lib/toolRegistry";

// Precision Console explorer: a truthful project map with purposeful disclosure, compact diagnostics, and keyboard-native tree controls.
type FileKind = "typescript" | "javascript" | "css" | "json" | "markdown" | "config" | "system";
type ExplorerFile = { kind: "file"; id: string; name: string; path: string; fileKind: FileKind };
type ExplorerFolder = { kind: "folder"; id: string; name: string; path: string; children: ExplorerNode[]; generated?: boolean };
type ExplorerNode = ExplorerFile | ExplorerFolder;
type ExplorerGroup = { id: string; label: "APP" | "CONFIG" | "DOCS" | "RESEARCH" | "SYSTEM"; nodes: ExplorerNode[] };

const storageKey = "devtools-explorer-expanded";
const defaultExpanded = ["group-app", "folder-client", "folder-client-src", "folder-components", "folder-contexts", "folder-hooks", "folder-lib", "folder-pages", "group-config"];

const sourceTree: ExplorerGroup[] = [
  {
    id: "group-app",
    label: "APP",
    nodes: [
      {
        kind: "folder", id: "folder-client", name: "client/", path: "client", children: [
          { kind: "file", id: "client-index", name: "index.html", path: "client/index.html", fileKind: "config" },
          {
            kind: "folder", id: "folder-client-src", name: "src/", path: "client/src", children: [
              { kind: "file", id: "app", name: "App.tsx", path: "client/src/App.tsx", fileKind: "typescript" },
              {
                kind: "folder", id: "folder-components", name: "components/", path: "client/src/components", children: [
                  { kind: "file", id: "appshell", name: "AppShell.tsx", path: "client/src/components/AppShell.tsx", fileKind: "typescript" },
                  { kind: "file", id: "editor-pane", name: "EditorPane.tsx", path: "client/src/components/EditorPane.tsx", fileKind: "typescript" },
                  { kind: "file", id: "command-strip", name: "CommandStrip.tsx", path: "client/src/components/CommandStrip.tsx", fileKind: "typescript" },
                  { kind: "file", id: "ui", name: "ui/", path: "client/src/components/ui", fileKind: "system" },
                ],
              },
              {
                kind: "folder", id: "folder-contexts", name: "contexts/", path: "client/src/contexts", children: [
                  { kind: "file", id: "workspace-preferences", name: "WorkspacePreferences.tsx", path: "client/src/contexts/WorkspacePreferences.tsx", fileKind: "typescript" },
                  { kind: "file", id: "theme-context", name: "ThemeContext.tsx", path: "client/src/contexts/ThemeContext.tsx", fileKind: "typescript" },
                ],
              },
              {
                kind: "folder", id: "folder-hooks", name: "hooks/", path: "client/src/hooks", children: [
                  { kind: "file", id: "mobile-hook", name: "useMobile.tsx", path: "client/src/hooks/useMobile.tsx", fileKind: "typescript" },
                  { kind: "file", id: "composition-hook", name: "useComposition.ts", path: "client/src/hooks/useComposition.ts", fileKind: "typescript" },
                ],
              },
              {
                kind: "folder", id: "folder-lib", name: "lib/", path: "client/src/lib", children: [
                  { kind: "file", id: "tool-registry", name: "toolRegistry.ts", path: "client/src/lib/toolRegistry.ts", fileKind: "typescript" },
                  { kind: "file", id: "transforms", name: "transforms.ts", path: "client/src/lib/transforms.ts", fileKind: "typescript" },
                  { kind: "file", id: "analytics", name: "analytics.ts", path: "client/src/lib/analytics.ts", fileKind: "typescript" },
                ],
              },
              {
                kind: "folder", id: "folder-pages", name: "pages/", path: "client/src/pages", children: [
                  { kind: "file", id: "home-page", name: "Home.tsx", path: "client/src/pages/Home.tsx", fileKind: "typescript" },
                  { kind: "file", id: "tool-route", name: "ToolRoute.tsx", path: "client/src/pages/ToolRoute.tsx", fileKind: "typescript" },
                ],
              },
              { kind: "file", id: "main", name: "main.tsx", path: "client/src/main.tsx", fileKind: "typescript" },
              { kind: "file", id: "styles", name: "index.css", path: "client/src/index.css", fileKind: "css" },
            ],
          },
          { kind: "folder", id: "folder-public", name: "public/", path: "client/public", children: [{ kind: "file", id: "robots", name: "robots.txt", path: "client/public/robots.txt", fileKind: "config" }, { kind: "file", id: "sitemap", name: "sitemap.xml", path: "client/public/sitemap.xml", fileKind: "config" }] },
        ],
      },
      { kind: "folder", id: "folder-server", name: "server/", path: "server", children: [{ kind: "file", id: "server-index", name: "index.ts", path: "server/index.ts", fileKind: "typescript" }] },
      { kind: "folder", id: "folder-shared", name: "shared/", path: "shared", children: [{ kind: "file", id: "shared-const", name: "const.ts", path: "shared/const.ts", fileKind: "typescript" }] },
    ],
  },
  {
    id: "group-config",
    label: "CONFIG",
    nodes: [
      { kind: "file", id: "package", name: "package.json", path: "package.json", fileKind: "json" },
      { kind: "file", id: "pnpm-workspace", name: "pnpm-workspace.yaml", path: "pnpm-workspace.yaml", fileKind: "config" },
      { kind: "file", id: "vite", name: "vite.config.ts", path: "vite.config.ts", fileKind: "config" },
      { kind: "file", id: "tsconfig", name: "tsconfig.json", path: "tsconfig.json", fileKind: "json" },
      { kind: "file", id: "components-json", name: "components.json", path: "components.json", fileKind: "json" },
    ],
  },
  {
    id: "group-docs",
    label: "DOCS",
    nodes: [
      { kind: "file", id: "ideas", name: "ideas.md", path: "ideas.md", fileKind: "markdown" },
      { kind: "file", id: "todo", name: "todo.md", path: "todo.md", fileKind: "markdown" },
      { kind: "file", id: "qa-notes", name: "qa_v2_notes.md", path: "qa_v2_notes.md", fileKind: "markdown" },
    ],
  },
  {
    id: "group-research",
    label: "RESEARCH",
    nodes: [{ kind: "folder", id: "folder-research", name: "research/", path: "research", children: [
      { kind: "file", id: "qa-report", name: "final-prelaunch-qa-report.md", path: "research/final-prelaunch-qa-report.md", fileKind: "markdown" },
      { kind: "file", id: "quality-audit", name: "tool-quality-audit.md", path: "research/tool-quality-audit.md", fileKind: "markdown" },
      { kind: "file", id: "discovery-audit", name: "production-discovery-audit.md", path: "research/production-discovery-audit.md", fileKind: "markdown" },
    ] }],
  },
  {
    id: "group-system",
    label: "SYSTEM",
    nodes: [
      { kind: "folder", id: "folder-dist", name: "dist/", path: "dist", generated: true, children: [] },
      { kind: "folder", id: "folder-node-modules", name: "node_modules/", path: "node_modules", generated: true, children: [] },
      { kind: "folder", id: "folder-logs", name: ".manus-logs/", path: ".manus-logs", generated: true, children: [] },
      { kind: "file", id: "gitignore", name: ".gitignore", path: ".gitignore", fileKind: "system" },
      { kind: "file", id: "lockfile", name: "pnpm-lock.yaml", path: "pnpm-lock.yaml", fileKind: "system" },
    ],
  },
];

function getStoredExpanded() {
  try {
    const stored = sessionStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as string[] : defaultExpanded;
  } catch {
    return defaultExpanded;
  }
}

function FileGlyph({ kind }: { kind: FileKind }) {
  const Icon = kind === "css" ? Palette : kind === "json" ? FileJson2 : kind === "markdown" ? FileText : kind === "config" || kind === "system" ? FileCog : kind === "javascript" ? Braces : FileCode2;
  return <Icon aria-hidden="true" size={14} />;
}

export default function ProjectExplorer() {
  const [expanded, setExpanded] = useState<string[]>(getStoredExpanded);
  const [selectedPath, setSelectedPath] = useState("client/src/App.tsx");
  const [openedPath, setOpenedPath] = useState<string | null>(null);

  useEffect(() => { sessionStorage.setItem(storageKey, JSON.stringify(expanded)); }, [expanded]);
  const isExpanded = (id: string) => expanded.includes(id);
  const toggle = (id: string) => setExpanded((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
  const selectFile = (path: string, open = false) => { setSelectedPath(path); if (open) setOpenedPath(path); };

  const renderNode = (node: ExplorerNode, level: number): React.ReactNode => {
    if (node.kind === "file") return <button type="button" role="treeitem" aria-level={level} aria-selected={selectedPath === node.path} className={`explorer-file explorer-file-${node.fileKind} ${selectedPath === node.path ? "is-selected" : ""} ${openedPath === node.path ? "is-open" : ""}`} title={node.path} onClick={() => selectFile(node.path)} onDoubleClick={() => selectFile(node.path, true)} key={node.id}><FileGlyph kind={node.fileKind} /><span>{node.name}</span>{openedPath === node.path && <small>OPEN</small>}</button>;

    const open = isExpanded(node.id);
    return <div className="explorer-folder" key={node.id}><button type="button" role="treeitem" aria-level={level} aria-expanded={open} aria-controls={`${node.id}-children`} className={`explorer-folder-trigger ${open ? "is-expanded" : ""}`} title={node.path} onClick={() => toggle(node.id)}><ChevronRight className="explorer-chevron" size={13} aria-hidden="true" />{open ? <FolderOpen size={15} aria-hidden="true" /> : <Folder size={15} aria-hidden="true" />}<span>{node.name}</span>{node.generated && <small>GENERATED</small>}</button>{open && <div id={`${node.id}-children`} role="group" className="explorer-children">{node.children.length ? node.children.map((child) => renderNode(child, level + 1)) : <p className="explorer-empty">No files shown</p>}</div>}</div>;
  };

  return <section className="project-explorer" aria-labelledby="project-explorer-title">
    <header className="explorer-header">
      <div className="explorer-heading"><span className="explorer-mark">[•]</span><div><p id="project-explorer-title">DEVTOOLS <b>WORKSPACE</b></p><span><i /> LOCAL <em>{tools.length} UTILITIES</em></span></div></div>
      <button type="button" className="explorer-collapse-all" onClick={() => setExpanded([])} title="Collapse all folders"><ChevronsUp size={15} aria-hidden="true" /><span>COLLAPSE ALL</span></button>
    </header>
    <div className="explorer-active-file" aria-live="polite"><span>{openedPath ? "OPEN FILE" : "SELECTED FILE"}</span><code title={openedPath ?? selectedPath}>{openedPath ?? selectedPath}</code><b>{openedPath ? "ACTIVE" : "LOCAL"}</b></div>
    <div className="explorer-tree" role="tree" aria-label="DEVTOOLS project files">{sourceTree.map((group) => { const open = isExpanded(group.id); return <section className="explorer-group" key={group.id}><button type="button" role="treeitem" aria-level={1} aria-expanded={open} aria-controls={`${group.id}-children`} className={`explorer-group-trigger ${open ? "is-expanded" : ""}`} onClick={() => toggle(group.id)}><ChevronRight className="explorer-chevron" size={13} aria-hidden="true" /><span>{group.label}</span><i /></button>{open && <div id={`${group.id}-children`} role="group" className="explorer-group-children">{group.nodes.map((node) => renderNode(node, 2))}</div>}</section>; })}</div>
  </section>;
}
