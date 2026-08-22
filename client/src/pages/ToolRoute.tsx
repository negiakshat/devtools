/** Precision Console design reminder: every route is a high-clarity local workbench—focused editors, explicit diagnostics, compact support copy. */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Check, CircleAlert, Clipboard, Download, FileJson2, GitCompareArrows, Info, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import AdSlot from "@/components/AdSlot";
import DocumentHead from "@/components/DocumentHead";
import { EditorPane, OutputPane } from "@/components/EditorPane";
import CommandStrip from "@/components/CommandStrip";
import { toolBySlug, tools, type ToolDefinition, type ToolSlug } from "@/lib/toolRegistry";
import { trackEvent, trackToolEvent } from "@/lib/analytics";
import { decodeBase64Utf8, decodeJwt, diffJson, encodeBase64Utf8, formatJson, formatJsonIssue, getMetrics, inferJsonSchema, jsonToCsv, jsonToTypeScript, jsonToYaml, minifyJson, parseJson, sortJsonKeys, type DiffEntry } from "@/lib/transforms";
import NotFound from "./NotFound";

// Precision Console: examples are intentional, local fixtures that make an empty workbench immediately actionable.
const examples = {
  json: '{\n  "name": "Alice",\n  "role": "developer",\n  "active": true\n}',
  records: '[\n  { "id": 1, "name": "Ada", "team": "platform" },\n  { "id": 2, "name": "Lin", "team": "tools" }\n]',
  before: '{\n  "service": "devtools",\n  "version": 1,\n  "features": ["format", "validate"]\n}',
  after: '{\n  "service": "devtools",\n  "version": 2,\n  "features": ["format", "diff"],\n  "local": true\n}',
  jwt: "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhbGljZSIsInJvbGUiOiJkZXZlbG9wZXIiLCJleHAiOjE4MDAwMDAwMDB9.signature",
  text: "Hello, developer!",
  base64: "SGVsbG8sIGRldmVsb3BlciE=",
};

function isToolSlug(slug: string): slug is ToolSlug {
  return tools.some((tool) => tool.slug === slug);
}

function activeToolFromRoute() {
  if (typeof window === "undefined") return undefined;
  const slug = window.location.pathname.slice(1);
  return isToolSlug(slug) ? toolBySlug[slug] : undefined;
}

function copyText(value: string, label = "Output", tool?: ToolDefinition) {
  if (!value) return;
  navigator.clipboard.writeText(value).then(() => { const activeTool = tool ?? activeToolFromRoute(); if (activeTool) trackToolEvent("copy_clicked", activeTool, { action: "output" }); toast.success(`${label} copied to clipboard.`); }).catch(() => toast.error("Clipboard access was blocked. Select and copy the output manually."));
}

function downloadText(value: string, filename: string, type = "text/plain;charset=utf-8", tool?: ToolDefinition) {
  if (!value) return;
  const href = URL.createObjectURL(new Blob([value], { type }));
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
  const activeTool = tool ?? activeToolFromRoute();
  if (activeTool) trackToolEvent("download_clicked", activeTool, { action: "output" });
  toast.success(`${filename} downloaded.`);
}

function JsonDiagnostic({ input, issue, isValid }: { input: string; issue?: string; isValid?: boolean }) {
  const metrics = getMetrics(input);
  return <div className={`tool-status ${issue ? "has-error" : isValid ? "is-valid" : ""}`} role={issue ? "alert" : "status"}>
    <span className="status-message">{issue ? <><CircleAlert size={15} />{issue}</> : isValid ? <><Check size={15} />Valid JSON</> : <><Info size={15} />Paste JSON or load an example</>}</span>
    <span>{metrics.characters.toLocaleString()} chars</span><span>{metrics.lines.toLocaleString()} lines</span><span>{metrics.fileSize}</span>
  </div>;
}

function ToolLayout({ tool, children, status }: { tool: ToolDefinition; children: React.ReactNode; status?: React.ReactNode }) {
  const Icon = tool.icon;
  return <AppShell>
    <DocumentHead tool={tool} />
    <article className="tool-page">
      <nav className="tool-route-context" aria-label="Tool hierarchy"><Link href="/#tools" onClick={() => trackEvent("tool_navigation_clicked", { tool_slug: tool.slug, tool_category: tool.category, source: "tool_context" })}>UTILITY INVENTORY</Link><span aria-hidden="true">/</span><span>{tool.name.toUpperCase()}</span></nav>
      <header className="tool-heading"><div className="tool-heading-icon"><Icon size={25} /></div><div><p className="eyebrow">{tool.category}</p><h1>{tool.name}</h1><p>{tool.description}</p></div><div className="tool-local-note"><ShieldCheck size={16} /><span>Processed locally<br />No account required</span></div></header>
      {children}
      {status}
      <AdSlot label="Reserved placement · below primary workspace" />
      <ToolHelp tool={tool} />
    </article>
  </AppShell>;
}

