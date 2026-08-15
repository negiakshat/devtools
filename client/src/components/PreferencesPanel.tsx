import { RotateCcw, Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWorkspacePreferences } from "@/contexts/WorkspacePreferences";

// Personalized Workbench: a compact configuration panel for deliberate workspace choices, never a standalone settings destination.

type Choice = { value: string; label: string };

function PreferenceChoices({ label, description, value, choices, onSelect }: { label: string; description: string; value: string; choices: Choice[]; onSelect: (value: string) => void }) {
  return <div className="preference-row">
    <div className="preference-copy"><strong>{label}</strong><p>{description}</p></div>
    <div className="preference-choices" role="group" aria-label={label}>
      {choices.map((choice) => <button key={choice.value} type="button" className={value === choice.value ? "is-selected" : ""} aria-pressed={value === choice.value} onClick={() => onSelect(choice.value)}>{choice.label}</button>)}
    </div>
  </div>;
}

export function PreferencesPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { preferences, updatePreferences, resetPreferences } = useWorkspacePreferences();

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="preferences-dialog">
      <DialogHeader className="preferences-header">
        <div className="preferences-heading-mark"><Settings2 size={17} aria-hidden="true" /></div>
        <div><DialogTitle>Workspace preferences</DialogTitle><DialogDescription>Configure this browser-local workbench. Changes apply immediately.</DialogDescription></div>
      </DialogHeader>
      <div className="preferences-scroll">
        <section className="preference-section" aria-labelledby="appearance-preferences"><div className="preference-section-heading"><span id="appearance-preferences">Appearance</span><small>WORKBENCH</small></div>
          <PreferenceChoices label="Theme" description="Choose a calibrated developer palette." value={preferences.theme} choices={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }, { value: "system", label: "System" }]} onSelect={(theme) => updatePreferences({ theme: theme as typeof preferences.theme })} />
          <PreferenceChoices label="UI scale" description="Scale controls without changing browser zoom." value={String(preferences.scale)} choices={[90, 100, 110, 120].map((scale) => ({ value: String(scale), label: `${scale}%` }))} onSelect={(scale) => updatePreferences({ scale: Number(scale) as typeof preferences.scale })} />
          <PreferenceChoices label="Density" description="Compact is tuned for information-rich work." value={preferences.density} choices={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfort" }]} onSelect={(density) => updatePreferences({ density: density as typeof preferences.density })} />
          <PreferenceChoices label="Accent intensity" description="Keep semantic status color distinct and legible." value={preferences.accent} choices={[{ value: "standard", label: "Standard" }, { value: "subtle", label: "Subtle" }]} onSelect={(accent) => updatePreferences({ accent: accent as typeof preferences.accent })} />
        </section>
        <section className="preference-section" aria-labelledby="editor-preferences"><div className="preference-section-heading"><span id="editor-preferences">Editor</span><small>CODE SURFACE</small></div>
          <PreferenceChoices label="Editor font" description="Only changes code and data surfaces." value={String(preferences.editorFontSize)} choices={[12, 13, 14, 15, 16, 18].map((size) => ({ value: String(size), label: `${size}px` }))} onSelect={(editorFontSize) => updatePreferences({ editorFontSize: Number(editorFontSize) as typeof preferences.editorFontSize })} />
          <PreferenceChoices label="Word wrap" description="Keep JSON structure visible, or wrap long values." value={preferences.wordWrap ? "on" : "off"} choices={[{ value: "off", label: "Off" }, { value: "on", label: "On" }]} onSelect={(wordWrap) => updatePreferences({ wordWrap: wordWrap === "on" })} />
          <PreferenceChoices label="Sidebar" description="Collapsed mode keeps desktop tools one click away." value={preferences.sidebarCollapsed ? "collapsed" : "expanded"} choices={[{ value: "expanded", label: "Expanded" }, { value: "collapsed", label: "Collapsed" }]} onSelect={(sidebar) => updatePreferences({ sidebarCollapsed: sidebar === "collapsed" })} />
        </section>
        <section className="preference-section" aria-labelledby="motion-preferences"><div className="preference-section-heading"><span id="motion-preferences">Motion</span><small>INTERACTION</small></div>
          <PreferenceChoices label="Motion preference" description="System follows your operating-system motion setting." value={preferences.motion} choices={[{ value: "system", label: "System" }, { value: "full", label: "Full" }, { value: "reduced", label: "Reduced" }]} onSelect={(motion) => updatePreferences({ motion: motion as typeof preferences.motion })} />
        </section>
      </div>
      <div className="preferences-footer"><span>LOCAL · PERSISTENT</span><button type="button" className="reset-preferences" onClick={resetPreferences}><RotateCcw size={13} />Reset preferences</button></div>
    </DialogContent>
  </Dialog>;
}
