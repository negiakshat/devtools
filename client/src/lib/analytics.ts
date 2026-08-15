/** Precision Console telemetry reminder: record product signals, never developer input. */
import type { ToolDefinition } from "@/lib/toolRegistry";

export type SafeEventName =
  | "tool_execute"
  | "tool_success"
  | "tool_error"
  | "example_loaded"
  | "copy_clicked"
  | "download_clicked"
  | "related_tool_clicked"
  | "tool_navigation_clicked"
  | "application_error";

type SafeEventValue = string | number | boolean;
type SafeEventProperties = Partial<Record<"tool_slug" | "tool_category" | "action" | "outcome" | "source" | "destination_slug" | "route_kind" | "error_kind", SafeEventValue>>;

const allowedKeys = new Set<keyof SafeEventProperties>([
  "tool_slug", "tool_category", "action", "outcome", "source", "destination_slug", "route_kind", "error_kind",
]);

function safeProperties(properties: SafeEventProperties): Record<string, SafeEventValue> {
  return Object.fromEntries(Object.entries(properties).filter(([key, value]) => {
    if (!allowedKeys.has(key as keyof SafeEventProperties) || value === undefined) return false;
    return typeof value !== "string" || value.length <= 80;
  })) as Record<string, SafeEventValue>;
}

function errorKind(error: unknown) {
  if (error instanceof SyntaxError) return "syntax";
  if (error instanceof DOMException) return "browser_api";
  if (error instanceof Error) return "runtime";
  return "unknown";
}

export function trackEvent(name: SafeEventName, properties: SafeEventProperties = {}) {
  if (typeof window === "undefined") return;
  try {
    const umami = (window as Window & { umami?: { track?: (event: string, data?: Record<string, SafeEventValue>) => void } }).umami;
    umami?.track?.(name, safeProperties(properties));
  } catch {
    // Analytics must never affect a local tool workflow.
  }
}

export function trackToolEvent(name: Exclude<SafeEventName, "application_error" | "tool_navigation_clicked">, tool: Pick<ToolDefinition, "slug" | "category">, properties: SafeEventProperties = {}) {
  trackEvent(name, { tool_slug: tool.slug, tool_category: tool.category, ...properties });
}

export function reportApplicationError(error: unknown) {
  trackEvent("application_error", { route_kind: "client", error_kind: errorKind(error) });
}
