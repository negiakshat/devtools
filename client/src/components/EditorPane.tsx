/** Precision Console IDE reminder: use real editor primitives, restrained syntax color, and compact diagnostics—never decorative fake code. */
import { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { javascript } from "@codemirror/lang-javascript";
import { tags } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { Check, Clipboard, FileDown, FolderOpen, RotateCcw, X } from "lucide-react";
import { useWorkspacePreferences } from "@/contexts/WorkspacePreferences";
import { getMetrics } from "@/lib/transforms";

// Precision Console: CodeMirror is the first-class work surface—quiet, high-contrast, keyboard-led, and diagnostic.

export type EditorLanguage = "json" | "yaml" | "typescript" | "csv" | "text";

interface EditorPaneProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onPrimary?: () => void;
  primaryLabel?: string;
  onClear?: () => void;
  onLoadExample?: () => void;
  exampleLabel?: string;
  onLoadLocalFile?: (contents: string, filename: string) => void;
  accept?: string;
  compact?: boolean;
  showPrimaryAction?: boolean;
  showUtilityActions?: boolean;
  language?: EditorLanguage;
  fileName?: string;
}

interface OutputPaneProps {
  label: string;
  value: string;
  language?: EditorLanguage;
  onCopy: () => void;
  onDownload: () => void;
  emptyMessage?: string;
  compact?: boolean;
  fileName?: string;
  tabs?: Array<{ id: string; label: string; value: string; language?: EditorLanguage; fileName?: string }>;
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  showActions?: boolean;
}

type CursorPosition = { line: number; column: number; selection: number };

function precisionConsoleTheme(theme: "dark" | "light", fontSize: number) {
  return EditorView.theme(
  {
    "&": { height: "100%", backgroundColor: "var(--editor-surface)", color: "var(--editor-foreground)" },
    ".cm-scroller": { fontFamily: '"Cascadia Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: `${fontSize}px`, lineHeight: "1.65" },
    ".cm-content": { minHeight: "100%", padding: "15px 0 18px", caretColor: "var(--editor-caret)" },
    ".cm-line": { padding: "0 17px" },
    ".cm-gutters": { minHeight: "100%", borderRight: "1px solid var(--editor-gutter-border)", backgroundColor: "var(--editor-gutter)", color: "var(--editor-gutter-foreground)" },
    ".cm-lineNumbers .cm-gutterElement": { minWidth: "40px", padding: "0 10px 0 7px" },
    ".cm-activeLine": { backgroundColor: "var(--editor-active-line)" },
    ".cm-activeLineGutter": { backgroundColor: "var(--editor-active-gutter)", color: "var(--editor-active-gutter-foreground)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "var(--editor-selection)" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--editor-caret)" },
    ".cm-matchingBracket": { backgroundColor: "var(--editor-bracket-background)", color: "var(--editor-foreground)", outline: "1px solid var(--editor-bracket-border)" },
    ".cm-tooltip": { border: "1px solid var(--editor-tooltip-border)", backgroundColor: "var(--editor-tooltip)", color: "var(--editor-foreground)" },
    ".cm-tooltip input": { backgroundColor: "var(--editor-surface)", color: "var(--editor-foreground)", border: "1px solid var(--editor-tooltip-border)" },
    ".cm-searchMatch": { backgroundColor: "var(--editor-search-match)", outline: "1px solid var(--editor-search-border)" },
    ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "var(--editor-search-selected)" },
    ".cm-panels": { backgroundColor: "var(--editor-tooltip)", color: "var(--editor-foreground)" },
  },
  { dark: theme === "dark" },
  );
}

const precisionConsoleHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.propertyName, color: "var(--syntax-property)" },
    { tag: [tags.string, tags.special(tags.string)], color: "var(--syntax-string)" },
    { tag: [tags.number, tags.integer, tags.float], color: "var(--syntax-number)" },
    { tag: [tags.bool, tags.null, tags.keyword], color: "var(--syntax-keyword)" },
    { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "var(--syntax-comment)", fontStyle: "italic" },
    { tag: [tags.variableName, tags.labelName], color: "var(--editor-foreground)" },
    { tag: [tags.operatorKeyword, tags.operator, tags.punctuation], color: "var(--syntax-punctuation)" },
    { tag: [tags.typeName, tags.className], color: "var(--syntax-type)" },
    { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "var(--syntax-function)" },
  ]),
);

function languageExtension(language: EditorLanguage) {
  if (language === "json") return json();
  if (language === "yaml") return yaml();
  if (language === "typescript") return javascript({ typescript: true });
  return [];
}

