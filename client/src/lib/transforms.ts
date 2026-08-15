/** Precision Console design reminder: deterministic, local-only transformations with useful diagnostic output. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface ParseIssue {
  message: string;
  position?: number;
  line?: number;
  column?: number;
  hint?: string;
}

export interface ParseSuccess {
  ok: true;
  value: JsonValue;
}

export interface ParseFailure {
  ok: false;
  issue: ParseIssue;
}

export type ParseResult = ParseSuccess | ParseFailure;

function jsonCorrectionHint(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("unexpected end") || normalized.includes("unterminated")) return "Check for a missing closing quote, bracket, or brace near the end of the document.";
  if (normalized.includes("property name") || normalized.includes("double-quoted")) return "JSON object keys must use double quotes; remove comments and single quotes.";
  if (normalized.includes("expected ','") || normalized.includes("expected ',' or")) return "Check for a missing comma or closing bracket near this location.";
  if (normalized.includes("unexpected token")) return "Check this character; JSON does not allow trailing commas, comments, or single-quoted strings.";
  return "Check punctuation, double quotes, and the structure around this location.";
}

export function formatJsonIssue(issue: ParseIssue) {
  const location = issue.line && issue.column ? `Line ${issue.line}, column ${issue.column}. ` : "";
  return `${location}${issue.message}${issue.hint ? ` ${issue.hint}` : ""}`;
}

export function parseJson(input: string): ParseResult {
  if (!input.trim()) return { ok: false, issue: { message: "Enter JSON to continue." } };
  try {
    return { ok: true, value: JSON.parse(input) as JsonValue };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to parse JSON.";
    const match = message.match(/position\s+(\d+)/i);
    const position = match ? Number(match[1]) : undefined;
    if (position === undefined) return { ok: false, issue: { message, hint: jsonCorrectionHint(message) } };
    const before = input.slice(0, position);
    const line = before.split("\n").length;
    const column = before.length - before.lastIndexOf("\n");
    return { ok: false, issue: { message, position, line, column, hint: jsonCorrectionHint(message) } };
  }
}

export function formatJson(value: JsonValue, indentation: "2" | "4" | "tab" = "2") {
  return JSON.stringify(value, null, indentation === "tab" ? "\t" : Number(indentation));
}

export function minifyJson(value: JsonValue) {
  return JSON.stringify(value);
}

export function formatByteSize(input: string) {
  const bytes = new TextEncoder().encode(input).length;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getMetrics(input: string) {
  return { characters: input.length, lines: input ? input.split("\n").length : 0, fileSize: formatByteSize(input) };
}

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringifyCell(value: JsonValue): string {
  if (value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function flattenRow(value: JsonValue, prefix = "", output: Record<string, string> = {}) {
  if (isRecord(value)) {
    Object.entries(value).forEach(([key, nestedValue]) => {
      flattenRow(nestedValue, prefix ? `${prefix}.${key}` : key, output);
    });
    return output;
  }
  output[prefix || "value"] = stringifyCell(value);
  return output;
}

function escapeCsv(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function jsonToCsv(value: JsonValue) {
  const source = Array.isArray(value) ? value : [value];
  const rows = source.map((entry) => flattenRow(entry));
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  if (!headers.length) return "";
  return [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header] ?? "")).join(",")),
  ].join("\n");
}

function yamlScalar(value: JsonValue) {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value !== "string") return JSON.stringify(value);
  const requiresQuote = value === "" || /[:#{}\[\],&*!|>'"%@`\n\r]/.test(value) || /^(true|false|null|~|yes|no|on|off|[-+]?\d+(\.\d+)?|\d{4}-\d{2}-\d{2})$/i.test(value) || /^\s|\s$/.test(value);
  return requiresQuote ? JSON.stringify(value) : value;
}

function yamlKey(key: string) {
  return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(key) ? key : JSON.stringify(key);
}

function toYaml(value: JsonValue, level = 0): string[] {
  const indent = "  ".repeat(level);
  if (Array.isArray(value)) {
    if (!value.length) return [`${indent}[]`];
    return value.flatMap((item) => {
      if (Array.isArray(item) || isRecord(item)) {
        const nested = toYaml(item, level + 1);
        const [first, ...rest] = nested;
        return [`${indent}- ${first.trimStart()}`, ...rest];
      }
      return [`${indent}- ${yamlScalar(item)}`];
    });
  }
  if (isRecord(value)) {
    if (!Object.keys(value).length) return [`${indent}{}`];
    return Object.entries(value).flatMap(([key, nestedValue]) => {
      if (Array.isArray(nestedValue) || isRecord(nestedValue)) {
        const nested = toYaml(nestedValue, level + 1);
        if (nested.length === 1 && /(?:\[\]|\{\})$/.test(nested[0])) return [`${indent}${yamlKey(key)}: ${nested[0].trim()}`];
        return [`${indent}${yamlKey(key)}:`, ...nested];
      }
      return [`${indent}${yamlKey(key)}: ${yamlScalar(nestedValue)}`];
    });
  }
  return [`${indent}${yamlScalar(value)}`];
}

export function jsonToYaml(value: JsonValue) {
  return toYaml(value).join("\n");
}

export type JsonSortOrder = "ascending" | "descending";

export interface JsonSortOptions {
  order?: JsonSortOrder;
  caseInsensitive?: boolean;
}

// Precision Console: normalize object keys recursively, never array positions—the latter can be semantically meaningful.
export function sortJsonKeys(value: JsonValue, options: JsonSortOptions = {}): JsonValue {
  const { order = "ascending", caseInsensitive = false } = options;
  const compareKeys = (left: string, right: string) => {
    const normalizedLeft = caseInsensitive ? left.toLowerCase() : left;
    const normalizedRight = caseInsensitive ? right.toLowerCase() : right;
    const primary = normalizedLeft < normalizedRight ? -1 : normalizedLeft > normalizedRight ? 1 : 0;
    const tieBreak = left < right ? -1 : left > right ? 1 : 0;
    return (primary || tieBreak) * (order === "ascending" ? 1 : -1);
  };
  const visit = (entry: JsonValue): JsonValue => {
    if (Array.isArray(entry)) return entry.map(visit);
    if (!isRecord(entry)) return entry;
    return Object.keys(entry).sort(compareKeys).reduce<Record<string, JsonValue>>((output, key) => {
      output[key] = visit(entry[key]);
      return output;
    }, {});
  };
  return visit(value);
}

export type JsonSchema = Record<string, JsonValue>;

export interface JsonSchemaOptions {
  title?: string;
  requiredFields?: "all" | "none";
}

function uniqueSchemaOptions(values: JsonSchema[]) {
  const unique = Array.from(new Map(values.map((value) => [JSON.stringify(value), value])).values());
  const hasNumber = unique.some((value) => value.type === "number");
  return hasNumber ? unique.filter((value) => value.type !== "integer") : unique;
}

function inferJsonSchemaNode(value: JsonValue, requiredFields: JsonSchemaOptions["requiredFields"]): JsonSchema {
  if (value === null) return { type: "null" };
  if (typeof value === "string") return { type: "string" };
  if (typeof value === "boolean") return { type: "boolean" };
  if (typeof value === "number") return { type: Number.isInteger(value) ? "integer" : "number" };
  if (Array.isArray(value)) {
    if (!value.length) return { type: "array", items: {} };
    const itemSchemas = uniqueSchemaOptions(value.map((item) => inferJsonSchemaNode(item, requiredFields)));
    return { type: "array", items: itemSchemas.length === 1 ? itemSchemas[0] : { oneOf: itemSchemas } };
  }
  const properties = Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, inferJsonSchemaNode(nested, requiredFields)])) as Record<string, JsonValue>;
  const schema: JsonSchema = { type: "object", properties };
  if (requiredFields === "all" && Object.keys(properties).length) schema.required = Object.keys(properties);
  return schema;
}

// Precision Console: a sample describes observed structure, so required fields are explicit user policy—not an invisible assumption.
export function inferJsonSchema(value: JsonValue, options: JsonSchemaOptions = {}): JsonSchema {
  const title = options.title?.trim();
  const body = inferJsonSchemaNode(value, options.requiredFields ?? "all");
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    ...(title ? { title } : {}),
    ...body,
  };
}

export type TypeScriptDeclarationStyle = "interface" | "type";

export interface TypeScriptGenerationOptions {
  rootName?: string;
  declarationStyle?: TypeScriptDeclarationStyle;
  exportDeclarations?: boolean;
}

type TypeScriptDeclaration = { name: string; lines: string[] };

const typescriptKeywords = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "as", "implements", "interface", "let", "package", "private", "protected", "public", "static", "yield", "any", "boolean", "constructor", "declare", "get", "module", "require", "number", "set", "string", "symbol", "type", "from", "of", "readonly", "unknown",
]);

function toTypeScriptIdentifier(value: string) {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
  const fallback = normalized || "Root";
  return /^\d/.test(fallback) ? `Value${fallback}` : fallback;
}

function toTypeScriptProperty(value: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) && !typescriptKeywords.has(value) ? value : JSON.stringify(value);
}

function uniqueTypeList(values: string[]) {
  return Array.from(new Set(values));
}

// Precision Console: generate readable declarations from one explicit JSON sample without pretending to infer an entire API contract.
export function jsonToTypeScript(value: JsonValue, options: TypeScriptGenerationOptions = {}) {
  const declarationStyle = options.declarationStyle ?? "interface";
  const exportDeclarations = options.exportDeclarations ?? true;
  const declarations: TypeScriptDeclaration[] = [];
  const usedNames = new Set<string>();
  const reserveName = (suggestedName: string) => {
    const base = toTypeScriptIdentifier(suggestedName);
    let candidate = base;
    let suffix = 2;
    while (usedNames.has(candidate)) { candidate = `${base}${suffix}`; suffix += 1; }
    usedNames.add(candidate);
    return candidate;
  };
  const inferType = (entry: JsonValue, suggestedName: string): string => {
    if (entry === null) return "null";
    if (typeof entry === "string") return "string";
    if (typeof entry === "boolean") return "boolean";
    if (typeof entry === "number") return "number";
    if (Array.isArray(entry)) {
      if (!entry.length) return "unknown[]";
      const itemTypes = uniqueTypeList(entry.map((item) => inferType(item, `${suggestedName}Item`)));
      const itemType = itemTypes.length === 1 ? itemTypes[0] : `(${itemTypes.join(" | ")})`;
      return `${itemType}[]`;
    }
    const name = reserveName(suggestedName);
    const declaration: TypeScriptDeclaration = { name, lines: [] };
    declarations.push(declaration);
    declaration.lines = Object.entries(entry).map(([key, nested]) => `  ${toTypeScriptProperty(key)}: ${inferType(nested, `${name}${toTypeScriptIdentifier(key)}`)};`);
    return name;
  };
  const rootName = reserveName(options.rootName?.trim() || "Root");
  usedNames.delete(rootName);
  const rootType = inferType(value, rootName);
  const prefix = exportDeclarations ? "export " : "";
  const rendered = declarations.map((declaration) => declarationStyle === "interface"
    ? `${prefix}interface ${declaration.name} {\n${declaration.lines.join("\n")}\n}`
    : `${prefix}type ${declaration.name} = {\n${declaration.lines.join("\n")}\n};`);
  if (!declarations.length) rendered.push(`${prefix}type ${toTypeScriptIdentifier(options.rootName?.trim() || "Root")} = ${rootType};`);
  return rendered.join("\n\n");
}

export type DiffKind = "added" | "removed" | "changed";
export interface DiffEntry {
  kind: DiffKind;
  path: string;
  before?: JsonValue;
  after?: JsonValue;
}

export function diffJson(before: JsonValue, after: JsonValue, path = "$"): DiffEntry[] {
  if (Object.is(before, after)) return [];
  if (Array.isArray(before) && Array.isArray(after)) {
    const output: DiffEntry[] = [];
    const length = Math.max(before.length, after.length);
    for (let index = 0; index < length; index += 1) {
      const itemPath = `${path}[${index}]`;
      if (index >= before.length) output.push({ kind: "added", path: itemPath, after: after[index] });
      else if (index >= after.length) output.push({ kind: "removed", path: itemPath, before: before[index] });
      else output.push(...diffJson(before[index], after[index], itemPath));
    }
    return output;
  }
  if (isRecord(before) && isRecord(after)) {
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).sort();
    return keys.flatMap((key) => {
      const itemPath = `${path}.${key}`;
      if (!(key in before)) return [{ kind: "added" as const, path: itemPath, after: after[key] }];
      if (!(key in after)) return [{ kind: "removed" as const, path: itemPath, before: before[key] }];
      return diffJson(before[key], after[key], itemPath);
    });
  }
  return [{ kind: "changed", path, before, after }];
}

function decodeBase64Bytes(value: string) {
  const normalised = value.trim().replaceAll("-", "+").replaceAll("_", "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalised) || normalised.length % 4 === 1) throw new Error("Input is not valid Base64 or URL-safe Base64.");
  const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function decodeBase64Utf8(value: string) {
  return new TextDecoder("utf-8", { fatal: true }).decode(decodeBase64Bytes(value));
}

export function encodeBase64Utf8(value: string, urlSafe = false) {
  const bytes = new TextEncoder().encode(value);
  const encoded = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
  return urlSafe ? encoded.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "") : encoded;
}

export interface DecodedJwt {
  header: Record<string, JsonValue>;
  payload: Record<string, JsonValue>;
  signaturePresent: boolean;
  timestamps: Array<{ name: string; value: string }>;
}

function decodeJwtSection(section: string, label: string): Record<string, JsonValue> {
  let decoded: string;
  try {
    decoded = decodeBase64Utf8(section);
  } catch {
    throw new Error(`The JWT ${label} is not valid Base64URL data.`);
  }
  const result = parseJson(decoded);
  if (!result.ok || !isRecord(result.value)) throw new Error(`The JWT ${label} is not a JSON object.`);
  return result.value;
}

export function decodeJwt(value: string): DecodedJwt {
  const parts = value.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT has exactly three dot-separated segments: header.payload.signature.");
  const header = decodeJwtSection(parts[0], "header");
  const payload = decodeJwtSection(parts[1], "payload");
  const timestamps = ["iat", "nbf", "exp"]
    .flatMap((name) => {
      const raw = payload[name];
      if (typeof raw !== "number" || !Number.isFinite(raw)) return [];
      const date = new Date(raw * 1000);
      return [{ name, value: Number.isNaN(date.getTime()) ? "Invalid Unix timestamp" : date.toLocaleString() }];
    });
  return { header, payload, signaturePresent: Boolean(parts[2]), timestamps };
}

export function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function highlightCode(value: string, language: "json" | "yaml" | "csv" | "text" = "json") {
  if (language === "text") return escapeHtml(value);
  const escaped = escapeHtml(value);
  if (language === "csv") return escaped.replace(/^.*$/gm, (line) => `<span class="tok-csv">${line}</span>`);
  if (language === "yaml") {
    return escaped
      .replace(/^(\s*)([^\n:#]+):/gm, '$1<span class="tok-key">$2</span>:')
      .replace(/("(?:\\.|[^"\\])*")/g, '<span class="tok-string">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="tok-keyword">$1</span>');
  }
  return escaped.replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, (match, stringToken, isKey, keyword) => {
    if (stringToken) return `<span class="${isKey ? "tok-key" : "tok-string"}">${stringToken}</span>${isKey || ""}`;
    if (keyword) return `<span class="tok-keyword">${match}</span>`;
    return `<span class="tok-number">${match}</span>`;
  });
}
