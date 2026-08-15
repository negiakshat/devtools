import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Personalized Workbench: a local-first IDE configuration layer that preserves the established DEVTOOLS visual language.

export const PREFERENCES_STORAGE_KEY = "devtools-prefs";

export type ThemePreference = "dark" | "light" | "system";
export type UiScale = 90 | 100 | 110 | 120;
export type DensityPreference = "compact" | "comfortable";
export type EditorFontSize = 12 | 13 | 14 | 15 | 16 | 18;
export type MotionPreference = "system" | "full" | "reduced";
export type AccentIntensity = "subtle" | "standard";

export interface WorkspacePreferences {
  theme: ThemePreference;
  scale: UiScale;
  density: DensityPreference;
  editorFontSize: EditorFontSize;
  wordWrap: boolean;
  sidebarCollapsed: boolean;
  motion: MotionPreference;
  accent: AccentIntensity;
}

interface WorkspacePreferencesContextValue {
  preferences: WorkspacePreferences;
  resolvedTheme: "dark" | "light";
  reducedMotion: boolean;
  updatePreferences: (updates: Partial<WorkspacePreferences>) => void;
  resetPreferences: () => void;
}

export const workspacePreferenceDefaults: WorkspacePreferences = {
  theme: "dark",
  scale: 100,
  density: "compact",
  editorFontSize: 14,
  wordWrap: false,
  sidebarCollapsed: false,
  motion: "system",
  accent: "standard",
};

const themeValues: ThemePreference[] = ["dark", "light", "system"];
const scaleValues: UiScale[] = [90, 100, 110, 120];
const densityValues: DensityPreference[] = ["compact", "comfortable"];
const editorFontValues: EditorFontSize[] = [12, 13, 14, 15, 16, 18];
const motionValues: MotionPreference[] = ["system", "full", "reduced"];
const accentValues: AccentIntensity[] = ["subtle", "standard"];

const WorkspacePreferencesContext = createContext<WorkspacePreferencesContextValue | null>(null);

function includesValue<T>(values: readonly T[], value: unknown): value is T {
  return values.includes(value as T);
}

function readStoredPreferences(): WorkspacePreferences {
  if (typeof window === "undefined") return workspacePreferenceDefaults;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return workspacePreferenceDefaults;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return workspacePreferenceDefaults;
    const saved = parsed as Partial<WorkspacePreferences>;
    return {
      theme: includesValue(themeValues, saved.theme) ? saved.theme : workspacePreferenceDefaults.theme,
      scale: includesValue(scaleValues, saved.scale) ? saved.scale : workspacePreferenceDefaults.scale,
      density: includesValue(densityValues, saved.density) ? saved.density : workspacePreferenceDefaults.density,
      editorFontSize: includesValue(editorFontValues, saved.editorFontSize) ? saved.editorFontSize : workspacePreferenceDefaults.editorFontSize,
      wordWrap: typeof saved.wordWrap === "boolean" ? saved.wordWrap : workspacePreferenceDefaults.wordWrap,
      sidebarCollapsed: typeof saved.sidebarCollapsed === "boolean" ? saved.sidebarCollapsed : workspacePreferenceDefaults.sidebarCollapsed,
      motion: includesValue(motionValues, saved.motion) ? saved.motion : workspacePreferenceDefaults.motion,
      accent: includesValue(accentValues, saved.accent) ? saved.accent : workspacePreferenceDefaults.accent,
    };
  } catch {
    return workspacePreferenceDefaults;
  }
}

function matchMediaValue(query: string) {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

export function WorkspacePreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<WorkspacePreferences>(readStoredPreferences);
  const [systemDark, setSystemDark] = useState(() => matchMediaValue("(prefers-color-scheme: dark)"));
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => matchMediaValue("(prefers-reduced-motion: reduce)"));

  useEffect(() => {
    const colorQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateSystemPreferences = () => {
      setSystemDark(colorQuery.matches);
      setSystemReducedMotion(motionQuery.matches);
    };
    updateSystemPreferences();
    colorQuery.addEventListener("change", updateSystemPreferences);
    motionQuery.addEventListener("change", updateSystemPreferences);
    return () => {
      colorQuery.removeEventListener("change", updateSystemPreferences);
      motionQuery.removeEventListener("change", updateSystemPreferences);
    };
  }, []);

  const resolvedTheme = preferences.theme === "system" ? (systemDark ? "dark" : "light") : preferences.theme;
  const reducedMotion = preferences.motion === "reduced" || (preferences.motion === "system" && systemReducedMotion);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Storage may be unavailable in privacy-restricted browser sessions; the in-memory preference still works.
    }
  }, [preferences]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.dataset.themePreference = preferences.theme;
    root.dataset.scale = String(preferences.scale);
    root.dataset.density = preferences.density;
    root.dataset.accent = preferences.accent;
    root.dataset.motion = preferences.motion;
    root.dataset.sidebar = preferences.sidebarCollapsed ? "collapsed" : "expanded";
    root.style.setProperty("--ui-scale", String(preferences.scale / 100));
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.classList.toggle("reduce-motion", reducedMotion);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolvedTheme === "dark" ? "#090d0c" : "#f4f7f4");
  }, [preferences, reducedMotion, resolvedTheme]);

  const value = useMemo<WorkspacePreferencesContextValue>(() => ({
    preferences,
    resolvedTheme,
    reducedMotion,
    updatePreferences: (updates) => setPreferences((current) => ({ ...current, ...updates })),
    resetPreferences: () => setPreferences(workspacePreferenceDefaults),
  }), [preferences, reducedMotion, resolvedTheme]);

  return <WorkspacePreferencesContext.Provider value={value}>{children}</WorkspacePreferencesContext.Provider>;
}

export function useWorkspacePreferences() {
  const context = useContext(WorkspacePreferencesContext);
  if (!context) throw new Error("useWorkspacePreferences must be used within WorkspacePreferencesProvider");
  return context;
}