function defaultFileName(language: EditorLanguage, role: "input" | "output") {
  const stem = role === "input" ? "input" : "output";
  if (language === "json") return `${stem}.json`;
  if (language === "yaml") return `${stem}.yaml`;
  if (language === "typescript") return `${stem}.ts`;
  if (language === "csv") return `${stem}.csv`;
  return `${stem}.txt`;
}

function languageLabel(language: EditorLanguage) {
  if (language === "json") return "JSON";
  if (language === "yaml") return "YAML";
  if (language === "typescript") return "TYPESCRIPT";
  if (language === "csv") return "CSV";
  return "TEXT";
}

function EditorStatus({ value, cursor, readOnly, language }: { value: string; cursor: CursorPosition; readOnly: boolean; language: EditorLanguage }) {
  const metrics = getMetrics(value);
  return <footer className="editor-statusbar" aria-label="Editor status">
    <span>Ln {cursor.line}, Col {cursor.column}</span>{cursor.selection > 0 && <span>Sel {cursor.selection}</span>}<span>UTF-8</span><span>{metrics.characters.toLocaleString()} chars</span><span>{metrics.fileSize}</span><span className={readOnly ? "editor-status-state muted" : "editor-status-state"}>{readOnly ? "READ-ONLY" : value ? `BUFFER · ${languageLabel(language)}` : `BUFFER · EMPTY`}</span>
  </footer>;
}

function CodeSurface({ value, onChange, placeholder, language, readOnly = false, onCursorChange, onPrimary }: { value: string; onChange?: (value: string) => void; placeholder?: string; language: EditorLanguage; readOnly?: boolean; onCursorChange: (cursor: CursorPosition) => void; onPrimary?: () => void }) {
  const { preferences, resolvedTheme } = useWorkspacePreferences();
  const primaryAction = useRef(onPrimary);
  const languageMode = useMemo(() => languageExtension(language), [language]);
  const editorTheme = useMemo(() => precisionConsoleTheme(resolvedTheme, preferences.editorFontSize), [preferences.editorFontSize, resolvedTheme]);
  const extensions = useMemo(() => [
    languageMode,
    editorTheme,
    precisionConsoleHighlight,
    ...(preferences.wordWrap ? [EditorView.lineWrapping] : []),
    keymap.of([
      indentWithTab,
      {
        key: "Mod-Enter",
        run: () => {
          if (!primaryAction.current) return false;
          primaryAction.current();
          return true;
        },
      },
    ]),
  ], [editorTheme, languageMode, preferences.wordWrap]);

  useEffect(() => { primaryAction.current = onPrimary; }, [onPrimary]);

  return <CodeMirror
    value={value}
    height="100%"
    placeholder={placeholder}
    theme={resolvedTheme}
    extensions={extensions}
    editable={!readOnly}
    readOnly={readOnly}
    basicSetup={{ lineNumbers: true, highlightActiveLineGutter: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true, closeBrackets: true, history: true, searchKeymap: true, autocompletion: false }}
    onChange={onChange}
    onUpdate={(update) => {
      if (!update.selectionSet && !update.docChanged) return;
      const position = update.state.selection.main.head;
      const line = update.state.doc.lineAt(position);
      onCursorChange({ line: line.number, column: position - line.from + 1, selection: update.state.selection.main.to - update.state.selection.main.from });
    }}
  />;
}

