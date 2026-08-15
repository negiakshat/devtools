/** Precision Console command grammar: compact, contextual operational controls above every real workbench. */
import type { ReactNode } from "react";
import { Check, ChevronDown, Copy, Download, MoreHorizontal, Play, RotateCcw, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type CommandStripAction = {
  id: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  kind?: "copy" | "download" | "example" | "clear" | "custom";
};

interface CommandStripProps {
  label: string;
  primary: { label: string; onSelect: () => void; disabled?: boolean };
  controls?: ReactNode;
  outputActions?: CommandStripAction[];
  utilityActions?: CommandStripAction[];
  status?: string;
}

function ActionIcon({ kind }: { kind?: CommandStripAction["kind"] }) {
  if (kind === "copy") return <Copy size={14} aria-hidden="true" />;
  if (kind === "download") return <Download size={14} aria-hidden="true" />;
  if (kind === "example") return <RotateCcw size={14} aria-hidden="true" />;
  if (kind === "clear") return <X size={14} aria-hidden="true" />;
  return null;
}

export default function CommandStrip({ label, primary, controls, outputActions = [], utilityActions = [], status }: CommandStripProps) {
  const visibleOutput = outputActions.slice(0, 2);
  const overflow = utilityActions.concat(outputActions.slice(2));

  return <section className="command-strip" aria-label={`${label} commands`}>
    <div className="command-strip-primary">
      <span className="command-strip-label">COMMAND</span>
      <button type="button" className="command-primary" onClick={primary.onSelect} disabled={primary.disabled}>
        <Play size={14} fill="currentColor" aria-hidden="true" />
        <span>{primary.label}</span>
        <kbd>⌘/Ctrl ↵</kbd>
      </button>
      {status && <span className="command-strip-status" aria-live="polite">{status}</span>}
    </div>
    {controls && <div className="command-strip-controls">{controls}</div>}
    {visibleOutput.length > 0 && <div className="command-strip-output" aria-label="Output actions">
      {visibleOutput.map((action) => <button type="button" key={action.id} className="command-secondary" onClick={action.onSelect} disabled={action.disabled} aria-label={action.label}>
        <ActionIcon kind={action.kind} />{action.label}
      </button>)}
    </div>}
    {overflow.length > 0 && <DropdownMenu>
      <DropdownMenuTrigger asChild><button type="button" className="command-overflow" aria-label={`More ${label} commands`}><MoreHorizontal size={16} /><span>More</span><ChevronDown size={12} /></button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="command-menu-content">
        {overflow.map((action) => <DropdownMenuItem key={action.id} onSelect={action.onSelect} disabled={action.disabled} className="command-menu-item"><ActionIcon kind={action.kind} />{action.label}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>}
  </section>;
}
