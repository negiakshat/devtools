/** Precision Console design reminder: concise technical copy, tool-first hierarchy, and Signal Green only for active/success states. */
import {
  ArrowDownAZ,
  Braces,
  CheckCircle2,
  Code2,
  Columns3,
  FileCode2,
  FileJson2,
  FileOutput,
  KeyRound,
  Minimize2,
  ShieldCheck,
  Table2,
  type LucideIcon,
} from "lucide-react";

export type ToolSlug =
  | "json-formatter"
  | "json-validator"
  | "json-minifier"
  | "json-diff"
  | "json-to-csv"
  | "json-to-yaml"
  | "json-sorter"
  | "json-to-typescript"
  | "json-schema-generator"
  | "jwt-decoder"
  | "base64";

export type ToolCategory = "Data" | "Security & Encoding";

export interface ToolDefinition {
  slug: ToolSlug;
  name: string;
  shortName: string;
  category: ToolCategory;
  description: string;
  seoTitle: string;
  seoDescription: string;
  icon: LucideIcon;
  related: ToolSlug[];
  primaryAction: string;
  outputLabel: string;
  help: {
    what: string;
    useCases: string[];
    faqs: Array<{ question: string; answer: string }>;
  };
}

export const tools: ToolDefinition[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    shortName: "Formatter",
    category: "Data",
    description: "Format, validate, and inspect JSON with local browser processing.",
    seoTitle: "JSON Formatter — Format and Validate JSON Locally | Developer Tools",
    seoDescription: "Format, validate, copy, and download JSON in your browser. No sign-up and no server upload required.",
    icon: Braces,
    related: ["json-validator", "json-sorter", "json-diff", "json-to-typescript", "json-schema-generator"],
    primaryAction: "Format JSON",
    outputLabel: "Formatted JSON",
    help: {
      what: "Formats valid JSON into an easy-to-read structure with the indentation you choose. Processing stays in your browser.",
      useCases: ["Inspect API responses", "Clean configuration files", "Prepare JSON for code review"],
      faqs: [
        { question: "Is my JSON uploaded?", answer: "No. This formatter performs its deterministic transformation in your browser." },
        { question: "Why did formatting fail?", answer: "JSON requires double-quoted keys and strings, plus valid commas and brackets. The diagnostic points to the approximate location." },
      ],
    },
  },
  {
    slug: "json-validator",
    name: "JSON Validator",
    shortName: "Validator",
    category: "Data",
    description: "Check JSON syntax and locate malformed input before it reaches your code.",
    seoTitle: "JSON Validator — Find JSON Syntax Errors | Developer Tools",
    seoDescription: "Validate JSON locally, get a useful syntax diagnostic, and preview normalized output in your browser.",
    icon: CheckCircle2,
    related: ["json-formatter", "json-minifier", "json-schema-generator", "json-to-typescript"],
    primaryAction: "Validate JSON",
    outputLabel: "Validated preview",
    help: {
      what: "Checks JSON syntax, highlights an approximate location when parsing fails, and gives you a normalized preview when it succeeds.",
      useCases: ["Check request payloads", "Debug configuration data", "Validate exported API data"],
      faqs: [
        { question: "Does valid JSON mean my schema is correct?", answer: "No. It confirms syntax only; values can still be structurally unsuitable for a particular API or schema." },
        { question: "Can it find line and column?", answer: "When the browser reports a character position, this tool translates it into an approximate line and column." },
      ],
    },
  },
  {
    slug: "json-minifier",
    name: "JSON Minifier",
    shortName: "Minifier",
    category: "Data",
    description: "Remove insignificant whitespace from valid JSON without changing the data.",
    seoTitle: "JSON Minifier — Compact JSON Locally | Developer Tools",
    seoDescription: "Minify valid JSON in your browser, compare character reduction, copy the result, or download it.",
    icon: Minimize2,
    related: ["json-formatter", "json-validator", "json-to-csv"],
    primaryAction: "Minify JSON",
    outputLabel: "Minified JSON",
    help: {
      what: "Removes insignificant whitespace from valid JSON using the browser’s parser, preserving keys, values, and structure.",
      useCases: ["Reduce request payload size", "Compact fixture files", "Prepare inline JSON values"],
      faqs: [
        { question: "Will it change string values?", answer: "No. String content is parsed first and then serialized safely." },
        { question: "Can it minify invalid JSON?", answer: "No. It stops and provides a diagnostic, avoiding output that could corrupt data." },
      ],
    },
  },
  {
    slug: "json-diff",
    name: "JSON Diff",
    shortName: "Diff",
    category: "Data",
    description: "Compare two JSON documents structurally and isolate additions, removals, and edits.",
    seoTitle: "JSON Diff — Compare JSON Objects and Arrays | Developer Tools",
    seoDescription: "Compare JSON A and JSON B locally. Review additions, removals, and changed values with a structural summary.",
    icon: Columns3,
    related: ["json-sorter", "json-formatter", "json-validator", "json-minifier"],
    primaryAction: "Compare JSON",
    outputLabel: "Structural changes",
    help: {
      what: "Parses each side independently, then compares object keys and array positions to show added, removed, and changed values.",
      useCases: ["Review API response changes", "Compare environment configuration", "Debug JSON transformations"],
      faqs: [
        { question: "Are keys compared by position?", answer: "Object keys are compared by name. Array elements are compared by their index." },
        { question: "Does the comparison leave my browser?", answer: "No. Both documents are parsed and compared locally." },
      ],
    },
  },
  {
    slug: "json-to-csv",
    name: "JSON to CSV",
    shortName: "JSON → CSV",
    category: "Data",
    description: "Convert JSON arrays into an RFC-style CSV export with flattened nested fields.",
    seoTitle: "JSON to CSV — Convert JSON Arrays to CSV | Developer Tools",
    seoDescription: "Convert JSON arrays to CSV locally. Preview flattened columns, copy the output, or download a CSV file.",
    icon: Table2,
    related: ["json-to-yaml", "json-formatter", "json-validator"],
    primaryAction: "Convert to CSV",
    outputLabel: "CSV preview",
    help: {
      what: "Converts an array of JSON objects to CSV. Nested object properties become dot-separated columns; nested arrays are stored as JSON cells.",
      useCases: ["Open API data in a spreadsheet", "Export fixtures for analysis", "Create quick tabular reports"],
      faqs: [
        { question: "What JSON structures work best?", answer: "An array of objects produces the clearest table. Primitive arrays and single objects are supported as a single value or row." },
        { question: "How are nested arrays handled?", answer: "Arrays remain JSON inside one escaped CSV cell so data is not silently discarded." },
      ],
    },
  },
  {
    slug: "json-to-yaml",
    name: "JSON to YAML",
    shortName: "JSON → YAML",
    category: "Data",
    description: "Convert JSON data into readable YAML without sending it to a server.",
    seoTitle: "JSON to YAML — Convert JSON to YAML Locally | Developer Tools",
    seoDescription: "Convert JSON to YAML in your browser, preview the output, copy it, or download a YAML file.",
    icon: FileOutput,
    related: ["json-to-csv", "json-formatter", "json-validator"],
    primaryAction: "Convert to YAML",
    outputLabel: "YAML output",
    help: {
      what: "Parses JSON first and then serializes its values into readable YAML. Keys and quoted strings are preserved safely where practical.",
      useCases: ["Create readable config files", "Move JSON fixtures into YAML", "Inspect nested data structures"],
      faqs: [
        { question: "Can every YAML document be represented?", answer: "This conversion emits a pragmatic YAML subset for JSON-compatible data; JSON has no anchors, tags, or custom YAML types." },
        { question: "Why are some values quoted?", answer: "Strings that could be misread as YAML booleans, dates, or control characters are quoted to preserve their JSON meaning." },
      ],
    },
  },
  {
    slug: "json-sorter",
    name: "JSON Key Sorter",
    shortName: "Key Sorter",
    category: "Data",
    description: "Recursively normalize JSON object key order while preserving every array position.",
    seoTitle: "JSON Key Sorter — Sort JSON Keys Locally | Developer Tools",
    seoDescription: "Sort JSON object keys recursively in your browser. Preserve array order, choose key order, copy the result, or download sorted JSON.",
    icon: ArrowDownAZ,
    related: ["json-diff", "json-formatter", "json-validator", "json-minifier"],
    primaryAction: "Sort keys",
    outputLabel: "Sorted JSON",
    help: {
      what: "Recursively orders object keys in valid JSON for cleaner reviews, stable fixtures, and easier structural comparison. Array item order is preserved.",
      useCases: ["Normalize configuration files", "Prepare JSON before comparing", "Reduce ordering noise in snapshots"],
      faqs: [
        { question: "Does sorting change my data?", answer: "Object key order changes, but keys, values, types, and array positions remain intact. JSON object member order is not semantically meaningful." },
        { question: "Are arrays sorted too?", answer: "No. Arrays keep their original order because positions can change an application’s meaning." },
      ],
    },
  },
  {
    slug: "json-to-typescript",
    name: "JSON to TypeScript",
    shortName: "JSON → TS",
    category: "Data",
    description: "Generate readable TypeScript declarations from a JSON example in your browser.",
    seoTitle: "JSON to TypeScript — Generate Interfaces Locally | Developer Tools",
    seoDescription: "Generate TypeScript interfaces or type aliases from JSON locally. Infer nested objects and arrays, then copy or download a .ts file.",
    icon: FileCode2,
    related: ["json-schema-generator", "json-formatter", "json-validator", "json-to-yaml"],
    primaryAction: "Generate TypeScript",
    outputLabel: "TypeScript declarations",
    help: {
      what: "Uses one valid JSON sample to infer readable TypeScript declarations for primitives, nested objects, and arrays. Processing stays in your browser.",
      useCases: ["Scaffold API response models", "Type frontend fixtures", "Start a client contract from sample data"],
      faqs: [
        { question: "Are the generated fields always required?", answer: "The output reflects fields observed in the supplied sample. Review optionality and domain constraints before using it as a production API contract." },
        { question: "Does this send my API response to a server?", answer: "No. JSON parsing and declaration generation run locally in the browser." },
      ],
    },
  },
  {
    slug: "json-schema-generator",
    name: "JSON Schema Generator",
    shortName: "JSON Schema",
    category: "Data",
    description: "Infer a Draft 2020-12 JSON Schema from one valid JSON sample, locally.",
    seoTitle: "JSON Schema Generator — Generate Schema from JSON Locally | Developer Tools",
    seoDescription: "Generate a Draft 2020-12 JSON Schema from JSON in your browser. Control observed required fields, then copy or download the schema.",
    icon: FileJson2,
    related: ["json-to-typescript", "json-validator", "json-formatter", "json-diff"],
    primaryAction: "Generate schema",
    outputLabel: "Generated JSON Schema",
    help: {
      what: "Infers a practical Draft 2020-12 schema from one JSON example, describing observed value types, object properties, required policy, and array item structure.",
      useCases: ["Start API validation contracts", "Document a response shape", "Create a schema baseline for fixtures"],
      faqs: [
        { question: "Does a generated schema fully describe my API?", answer: "No. A single sample can show observed structure, but it cannot prove every allowed value, optional field, or business rule. Review the generated schema before relying on it." },
        { question: "Which JSON Schema draft is emitted?", answer: "The generated document declares the JSON Schema Draft 2020-12 meta-schema." },
      ],
    },
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    shortName: "JWT Decoder",
    category: "Security & Encoding",
    description: "Inspect a JSON Web Token’s header, payload, and timestamps without signature verification.",
    seoTitle: "JWT Decoder — Decode JWT Header and Payload Locally | Developer Tools",
    seoDescription: "Decode JWT headers and payloads locally in your browser. Inspect expiry timestamps; decoding never verifies a signature.",
    icon: KeyRound,
    related: ["base64", "json-formatter", "json-validator"],
    primaryAction: "Decode JWT",
    outputLabel: "Decoded token",
    help: {
      what: "Splits a JWT into its three segments and decodes the header and payload from Base64URL in your browser.",
      useCases: ["Inspect token claims", "Check expiration timestamps", "Debug client-side authentication flows"],
      faqs: [
        { question: "Does decoding verify the token?", answer: "No. Anyone can decode a JWT payload. Trust requires signature verification against a known key and issuer." },
        { question: "Is the token sent anywhere?", answer: "No. This decoder works locally in the browser." },
      ],
    },
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    shortName: "Base64",
    category: "Security & Encoding",
    description: "Encode text as Base64 or safely decode Base64 and URL-safe Base64 locally.",
    seoTitle: "Base64 Encoder and Decoder — Local Browser Tool | Developer Tools",
    seoDescription: "Encode UTF-8 text to Base64 or decode standard and URL-safe Base64 locally in your browser.",
    icon: Code2,
    related: ["jwt-decoder", "json-formatter", "json-validator"],
    primaryAction: "Run conversion",
    outputLabel: "Conversion output",
    help: {
      what: "Converts UTF-8 text to Base64 or decodes standard and URL-safe Base64. Each transformation runs directly in your browser.",
      useCases: ["Inspect encoded values", "Create Base64 test data", "Decode URL-safe token fragments"],
      faqs: [
        { question: "Is Base64 encryption?", answer: "No. Base64 is an encoding; it does not protect the underlying content." },
        { question: "Does it support non-English text?", answer: "Yes. The tool encodes and decodes UTF-8 text." },
      ],
    },
  },
];

export const toolBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool])) as Record<ToolSlug, ToolDefinition>;

export const categories: ToolCategory[] = ["Data", "Security & Encoding"];

export const toolIcon = FileJson2;
export const localPrivacyIcon = ShieldCheck;