export function EditorPane({ label, value, onChange, placeholder, onPrimary, primaryLabel, onClear, onLoadExample, exampleLabel = "Load example", onLoadLocalFile, accept = ".txt,.json,.yaml,.yml,.csv,.jwt,.base64,text/plain,application/json,text/yaml,text/csv", compact = false, showPrimaryAction = true, showUtilityActions = true, language = "json", fileName }: EditorPaneProps) {
  const [cursor, setCursor] = useState<CursorPosition>({ line: 1, column: 1, selection: 0 });
  const [sourceFile, setSourceFile] = useState("");
  const [fileFeedback, setFileFeedback] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rows = compact ? "compact" : "standard";

  function readLocalFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => setFileFeedback("Could not read this local file.");
    reader.onload = () => {
      const contents = typeof reader.result === "string" ? reader.result : "";
      onChange(contents);
      onLoadLocalFile?.(contents, file.name);
      setSourceFile(file.name);
      setFileFeedback(`Loaded ${file.name} locally.`);
    };
    reader.readAsText(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    readLocalFile(event.dataTransfer.files[0]);
  }

  return (
    <section className={`editor-shell ide-editor input-editor editor-${rows} ${isDragging ? "is-file-dragging" : ""}`} aria-label={`${label} editor`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
      <header className="editor-topline">
        <div className="editor-tabbar" aria-label={`${label} file tab`}><span className="editor-role">INPUT</span><span className="editor-tab is-active"><i className="editor-file-dot" />{fileName ?? defaultFileName(language, "input")}</span></div>
        <div className="editor-actions">
          {showPrimaryAction && primaryLabel && <span className="shortcut-label">⌘/Ctrl ↵</span>}
          {showPrimaryAction && primaryLabel && <button type="button" className="editor-action primary" onClick={onPrimary}>{primaryLabel}</button>}
          {showUtilityActions && onLoadExample && <button type="button" className="editor-action example-action" onClick={onLoadExample} aria-label={`${exampleLabel} in ${label}`}><RotateCcw size={13} /><span>{exampleLabel}</span></button>}
          <><input ref={fileInputRef} className="visually-hidden" type="file" accept={accept} onChange={(event) => { readLocalFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /><button type="button" className="editor-action icon-action" onClick={() => fileInputRef.current?.click()} aria-label={`Load a local file into ${label}`} title={`Load a local file into ${label}`}><FolderOpen size={14} /><span>File</span></button></>
          {showUtilityActions && onClear && <button type="button" className="editor-action icon-action" onClick={() => { onClear(); setSourceFile(""); setFileFeedback("Input cleared."); }} aria-label={`Clear ${label}`} title={`Clear ${label}`}><X size={14} /><span>Clear</span></button>}
        </div>
      </header>
      <div className="editor-meta"><span className="editor-label"><span className="editor-dot" />{label}{sourceFile && <em className="source-file-badge">LOCAL · {sourceFile}</em>}</span><span>{languageLabel(language)} · Editable</span></div>
      <div className="editor-canvas ide-canvas">
        <CodeSurface value={value} onChange={onChange} placeholder={placeholder} language={language} onCursorChange={setCursor} onPrimary={onPrimary} />
      </div>
      <EditorStatus value={value} cursor={cursor} readOnly={false} language={language} />
      {fileFeedback && <p className="editor-inline-feedback" role="status">{fileFeedback}</p>}
    </section>
  );
}

export function OutputPane({ label, value, language = "json", onCopy, onDownload, emptyMessage = "Run the tool to see output here.", compact = false, fileName, tabs, activeTabId, onTabChange, showActions = true }: OutputPaneProps) {
  const [cursor, setCursor] = useState<CursorPosition>({ line: 1, column: 1, selection: 0 });
  const [copied, setCopied] = useState(false);
  const selectedTab = tabs?.find((tab) => tab.id === activeTabId) ?? tabs?.[0];
  const displayValue = selectedTab?.value ?? value;
  const displayLanguage = selectedTab?.language ?? language;
  const displayFileName = selectedTab?.fileName ?? fileName ?? defaultFileName(displayLanguage, "output");
  const isEmpty = !displayValue;
  const rows = compact ? "compact" : "standard";
  function handleCopy() {
    onCopy();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <section className={`editor-shell ide-editor output-shell output-editor editor-${rows}`} aria-label={`${label} output`}>
      <header className="editor-topline">
        <div className="editor-tabbar" aria-label={`${label} file tabs`}><span className="editor-role">OUTPUT</span>{tabs?.length ? tabs.map((tab) => <button type="button" key={tab.id} className={`editor-tab ${tab.id === selectedTab?.id ? "is-active" : ""}`} onClick={() => onTabChange?.(tab.id)} aria-pressed={tab.id === selectedTab?.id}><i className="editor-file-dot" />{tab.label}</button>) : <span className="editor-tab is-active"><i className="editor-file-dot" />{displayFileName}</span>}</div>
        {showActions && <div className="editor-actions">
          <button type="button" className={`editor-action icon-action ${copied ? "is-copied" : ""}`} onClick={handleCopy} disabled={isEmpty} aria-label={`Copy ${label}`} title={`Copy ${label}`}><Clipboard size={14} /><span>{copied ? "Copied" : "Copy"}</span>{copied && <Check size={13} aria-hidden="true" />}</button>
          <button type="button" className="editor-action icon-action" onClick={onDownload} disabled={isEmpty} aria-label={`Download ${label}`} title={`Download ${label}`}><FileDown size={14} /><span>Download</span></button>
        </div>}
      </header>
      <div className="editor-meta" aria-live="polite"><span className="editor-label"><Check size={13} className="text-[#3ddc84]" />{label}</span><span>{languageLabel(displayLanguage)} · {isEmpty ? "Awaiting run" : "Generated"}</span></div>
      <div className="editor-canvas ide-canvas output-canvas">
        {isEmpty ? <div className="output-empty"><RotateCcw size={18} />{emptyMessage}</div> : <CodeSurface value={displayValue} language={displayLanguage} readOnly onCursorChange={setCursor} />}
      </div>
      <EditorStatus value={displayValue} cursor={cursor} readOnly language={displayLanguage} />
    </section>
  );
}
