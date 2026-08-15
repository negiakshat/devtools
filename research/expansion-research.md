# Controlled Expansion Research Notes

## JSON-to-TypeScript intent

Search results reviewed on 2026-08-15 show a consistent, standalone developer intent for converting JSON examples into TypeScript declarations. The primary expected output is typed interfaces or type aliases, with nested object, array, nullable, and mixed-value support. This utility belongs directly beside the existing JSON formatter, validator, diff, and conversion tools and can run entirely in the browser.

Relevant sources discovered:

- https://quicktype.io/typescript — presents generation of TypeScript interfaces from JSON, JSON Schema, and GraphQL.
- https://transform.tools/json-to-typescript — presents an online JSON-to-TypeScript conversion playground.
- https://playcode.io/json-to-typescript — emphasizes nested objects, arrays, and optional properties.
- https://jsonformatter.org/json-to-typescript — represents an established standalone JSON-to-TypeScript utility intent.

## Preliminary implication

JSON-to-TypeScript passes the initial quality gate: it has direct standalone search intent, solves a frequent API-modeling task, is locally deterministic, naturally extends the established Data / JSON cluster, and can differentiate through integrated editor preferences, diagnostics, clear output metadata, and adjacent JSON workflows.

Source reading confirms the expected baseline: a converter should infer nested object declarations, arrays, and mixed-value unions from a JSON sample; expose a clear root-name and export decision; provide copy and `.ts` download; and keep input local. The chosen implementation will generate deterministic interfaces from an explicit sample, while describing output as a starting model rather than a guarantee of a production API contract.

Sources reviewed:

- https://quicktype.io/typescript — dedicated TypeScript generation utility and API-modeling context.
- https://transform.tools/json-to-typescript — dedicated browser conversion playground.
- https://playcode.io/json-to-typescript — documents nested objects, arrays, unions, root naming, interface/type selection, export, and client-side processing.

## JSON Schema generator intent

Search results and source reading confirm a separate, established intent for generating a JSON Schema from a JSON sample. The official JSON Schema guide distinguishes the input instance from a schema that describes structure and data types, and documents the use of `$schema`, `type`, `properties`, `required`, and `items`. Quicktype and Transform.tools each publish dedicated JSON-to-JSON-Schema workflows.

Relevant sources reviewed:

- https://json-schema.org/learn/getting-started-step-by-step — JSON Schema’s official introductory guide, including the role of `$schema`, type constraints, properties, required fields, and array items.
- https://quicktype.io/schema — dedicated JSON Schema generation page.
- https://transform.tools/json-to-json-schema — dedicated online JSON-to-JSON-Schema conversion interface and draft schema output example.

## Preliminary implication

JSON Schema generation also passes the quality gate. The first implementation should be transparent about inference: a single sample can provide type and observed-structure guidance, but cannot prove that an observed object key is universally required. It should therefore provide a deliberate “required fields” policy rather than silently presenting assumptions as facts.

## JSON sorter intent

Representative utility pages demonstrate a distinct developer workflow: recursively normalize object key order before code review, configuration maintenance, snapshot tests, and structural comparison. JSONLint documents ascending/descending order, recursive nested-object sorting, case sensitivity, and the risk of reordering arrays. Its documentation also identifies cleaner diffs and consistent output as primary uses. A broader JSON sorter may sort arrays by a property, but that is a different and potentially destructive operation.

Relevant sources reviewed:

- https://jsonlint.com/json-sort — dedicated recursive JSON-key sorting utility with options and explicit array-order caution.
- https://novicelab.org/jsonabc/ — offline-oriented JSON alphabetical sorting utility.
- https://sort-json.utils.com/ — demonstrates an adjacent but separate intent for sorting JSON record arrays by keys and nested paths.

## Preliminary implication

A focused **JSON Key Sorter** belongs in the first JSON cluster when scoped to recursive object-key normalization. It should preserve array order by default, show an explicit non-destructive guarantee, support ascending/descending and case-insensitive options, and position itself as a preparation step for JSON Diff. Array sorting is deliberately excluded from this first release because it changes semantic ordering and deserves a dedicated future workflow if demand justifies it.

## Selected first cluster: JSON modeling and normalization

| Candidate | Standalone intent | Meaningful task | Local-first fit | Distinguishing implementation | Cluster fit | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| JSON to TypeScript | Strong | API model scaffolding | Fully deterministic | Nested interface inference, sampled-type disclaimer, editor integration | Direct | Include |
| JSON Schema Generator | Strong | Contract / validation starting point | Fully deterministic | Explicit required-field policy, Draft 2020-12 declaration | Direct | Include |
| JSON Key Sorter | Strong | Stable config, review, and diff preparation | Fully deterministic | Recursive-only, preserves arrays, order controls | Direct | Include |

This three-tool cluster moves DEVTOOLS from eight to eleven utilities, intentionally stopping short of feature bloat. It reinforces the existing JSON workflow: **validate and format → normalize key order → model as TypeScript or schema → compare and convert**. Every selected tool has a distinct permanent route and no keyword-variant duplicate.