function ToolHelp({ tool }: { tool: ToolDefinition }) {
  return <section className="tool-help" aria-labelledby="tool-help-title">
    <div className="help-main"><p className="eyebrow">Tool notes / quick reference</p><h2 id="tool-help-title">How to use {tool.name}</h2><p>{tool.help.what}</p><ol className="help-steps">{tool.help.steps.map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol><div className="help-protocol"><div><b>Best for</b><span>{tool.help.bestFor}</span></div><div><b>Data handling</b><span>Text you paste or load from a local file stays in browser memory; this tool does not upload it to perform the transformation.</span></div><div><b>Boundary</b><span>{tool.help.caution}</span></div></div><p className="reference-id">COMMAND / {tool.slug.toUpperCase()} · EXECUTION / BROWSER</p><div className="use-case-list">{tool.help.useCases.map((item) => <span key={item}>USE / {item}</span>)}</div></div>
    <div className="faq-block" aria-labelledby="tool-faq-title"><p className="eyebrow">Constraints & processing</p><h2 id="tool-faq-title">{tool.name} FAQs</h2><div className="faq-list">{tool.help.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div></div>
    <aside className="related-tools"><p className="eyebrow">Adjacent commands</p><h2>Continue the workflow</h2><p className="related-tools-intro">Use the next utility when your current task needs a related format, check, or comparison.</p>{tool.related.map((slug) => { const related = toolBySlug[slug]; const Icon = related.icon; return <Link key={slug} href={`/${slug}`} aria-label={`Open ${related.name}`} onClick={() => trackToolEvent("related_tool_clicked", tool, { destination_slug: slug, source: "related_tools" })}><Icon size={15} />{related.name}<ArrowRight size={14} /></Link>; })}</aside>
  </section>;
}

function JsonTool({ tool, type }: { tool: ToolDefinition; type: "format" | "validate" | "minify" }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");
  const [issue, setIssue] = useState("");
  const live = useMemo(() => input.trim() ? parseJson(input) : null, [input]);

  function run() {
    trackToolEvent("tool_execute", tool, { action: type });
    const parsed = parseJson(input);
    if (!parsed.ok) { trackToolEvent("tool_error", tool, { action: type, error_kind: "syntax" }); setIssue(formatJsonIssue(parsed.issue)); setOutput(""); return; }
    setIssue("");
    setOutput(type === "minify" ? minifyJson(parsed.value) : formatJson(parsed.value, indent));
    trackToolEvent("tool_success", tool, { action: type });
    toast.success(type === "validate" ? "Valid JSON." : `${type === "format" ? "JSON formatted" : "JSON minified"}.`);
  }

  const action = type === "format" ? "Format JSON" : type === "validate" ? "Validate JSON" : "Minify JSON";
  const loadExample = () => { setInput(examples.json); setOutput(""); setIssue(""); };
  const clearWorkspace = () => { setInput(""); setOutput(""); setIssue(""); };
  return <ToolLayout tool={tool} status={<JsonDiagnostic input={input} issue={issue} isValid={Boolean(live?.ok && !issue)} />}>
    <CommandStrip label={tool.name} primary={{ label: action, onSelect: run }} controls={type === "format" ? <><span className="command-strip-label">Indent</span><div className="segmented" role="group" aria-label="JSON indentation">{(["2", "4", "tab"] as const).map((item) => <button type="button" key={item} className={indent === item ? "is-selected" : ""} onClick={() => setIndent(item)}>{item === "tab" ? "Tabs" : `${item} spaces`}</button>)}</div></> : undefined} outputActions={[{ id: "copy", label: "Copy", kind: "copy", onSelect: () => copyText(output, tool.outputLabel), disabled: !output }, { id: "download", label: "Download", kind: "download", onSelect: () => downloadText(output, type === "minify" ? "minified.json" : type === "validate" ? "validated.json" : "formatted.json", "application/json;charset=utf-8"), disabled: !output }]} utilityActions={[{ id: "example", label: "Load example", kind: "example", onSelect: loadExample }, { id: "clear", label: "Clear workspace", kind: "clear", onSelect: clearWorkspace }]} />
    <div className="workspace-grid"><EditorPane label="Input JSON" value={input} onChange={setInput} onPrimary={run} primaryLabel={action} showPrimaryAction={false} showUtilityActions={false} onClear={clearWorkspace} onLoadExample={loadExample} exampleLabel="Load JSON" placeholder={'Paste JSON here…\n\nExample:\n{\n  "name": "Alice",\n  "role": "developer"\n}'} language="json" fileName="input.json" /><OutputPane label={tool.outputLabel} value={output} onCopy={() => copyText(output, tool.outputLabel)} onDownload={() => downloadText(output, type === "minify" ? "minified.json" : type === "validate" ? "validated.json" : "formatted.json", "application/json;charset=utf-8")} showActions={false} emptyMessage={type === "validate" ? "Validate a document to see a normalized preview." : "Run the tool to see output here."} language="json" fileName={type === "minify" ? "minified.json" : type === "validate" ? "validated.json" : "formatted.json"} /></div>
  </ToolLayout>;
}

function ConverterTool({ tool, type }: { tool: ToolDefinition; type: "csv" | "yaml" }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [issue, setIssue] = useState("");
  const live = useMemo(() => input.trim() ? parseJson(input) : null, [input]);
  const isCsv = type === "csv";
  const loadExample = () => { setInput(isCsv ? examples.records : examples.json); setOutput(""); setIssue(""); };
  const clearWorkspace = () => { setInput(""); setOutput(""); setIssue(""); };
  function run() {
    const action = isCsv ? "csv" : "yaml";
    trackToolEvent("tool_execute", tool, { action });
    const parsed = parseJson(input);
    if (!parsed.ok) { trackToolEvent("tool_error", tool, { action, error_kind: "syntax" }); setIssue(formatJsonIssue(parsed.issue)); setOutput(""); return; }
    setIssue("");
    const next = isCsv ? jsonToCsv(parsed.value) : jsonToYaml(parsed.value);
    setOutput(next);
    trackToolEvent("tool_success", tool, { action });
    toast.success(`Converted JSON to ${isCsv ? "CSV" : "YAML"}.`);
  }
  return <ToolLayout tool={tool} status={<JsonDiagnostic input={input} issue={issue} isValid={Boolean(live?.ok && !issue)} />}>
    <CommandStrip label={tool.name} primary={{ label: `Convert to ${isCsv ? "CSV" : "YAML"}`, onSelect: run }} controls={<span className="command-strip-note">{isCsv ? "Nested fields use dot paths." : "Ambiguous YAML strings remain quoted."}</span>} outputActions={[{ id: "copy", label: "Copy", kind: "copy", onSelect: () => copyText(output, tool.outputLabel), disabled: !output }, { id: "download", label: "Download", kind: "download", onSelect: () => downloadText(output, isCsv ? "converted.csv" : "converted.yaml", isCsv ? "text/csv;charset=utf-8" : "text/yaml;charset=utf-8"), disabled: !output }]} utilityActions={[{ id: "example", label: "Load example", kind: "example", onSelect: loadExample }, { id: "clear", label: "Clear workspace", kind: "clear", onSelect: clearWorkspace }]} />
    <div className="workspace-grid"><EditorPane label="Input JSON" value={input} onChange={setInput} onPrimary={run} primaryLabel={`Convert to ${isCsv ? "CSV" : "YAML"}`} showPrimaryAction={false} showUtilityActions={false} onClear={clearWorkspace} onLoadExample={loadExample} exampleLabel="Load JSON" placeholder={isCsv ? 'Paste an array of JSON objects here…\n\nExample:\n[\n  { "id": 1, "name": "Ada" }\n]' : 'Paste JSON here…\n\nExample:\n{\n  "service": "devtools"\n}'} language="json" fileName="input.json" /><OutputPane label={tool.outputLabel} value={output} language={isCsv ? "csv" : "yaml"} onCopy={() => copyText(output, tool.outputLabel)} onDownload={() => downloadText(output, isCsv ? "converted.csv" : "converted.yaml", isCsv ? "text/csv;charset=utf-8" : "text/yaml;charset=utf-8")} showActions={false} emptyMessage="Run the conversion to preview output." fileName={isCsv ? "converted.csv" : "converted.yaml"} /></div>
  </ToolLayout>;
}

function JsonSorterTool({ tool }: { tool: ToolDefinition }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [issue, setIssue] = useState("");
  const [order, setOrder] = useState<"ascending" | "descending">("ascending");
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const live = useMemo(() => input.trim() ? parseJson(input) : null, [input]);
  function run() {
    trackToolEvent("tool_execute", tool, { action: "sort" });
    if (!input.trim()) { trackToolEvent("tool_error", tool, { action: "sort", error_kind: "empty" }); setIssue("Paste JSON before sorting keys."); setOutput(""); return; }
    const parsed = parseJson(input);
    if (!parsed.ok) { trackToolEvent("tool_error", tool, { action: "sort", error_kind: "syntax" }); setIssue(formatJsonIssue(parsed.issue)); setOutput(""); return; }
    setOutput(formatJson(sortJsonKeys(parsed.value, { order, caseInsensitive }))); setIssue(""); trackToolEvent("tool_success", tool, { action: "sort" }); toast.success("JSON object keys sorted locally.");
  }
  const resetOutputFor = (apply: () => void) => { apply(); setOutput(""); };
  const loadExample = () => { setInput('{\n  "zebra": { "z": 1, "a": 2 },\n  "Apple": true,\n  "items": ["keep", "this", "order"]\n}'); setOutput(""); setIssue(""); };
  const clearWorkspace = () => { setInput(""); setOutput(""); setIssue(""); };
  return <ToolLayout tool={tool} status={<JsonDiagnostic input={input} issue={issue} isValid={Boolean(live?.ok && !issue)} />}>
    <CommandStrip label={tool.name} primary={{ label: "Sort keys", onSelect: run }} controls={<><span className="command-strip-label">Order</span><div className="segmented" role="group" aria-label="JSON object key order"><button type="button" className={order === "ascending" ? "is-selected" : ""} onClick={() => resetOutputFor(() => setOrder("ascending"))}>A → Z</button><button type="button" className={order === "descending" ? "is-selected" : ""} onClick={() => resetOutputFor(() => setOrder("descending"))}>Z → A</button></div><label className="check-control"><input type="checkbox" checked={caseInsensitive} onChange={(event) => resetOutputFor(() => setCaseInsensitive(event.target.checked))} />Ignore case</label></>} outputActions={[{ id: "copy", label: "Copy", kind: "copy", onSelect: () => copyText(output, tool.outputLabel), disabled: !output }, { id: "download", label: "Download", kind: "download", onSelect: () => downloadText(output, "sorted.json", "application/json;charset=utf-8"), disabled: !output }]} utilityActions={[{ id: "example", label: "Load example", kind: "example", onSelect: loadExample }, { id: "clear", label: "Clear workspace", kind: "clear", onSelect: clearWorkspace }]} />
    <div className="workspace-grid"><EditorPane label="Input JSON" value={input} onChange={setInput} onPrimary={run} primaryLabel="Sort keys" showPrimaryAction={false} showUtilityActions={false} onClear={clearWorkspace} onLoadExample={loadExample} exampleLabel="Load JSON" placeholder={'Paste JSON here…\n\nExample:\n{\n  "z": 1,\n  "a": 2\n}'} language="json" fileName="input.json" /><OutputPane label={tool.outputLabel} value={output} language="json" onCopy={() => copyText(output, tool.outputLabel)} onDownload={() => downloadText(output, "sorted.json", "application/json;charset=utf-8")} showActions={false} emptyMessage="Sort valid JSON to normalize object key order." fileName="sorted.json" /></div>
  </ToolLayout>;
}

function JsonModelTool({ tool, type }: { tool: ToolDefinition; type: "typescript" | "schema" }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [issue, setIssue] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [declarationStyle, setDeclarationStyle] = useState<"interface" | "type">("interface");
  const [exportDeclarations, setExportDeclarations] = useState(true);
  const [requiredFields, setRequiredFields] = useState<"all" | "none">("all");
  const live = useMemo(() => input.trim() ? parseJson(input) : null, [input]);
  const isTypeScript = type === "typescript";
  function run() {
    const action = isTypeScript ? "typescript" : "schema";
    trackToolEvent("tool_execute", tool, { action });
    if (!input.trim()) { trackToolEvent("tool_error", tool, { action, error_kind: "empty" }); setIssue(`Paste JSON before ${isTypeScript ? "generating TypeScript declarations" : "generating a schema"}.`); setOutput(""); return; }
    const parsed = parseJson(input);
    if (!parsed.ok) { trackToolEvent("tool_error", tool, { action, error_kind: "syntax" }); setIssue(formatJsonIssue(parsed.issue)); setOutput(""); return; }
    const next = isTypeScript
      ? jsonToTypeScript(parsed.value, { rootName, declarationStyle, exportDeclarations })
      : formatJson(inferJsonSchema(parsed.value, { title: rootName, requiredFields }));
    setOutput(next); setIssue(""); trackToolEvent("tool_success", tool, { action }); toast.success(isTypeScript ? "TypeScript declarations generated locally." : "JSON Schema generated locally.");
  }
  const clearGenerated = (apply: () => void) => { apply(); setOutput(""); };
  const loadExample = () => { setInput('{\n  "id": 42,\n  "displayName": "Ada",\n  "active": true,\n  "profile": {\n    "team": "platform",\n    "timezone": "UTC"\n  },\n  "tags": ["typescript", "json"]\n}'); setOutput(""); setIssue(""); };
  return <ToolLayout tool={tool} status={<JsonDiagnostic input={input} issue={issue} isValid={Boolean(live?.ok && !issue)} />}>
    <CommandStrip label={tool.name} primary={{ label: tool.primaryAction, onSelect: run }} controls={<><label className="inline-field"><span>{isTypeScript ? "Root" : "Title"}</span><input value={rootName} onChange={(event) => clearGenerated(() => setRootName(event.target.value))} aria-label={isTypeScript ? "Root TypeScript declaration name" : "JSON Schema title"} placeholder="Root" /></label>{isTypeScript ? <><div className="segmented" role="group" aria-label="TypeScript declaration style"><button type="button" className={declarationStyle === "interface" ? "is-selected" : ""} onClick={() => clearGenerated(() => setDeclarationStyle("interface"))}>Interface</button><button type="button" className={declarationStyle === "type" ? "is-selected" : ""} onClick={() => clearGenerated(() => setDeclarationStyle("type"))}>Type alias</button></div><label className="check-control"><input type="checkbox" checked={exportDeclarations} onChange={(event) => clearGenerated(() => setExportDeclarations(event.target.checked))} />Export</label></> : <div className="segmented" role="group" aria-label="JSON Schema required fields policy"><button type="button" className={requiredFields === "all" ? "is-selected" : ""} onClick={() => clearGenerated(() => setRequiredFields("all"))}>Required</button><button type="button" className={requiredFields === "none" ? "is-selected" : ""} onClick={() => clearGenerated(() => setRequiredFields("none"))}>Optional</button></div>}</>} outputActions={[{ id: "copy", label: "Copy", kind: "copy", onSelect: () => copyText(output, tool.outputLabel), disabled: !output }, { id: "download", label: "Download", kind: "download", onSelect: () => downloadText(output, isTypeScript ? "generated-types.ts" : "generated.schema.json", isTypeScript ? "text/typescript;charset=utf-8" : "application/schema+json;charset=utf-8"), disabled: !output }]} utilityActions={[{ id: "example", label: "Load example", kind: "example", onSelect: loadExample }, { id: "clear", label: "Clear workspace", kind: "clear", onSelect: () => { setInput(""); setOutput(""); setIssue(""); } }]} />
    <div className="workspace-grid"><EditorPane label="Input JSON" value={input} onChange={setInput} onPrimary={run} primaryLabel={tool.primaryAction} showPrimaryAction={false} showUtilityActions={false} onClear={() => { setInput(""); setOutput(""); setIssue(""); }} onLoadExample={loadExample} exampleLabel="Load JSON" placeholder={'Paste a JSON example here…\n\nExample:\n{\n  "id": 42,\n  "active": true\n}'} language="json" fileName="input.json" /><OutputPane label={tool.outputLabel} value={output} language={isTypeScript ? "typescript" : "json"} onCopy={() => copyText(output, tool.outputLabel)} onDownload={() => downloadText(output, isTypeScript ? "generated-types.ts" : "generated.schema.json", isTypeScript ? "text/typescript;charset=utf-8" : "application/schema+json;charset=utf-8")} showActions={false} emptyMessage={isTypeScript ? "Generate declarations from a valid JSON example." : "Generate a schema from a valid JSON example."} fileName={isTypeScript ? "generated-types.ts" : "generated.schema.json"} /></div>
  </ToolLayout>;
}

function DiffResult({ entries, onCopy, onDownload, showActions = true }: { entries: DiffEntry[]; onCopy: () => void; onDownload: () => void; showActions?: boolean }) {
  const summary = { added: entries.filter((entry) => entry.kind === "added").length, removed: entries.filter((entry) => entry.kind === "removed").length, changed: entries.filter((entry) => entry.kind === "changed").length };
  return <section className="diff-results" aria-live="polite"><header><div><span className="editor-dot" />Structural changes</div>{showActions && <div className="editor-actions"><button type="button" className="editor-action" onClick={onCopy} disabled={!entries.length}><Clipboard size={14} /> Copy</button><button type="button" className="editor-action" onClick={onDownload} disabled={!entries.length}><Download size={14} /> Download</button></div>}</header>{entries.length ? <><div className="diff-summary"><span className="added">+ {summary.added} added</span><span className="removed">− {summary.removed} removed</span><span className="changed">~ {summary.changed} changed</span></div><div className="diff-list">{entries.map((entry, index) => <div className={`diff-row ${entry.kind}`} key={`${entry.path}-${index}`}><span>{entry.kind === "added" ? "+" : entry.kind === "removed" ? "−" : "~"}</span><code>{entry.path}</code><p>{entry.kind === "changed" ? <><del>{JSON.stringify(entry.before)}</del><ins>{JSON.stringify(entry.after)}</ins></> : <>{entry.kind === "added" ? JSON.stringify(entry.after) : JSON.stringify(entry.before)}</>}</p></div>)}</div></> : <div className="diff-empty"><GitCompareArrows size={20} />Compare two valid JSON documents to view structural changes.</div>}</section>;
}

function JsonDiffTool({ tool }: { tool: ToolDefinition }) {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [entries, setEntries] = useState<DiffEntry[]>([]);
  const [issue, setIssue] = useState("");
  function run() {
    trackToolEvent("tool_execute", tool, { action: "compare" });
    const a = parseJson(left); const b = parseJson(right);
    if (!a.ok) { trackToolEvent("tool_error", tool, { action: "compare", error_kind: "syntax" }); setIssue(`JSON A: ${formatJsonIssue(a.issue)}`); setEntries([]); return; }
    if (!b.ok) { trackToolEvent("tool_error", tool, { action: "compare", error_kind: "syntax" }); setIssue(`JSON B: ${formatJsonIssue(b.issue)}`); setEntries([]); return; }
    const next = diffJson(a.value, b.value); setEntries(next); setIssue(""); trackToolEvent("tool_success", tool, { action: "compare" }); toast.success(next.length ? `${next.length} structural change${next.length === 1 ? "" : "s"} found.` : "The documents are structurally identical.");
  }
  const serialised = JSON.stringify(entries, null, 2);
  const loadExamples = () => { setLeft(examples.before); setRight(examples.after); setEntries([]); setIssue(""); };
  const clearWorkspace = () => { setLeft(""); setRight(""); setEntries([]); setIssue(""); };
  return <ToolLayout tool={tool} status={<div className={`tool-status ${issue ? "has-error" : entries.length ? "is-valid" : ""}`} role={issue ? "alert" : "status"}><span className="status-message">{issue ? <><CircleAlert size={15} />{issue}</> : entries.length ? <><Check size={15} />Comparison complete</> : <><Info size={15} />Use valid JSON documents on both sides</>}</span><span>JSON A · {getMetrics(left).fileSize}</span><span>JSON B · {getMetrics(right).fileSize}</span></div>}>
    <CommandStrip label={tool.name} primary={{ label: "Compare JSON", onSelect: run }} controls={<span className="command-strip-note">Compare normalized JSON structure, not raw whitespace.</span>} outputActions={[{ id: "copy", label: "Copy report", kind: "copy", onSelect: () => copyText(serialised, "Diff report"), disabled: !entries.length }, { id: "download", label: "Download report", kind: "download", onSelect: () => downloadText(serialised, "json-diff.json", "application/json;charset=utf-8"), disabled: !entries.length }]} utilityActions={[{ id: "example", label: "Load paired example", kind: "example", onSelect: loadExamples }, { id: "clear", label: "Clear both inputs", kind: "clear", onSelect: clearWorkspace }]} />
    <div className="workspace-grid diff-editor-grid"><EditorPane label="JSON A" value={left} onChange={setLeft} onPrimary={run} showPrimaryAction={false} showUtilityActions={false} onClear={clearWorkspace} onLoadExample={loadExamples} exampleLabel="Load before" compact placeholder={'Paste original JSON here…\n\nExample:\n{\n  "version": 1\n}'} language="json" fileName="before.json" /><EditorPane label="JSON B" value={right} onChange={setRight} onPrimary={run} showPrimaryAction={false} showUtilityActions={false} onClear={clearWorkspace} onLoadExample={loadExamples} exampleLabel="Load after" compact placeholder={'Paste changed JSON here…\n\nExample:\n{\n  "version": 2\n}'} language="json" fileName="after.json" /></div>
    <DiffResult entries={entries} onCopy={() => copyText(serialised, "Diff report")} onDownload={() => downloadText(serialised, "json-diff.json", "application/json;charset=utf-8")} showActions={false} />
  </ToolLayout>;
}

function JwtTool({ tool }: { tool: ToolDefinition }) {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [timestamps, setTimestamps] = useState<Array<{ name: string; value: string }>>([]);
  const [issue, setIssue] = useState("");
  const [activeTab, setActiveTab] = useState("header");
  function run() {
    trackToolEvent("tool_execute", tool, { action: "decode" });
    if (!input.trim()) { trackToolEvent("tool_error", tool, { action: "decode", error_kind: "empty" }); setIssue("Paste a JWT to decode it."); setHeader(""); setPayload(""); return; }
    try { const decoded = decodeJwt(input); setHeader(JSON.stringify(decoded.header, null, 2)); setPayload(JSON.stringify(decoded.payload, null, 2)); setTimestamps(decoded.timestamps); setIssue(""); trackToolEvent("tool_success", tool, { action: "decode" }); toast.success("JWT header and payload decoded locally."); } catch (error) { trackToolEvent("tool_error", tool, { action: "decode", error_kind: "invalid_token" }); setIssue(error instanceof Error ? error.message : "Unable to decode this JWT."); setHeader(""); setPayload(""); setTimestamps([]); }
  }
  const fullOutput = header && payload ? `HEADER\n${header}\n\nPAYLOAD\n${payload}` : "";
  const activeOutput = activeTab === "payload" ? payload : header;
  const activeFilename = activeTab === "payload" ? "payload.json" : "header.json";
  const loadExample = () => { setInput(examples.jwt); setHeader(""); setPayload(""); setIssue(""); setTimestamps([]); };
  const clearWorkspace = () => { setInput(""); setHeader(""); setPayload(""); setIssue(""); setTimestamps([]); };
  return <ToolLayout tool={tool} status={<div className={`tool-status ${issue ? "has-error" : header ? "is-valid" : ""}`} role={issue ? "alert" : "status"}><span className="status-message">{issue ? <><CircleAlert size={15} />{issue}</> : header ? <><Check size={15} />Token segments decoded</> : <><Info size={15} />Awaiting token input</>}</span><span>3 segments required</span><span>Signature not verified</span></div>}>
    <div className="security-warning"><AlertTriangle size={16} /><p><strong>Decoding is not verification.</strong> This tool reads Base64URL content only; it does not validate the token signature, issuer, audience, or trustworthiness.</p></div>
    <CommandStrip label={tool.name} primary={{ label: "Decode JWT", onSelect: run }} controls={<span className="command-strip-note">Decode only; signature verification is not performed.</span>} outputActions={[{ id: "copy", label: `Copy ${activeTab}`, kind: "copy", onSelect: () => copyText(activeOutput, activeTab === "payload" ? "JWT payload" : "JWT header"), disabled: !activeOutput }, { id: "download", label: "Download", kind: "download", onSelect: () => downloadText(activeOutput, activeFilename, "application/json;charset=utf-8"), disabled: !activeOutput }]} utilityActions={[{ id: "example", label: "Load token example", kind: "example", onSelect: loadExample }, { id: "clear", label: "Clear workspace", kind: "clear", onSelect: clearWorkspace }]} />
    <div className="jwt-workspace"><EditorPane label="Encoded JWT" value={input} onChange={setInput} onPrimary={run} primaryLabel="Decode JWT" showPrimaryAction={false} showUtilityActions={false} onClear={clearWorkspace} onLoadExample={loadExample} exampleLabel="Load token" placeholder="Paste a JWT here…\n\nExample: three Base64URL segments separated by dots" language="text" fileName="token.jwt" /><div className="jwt-output-stack"><OutputPane label="Decoded token" value={activeOutput} language="json" onCopy={() => copyText(activeOutput, activeTab === "payload" ? "JWT payload" : "JWT header")} onDownload={() => downloadText(activeOutput, activeFilename, "application/json;charset=utf-8")} showActions={false} emptyMessage="Decode a JWT to inspect header and payload fields." fileName={activeFilename} tabs={[{ id: "header", label: "header.json", value: header, language: "json", fileName: "header.json" }, { id: "payload", label: "payload.json", value: payload, language: "json", fileName: "payload.json" }]} activeTabId={activeTab} onTabChange={setActiveTab} />{timestamps.length > 0 && <div className="timestamp-table"><p>READABLE TIMESTAMPS</p>{timestamps.map((item) => <span key={item.name}><b>{item.name}</b>{item.value}</span>)}</div>}</div></div>
  </ToolLayout>;
}

function Base64Tool({ tool }: { tool: ToolDefinition }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [issue, setIssue] = useState("");
  function run() {
    trackToolEvent("tool_execute", tool, { action: mode });
    if (!input) { trackToolEvent("tool_error", tool, { action: mode, error_kind: "empty" }); setIssue(`Enter text to ${mode}.`); setOutput(""); return; }
    try { setOutput(mode === "encode" ? encodeBase64Utf8(input, urlSafe) : decodeBase64Utf8(input)); setIssue(""); trackToolEvent("tool_success", tool, { action: mode }); toast.success(`Base64 ${mode === "encode" ? "encoded" : "decoded"} locally.`); } catch (error) { trackToolEvent("tool_error", tool, { action: mode, error_kind: "invalid_input" }); setIssue(error instanceof Error ? error.message : "The input could not be decoded."); setOutput(""); }
  }
  const loadExample = () => { setInput(mode === "encode" ? examples.text : examples.base64); setOutput(""); setIssue(""); };
  const clearWorkspace = () => { setInput(""); setOutput(""); setIssue(""); };
  return <ToolLayout tool={tool} status={<div className={`tool-status ${issue ? "has-error" : output ? "is-valid" : ""}`} role={issue ? "alert" : "status"}><span className="status-message">{issue ? <><CircleAlert size={15} />{issue}</> : output ? <><Check size={15} />Conversion complete</> : <><Info size={15} />Select a direction and run the conversion</>}</span><span>UTF-8 text</span><span>URL-safe supported</span></div>}>
    <CommandStrip label={tool.name} primary={{ label: mode === "encode" ? "Encode" : "Decode", onSelect: run }} controls={<><div className="segmented" role="group" aria-label="Base64 conversion direction"><button type="button" className={mode === "encode" ? "is-selected" : ""} onClick={() => setMode("encode")}>Encode</button><button type="button" className={mode === "decode" ? "is-selected" : ""} onClick={() => setMode("decode")}>Decode</button></div><label className="check-control"><input type="checkbox" checked={urlSafe} onChange={(event) => setUrlSafe(event.target.checked)} disabled={mode === "decode"} />URL-safe</label></>} outputActions={[{ id: "copy", label: "Copy", kind: "copy", onSelect: () => copyText(output, "Conversion output"), disabled: !output }, { id: "download", label: "Download", kind: "download", onSelect: () => downloadText(output, mode === "encode" ? "base64.txt" : "decoded.txt"), disabled: !output }]} utilityActions={[{ id: "example", label: "Load example", kind: "example", onSelect: loadExample }, { id: "clear", label: "Clear workspace", kind: "clear", onSelect: clearWorkspace }]} />
    <div className="workspace-grid"><EditorPane label={mode === "encode" ? "Plain UTF-8 text" : "Base64 input"} value={input} onChange={setInput} onPrimary={run} primaryLabel={mode === "encode" ? "Encode" : "Decode"} showPrimaryAction={false} showUtilityActions={false} onClear={clearWorkspace} onLoadExample={loadExample} exampleLabel="Load example" placeholder={mode === "encode" ? "Paste text to encode…\n\nExample: Hello, developer!" : "Paste Base64 here…\n\nExample: SGVsbG8sIGRldmVsb3BlciE="} language="text" fileName={mode === "encode" ? "input.txt" : "input.base64"} /><OutputPane label={tool.outputLabel} value={output} language="text" onCopy={() => copyText(output, "Conversion output")} onDownload={() => downloadText(output, mode === "encode" ? "base64.txt" : "decoded.txt")} showActions={false} emptyMessage="Run the conversion to see output here." fileName={mode === "encode" ? "output.base64" : "decoded.txt"} /></div>
  </ToolLayout>;
}

export default function ToolRoute({ slug }: { slug: string }) {
  if (!isToolSlug(slug)) return <NotFound />;
  const tool = toolBySlug[slug];
  if (slug === "json-formatter") return <JsonTool tool={tool} type="format" />;
  if (slug === "json-validator") return <JsonTool tool={tool} type="validate" />;
  if (slug === "json-minifier") return <JsonTool tool={tool} type="minify" />;
  if (slug === "json-diff") return <JsonDiffTool tool={tool} />;
  if (slug === "json-to-csv") return <ConverterTool tool={tool} type="csv" />;
  if (slug === "json-to-yaml") return <ConverterTool tool={tool} type="yaml" />;
  if (slug === "json-sorter") return <JsonSorterTool tool={tool} />;
  if (slug === "json-to-typescript") return <JsonModelTool tool={tool} type="typescript" />;
  if (slug === "json-schema-generator") return <JsonModelTool tool={tool} type="schema" />;
  if (slug === "jwt-decoder") return <JwtTool tool={tool} />;
  return <Base64Tool tool={tool} />;
}
