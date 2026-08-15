# Contextual Command Strip Integration Plan

## Contract

The shared strip will sit between the tool-specific option controls and the editor workspace. It will use a typed configuration containing a concise primary command, any context-setting controls needed for the active utility, output actions that operate on the generated result, and a compact overflow menu for infrequent but useful workflow actions. Every action is supplied by the owning tool route, so the component never inspects editor text, output text, tokens, or files.

| Command role | Interaction model | Enabled condition | Feedback |
| --- | --- | --- | --- |
| Primary | Prominent button with optional `Ctrl/Cmd + Enter` hint | Always available; tool handler provides validation | Existing success/error status and toast |
| Mode or options | Compact segmented controls | Always available unless the active mode makes an option irrelevant | Existing output-reset behavior |
| Output actions | Copy and download buttons | Generated output or diff result exists | Existing copied state and toast |
| Utility overflow | Menu items such as load example or clear workspace | Relevant tool handler exists | Existing source/status feedback |

## Actual workflow mapping

| Tool family | Primary command | Context controls | Output actions | Utility menu |
| --- | --- | --- | --- | --- |
| Formatter | Format JSON | Indentation | Copy/download formatted result | Load example, clear input |
| Validator | Validate JSON | None | Copy/download normalized preview | Load example, clear input |
| Minifier | Minify JSON | None | Copy/download minified result | Load example, clear input |
| CSV/YAML converters | Convert | None | Copy/download converted result | Load example, clear input |
| Key sorter | Sort keys | Key order, ignore case | Copy/download sorted result | Load example, clear input |
| TypeScript generator | Generate TypeScript | Root name, declaration style, export toggle | Copy/download declarations | Load example, clear input |
| Schema generator | Generate schema | Schema title, required policy | Copy/download schema | Load example, clear input |
| JSON diff | Compare JSON | None | Copy/download diff report | Load both examples, clear comparison |
| JWT decoder | Decode JWT | Active decoded section | Copy/download active section | Load example, clear input |
| Base64 | Encode or decode | Direction, URL-safe option | Copy/download result | Load example, clear input |

## Accessibility and responsive rules

The strip will use native buttons, labelled groups, disabled output commands, and keyboard-safe Radix menu items. It will retain `Ctrl/Cmd + Enter` at the CodeMirror surface. The layout will wrap at small widths; the primary action remains visible, while less-frequent commands collapse into the accessible menu. It will inherit theme tokens, UI scale, density, accent intensity, and reduced-motion behavior without browser-zoom workarounds.
