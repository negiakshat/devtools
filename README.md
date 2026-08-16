# DevTools

**DevTools** is a browser-first developer utility workbench for inspecting, transforming, and converting common data formats. The interface is designed as a compact IDE-style workspace, with deterministic utilities that process tool input in the browser.

## Current tools

| Area | Implemented utilities |
|---|---|
| JSON | JSON Formatter, JSON Validator, JSON Minifier, JSON Diff, JSON to CSV, JSON to YAML, JSON Key Sorter, JSON to TypeScript, and JSON Schema Generator |
| Security and encoding | JWT Decoder and Base64 Encoder / Decoder |

The JWT Decoder is an inspection utility only. It decodes the header and payload but does **not** verify a signature.

## Tech stack

The application uses React 19, TypeScript, Vite 7, Tailwind CSS 4, Wouter, and CodeMirror. The production artifact is served by the included Express static server. Package management uses pnpm.

## Local setup

Install a supported Node.js release and pnpm, then install the locked dependency set:

```bash
pnpm install --frozen-lockfile
```

Start the development server:

```bash
pnpm dev
```

## Development commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the Vite development server. |
| `pnpm check` | Run the TypeScript type check. |
| `pnpm exec vitest run` | Run the deterministic transformation regression tests. |
| `pnpm build` | Build the client and bundle the production server into `dist/`. |
| `pnpm start` | Serve the production build from `dist/`. |
| `pnpm preview` | Preview the Vite production client build. |
| `pnpm format` | Format supported files with Prettier. |

## Production build

Create the deployment artifact, then serve it locally if needed:

```bash
pnpm build
pnpm start
```

The build command produces the client output and bundles `server/index.ts` for production serving. Generated output belongs in `dist/` and is intentionally excluded from version control.

## Project structure

```text
client/
  public/                 Static public configuration and crawl assets
  src/
    components/           Shared workbench and UI components
    contexts/             Browser-local workspace preferences
    lib/                  Tool registry, transformations, analytics boundary, and utilities
    pages/                Home, tool routes, and trust pages
    index.css             Workbench visual system and responsive styling
    App.tsx               Application routes and shell
server/
  index.ts                Production static server
shared/
  const.ts                Shared constants
patches/                  Versioned package patches
research/                 Product and QA notes
```

## Privacy model

Tool transformations are implemented in the browser. JSON documents, JWT strings, Base64 text, and file contents selected for a tool are not uploaded by the transformation workflow.

Workspace preferences are stored locally in the browser. The application also includes a bounded analytics adapter for product events. It permits only whitelisted, short metadata such as a tool identifier, action, or generic error category; editor and tool input contents are not included in those events.

## Development and contribution notes

Keep utilities deterministic and browser-local unless the product requirements explicitly change. When modifying a transformation, update or add a regression case in `client/src/lib/transforms.test.ts` and run the type check, test suite, and production build before opening a change.

Preserve the existing workbench visual system and accessibility behavior, including keyboard access and reduced-motion support. Do not commit local environment files, generated build output, dependency directories, logs, or credentials; the repository `.gitignore` is maintained for those local artifacts.
