# DEVTOOLS Utility Quality Matrix

## Reusable completion standard

Every permanent utility must satisfy the following observable checks before release. The matrix intentionally distinguishes shared behavior from tool-specific logic so a page is not considered complete solely because its happy path works.

| Dimension | Completion criterion |
|---|---|
| Functional | Valid, invalid, empty, edge, larger, and Unicode-relevant inputs return a correct result or a calm actionable diagnostic. |
| Workflow | Input, explicit primary action, useful example, clear/reset, output inspection, copy, and appropriate download are visible and keyboard-operable. |
| File handling | Where source data is naturally textual, a local-only file picker and file drop path accepts text without uploading it. |
| Feedback | Execute, copy, download, clear, and local-file load actions visibly confirm completion without intrusive notification dependence. |
| Trust | Local processing language matches the code path; JWT limitations remain explicit. |
| Accessibility | Controls have accessible names, status and errors are announced, focus remains visible, and motion preferences apply. |
| Search intent | The H1, description, help, FAQ, related links, canonical, Open Graph metadata, schema, and sitemap match the working utility. |
| Responsive | Editors stack or scroll intentionally at narrow widths; no page-level horizontal overflow or inaccessible controls. |

## Coverage by tool family

| Tools | Required input cases | Distinct quality checks |
|---|---|---|
| JSON Formatter, Validator, Minifier, Key Sorter | Valid object/array, malformed JSON, empty input, deep nesting, Unicode | Precise syntax location, correction hint, formatting/sorting policy, JSON file loading. |
| JSON to CSV, JSON to YAML | Valid object/array, malformed JSON, empty input, nested and Unicode values | Conversion-specific note remains accurate, output download has suitable extension, JSON file loading. |
| JSON to TypeScript, JSON Schema Generator | Valid object/array, malformed JSON, empty input, nested and Unicode values | Naming controls, sample-inference limitation, generated file extension, JSON file loading. |
| JSON Diff | Valid equivalent/different documents, invalid left/right input, one side empty, nested and Unicode values | Two independent file inputs, side-specific diagnostics, structural-result copy/download. |
| JWT Decoder | Valid token, malformed segments, empty input, Unicode claims where decodable | Prominent non-verification warning, header/payload tabs, no trust overstatement. |
| Base64 Encoder / Decoder | UTF-8 encode/decode, invalid Base64, empty input, URL-safe values | Direction clarity, URL-safe control behavior, text-file loading only where useful. |

## Approved shared implementation scope

The following improvements address audit findings without redesigning the workbench or adding utilities:

1. Add a compact **Load local file** action and file-drop state to the existing input editor. It will read textual files only in the browser, display the source filename, and be enabled only on tool inputs where text-file use is meaningful.
2. Add non-intrusive inline feedback for local file loads, clears, and downloads. Preserve existing toast feedback and `aria-live` output states rather than replacing them.
3. Centralize JSON diagnostic formatting and add conservative correction hints for familiar syntax problems. Keep the browser parser as the source of truth and never imply schema validation.
4. Improve the input status message to identify an empty buffer, valid JSON, source filename, and clear error state consistently.
5. Split the heavy tool route from the home route with React lazy loading if the existing route composition allows it cleanly, so the workbench code is not required for the first home render.

## Explicit non-goals for this pass

This phase will not redesign the homepage, alter the visual identity, add a large tool catalog, turn file input into server uploads, claim maximum file sizes, invent validation rules, or add dense configuration panels. Any route-level SEO content changes will be limited to real audit findings and will retain the current tool-first page hierarchy.

## Verification record

The deterministic Vitest suite passes all ten checks across JSON formatting/minification, diagnostic output, CSV, YAML, sorting, schema generation, TypeScript declarations, structural diffing, Base64 including URL-safe UTF-8, and JWT decoding without signature claims. TypeScript passes with no emitted errors. The production build passes after splitting editor, icon, and React dependencies into dedicated output chunks; the home application payload is no longer coupled to the browser editor runtime.

Representative desktop review covered formatter, diff, JWT, and TypeScript generation, while narrow-viewport review covered formatter, diff, and Base64. The initial mobile review exposed an action-bar overflow risk on the densest editor toolbar. The toolbar now wraps into a compact dedicated command row below the input tab, keeping primary action, example, local file, and clear controls visible and keyboard reachable at a 375px viewport. Fresh browser-console review showed no errors or warnings from the quality update.
