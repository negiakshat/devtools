const toolMetadata = {
  "/json-formatter": ["JSON Formatter — Format and Validate JSON Locally | Developer Tools", "Format, validate, copy, and download JSON in your browser. No sign-up and no server upload required."],
  "/json-validator": ["JSON Validator — Find JSON Syntax Errors | Developer Tools", "Validate JSON locally, get a useful syntax diagnostic, and preview normalized output in your browser."],
  "/json-minifier": ["JSON Minifier — Compact JSON Locally | Developer Tools", "Minify valid JSON in your browser, compare character reduction, copy the result, or download it."],
  "/json-diff": ["JSON Diff — Compare JSON Objects and Arrays | Developer Tools", "Compare JSON A and JSON B locally. Review additions, removals, and changed values with a structural summary."],
  "/json-to-csv": ["JSON to CSV — Convert JSON Arrays to CSV | Developer Tools", "Convert JSON arrays to CSV locally. Preview flattened columns, copy the output, or download a CSV file."],
  "/json-to-yaml": ["JSON to YAML — Convert JSON to YAML Locally | Developer Tools", "Convert JSON to YAML in your browser, preview the output, copy it, or download a YAML file."],
  "/json-sorter": ["JSON Key Sorter — Sort JSON Keys Locally | Developer Tools", "Sort JSON object keys recursively in your browser. Preserve array order, choose key order, copy the result, or download sorted JSON."],
  "/json-to-typescript": ["JSON to TypeScript — Generate Interfaces Locally | Developer Tools", "Generate TypeScript interfaces or type aliases from JSON locally. Infer nested objects and arrays, then copy or download a .ts file."],
  "/json-schema-generator": ["JSON Schema Generator — Generate Schema from JSON Locally | Developer Tools", "Generate a Draft 2020-12 JSON Schema from JSON in your browser. Control observed required fields, then copy or download the schema."],
  "/jwt-decoder": ["JWT Decoder — Decode JWT Header and Payload Locally | Developer Tools", "Decode JWT headers and payloads locally in your browser. Inspect expiry timestamps; decoding never verifies a signature."],
  "/base64": ["Base64 Encoder and Decoder — Local Browser Tool | Developer Tools", "Encode UTF-8 text to Base64 or decode standard and URL-safe Base64 locally in your browser."],
} as const;

const toolFaqs: Partial<Record<keyof typeof toolMetadata, Array<{ question: string; answer: string }>>> = {
  "/json-formatter": [{ question: "Is my JSON uploaded?", answer: "No. This formatter performs its deterministic transformation in your browser." }, { question: "Why did formatting fail?", answer: "JSON requires double-quoted keys and strings, plus valid commas and brackets. The diagnostic points to the approximate location." }],
  "/json-validator": [{ question: "Does valid JSON mean my schema is correct?", answer: "No. It confirms syntax only; values can still be structurally unsuitable for a particular API or schema." }, { question: "Can it find line and column?", answer: "When the browser reports a character position, this tool translates it into an approximate line and column." }],
  "/json-minifier": [{ question: "Will it change string values?", answer: "No. String content is parsed first and then serialized safely." }, { question: "Can it minify invalid JSON?", answer: "No. It stops and provides a diagnostic, avoiding output that could corrupt data." }],
  "/json-diff": [{ question: "Are keys compared by position?", answer: "Object keys are compared by name. Array elements are compared by their index." }, { question: "Does the comparison leave my browser?", answer: "No. Both documents are parsed and compared locally." }],
  "/json-to-csv": [{ question: "What JSON structures work best?", answer: "An array of objects produces the clearest table. Primitive arrays and single objects are supported as a single value or row." }, { question: "How are nested arrays handled?", answer: "Arrays remain JSON inside one escaped CSV cell so data is not silently discarded." }],
  "/json-to-yaml": [{ question: "Can every YAML document be represented?", answer: "This conversion emits a pragmatic YAML subset for JSON-compatible data; JSON has no anchors, tags, or custom YAML types." }, { question: "Why are some values quoted?", answer: "Strings that could be misread as YAML booleans, dates, or control characters are quoted to preserve their JSON meaning." }],
  "/json-sorter": [{ question: "Does sorting change my data?", answer: "Object key order changes, but keys, values, types, and array positions remain intact. JSON object member order is not semantically meaningful." }, { question: "Are arrays sorted too?", answer: "No. Arrays keep their original order because positions can change an application’s meaning." }],
  "/json-to-typescript": [{ question: "Are the generated fields always required?", answer: "The output reflects fields observed in the supplied sample. Review optionality and domain constraints before using it as a production API contract." }, { question: "Does this send my API response to a server?", answer: "No. JSON parsing and declaration generation run locally in the browser." }],
  "/json-schema-generator": [{ question: "Does a generated schema fully describe my API?", answer: "No. A single sample can show observed structure, but it cannot prove every allowed value, optional field, or business rule. Review the generated schema before relying on it." }, { question: "Which JSON Schema draft is emitted?", answer: "The generated document declares the JSON Schema Draft 2020-12 meta-schema." }],
  "/jwt-decoder": [{ question: "Does decoding verify the token?", answer: "No. Anyone can decode a JWT payload. Trust requires signature verification against a known key and issuer." }, { question: "Is the token sent anywhere?", answer: "No. This decoder works locally in the browser." }],
  "/base64": [{ question: "Is Base64 encryption?", answer: "No. Base64 is an encoding; it does not protect the underlying content." }, { question: "Does it support non-English text?", answer: "Yes. The tool encodes and decodes UTF-8 text." }],
};

const pageMetadata = {
  "/": ["Developer Tools — Free, Local-First Browser Utilities", "Free browser-based developer utilities for JSON, data conversion, JWT inspection, and Base64 workflows. Process input locally with no account required."],
  "/about": ["Small utilities. Serious workflow. | Developer Tools", "Developer Tools is a browser-first collection of focused utilities for developers who want to inspect and transform common data formats without ceremony."],
  "/privacy": ["Privacy, stated plainly. | Developer Tools", "Developer Tools is designed so ordinary tool transformations run in your browser rather than requiring an account or a server upload."],
  "/contact": ["A real path for support. | Developer Tools", "This site intentionally has no fake contact form. Use the service support channel for hosting or project questions, and do not include sensitive tool input in a support request."],
} as const;

export const publicRoutes = [...Object.keys(pageMetadata), ...Object.keys(toolMetadata)] as const;

export type RouteSeo = {
  title: string;
  description: string;
  path: string;
  robots: "index, follow" | "noindex, nofollow";
  schemaType: "WebSite" | "WebApplication" | "WebPage";
  toolName?: string;
  h1: string;
};

function toolNameFromTitle(title: string) {
  return title.split(" — ")[0] ?? title;
}

export function routeSeo(path: string): RouteSeo {
  const tool = toolMetadata[path as keyof typeof toolMetadata];
  if (tool) {
    return { title: tool[0], description: tool[1], path, robots: "index, follow", schemaType: "WebApplication", toolName: toolNameFromTitle(tool[0]), h1: toolNameFromTitle(tool[0]) };
  }

  const page = pageMetadata[path as keyof typeof pageMetadata];
  if (page) {
    return { title: page[0], description: page[1], path, robots: "index, follow", schemaType: path === "/" ? "WebSite" : "WebPage", h1: path === "/" ? "Developer Tools" : page[0].replace(" | Developer Tools", "") };
  }

  return { title: "Workbench Not Found | Developer Tools", description: "The requested developer utility route is not available.", path: "/404", robots: "noindex, nofollow", schemaType: "WebPage", h1: "Workbench Not Found" };
}

export function requestOrigin(protocol: string, host: string, forwardedProtocol?: string) {
  const forwarded = forwardedProtocol?.split(",")[0]?.trim().toLowerCase();
  const scheme = forwarded === "https" ? "https" : protocol;
  return `${scheme}://${host}`;
}

function urlForRoute(origin: string, route: string) {
  const url = new URL(origin);
  const basePath = url.pathname.replace(/\/+$/, "");
  const routePath = route.replace(/^\/+/, "");
  const isIndexableRoute = publicRoutes.includes(route as (typeof publicRoutes)[number]);

  url.pathname = routePath
    ? `${basePath}/${routePath}${isIndexableRoute ? "/" : ""}`
    : `${basePath || ""}/`;
  return url.toString();
}

export function robotsTxt(origin: string) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${urlForRoute(origin, "sitemap.xml")}\n`;
}

export function sitemapXml(origin: string) {
  const urls = publicRoutes.map((route) => `  <url><loc>${urlForRoute(origin, route)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function serializeSchema(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function renderRouteSeo(html: string, origin: string, path: string) {
  const seo = routeSeo(path);
  const canonical = urlForRoute(origin, seo.path);
  const site = urlForRoute(origin, "/");
  const applicationSchema = seo.schemaType === "WebApplication"
    ? { "@context": "https://schema.org", "@type": "WebApplication", name: seo.toolName, description: seo.description, applicationCategory: "DeveloperApplication", operatingSystem: "Any", url: canonical, isAccessibleForFree: true, isPartOf: { "@type": "WebSite", name: "Developer Tools", url: site } }
    : { "@context": "https://schema.org", "@type": seo.schemaType, name: seo.title, description: seo.description, url: canonical, ...(seo.schemaType === "WebSite" ? {} : { isPartOf: { "@type": "WebSite", name: "Developer Tools", url: site } }) };
  const faqs = toolFaqs[path as keyof typeof toolFaqs];
  const schema = faqs
    ? { "@context": "https://schema.org", "@graph": [{ ...applicationSchema, "@context": undefined }, { "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }] }
    : applicationSchema;
  const tags = [
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${seo.robots}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<script type="application/ld+json" data-devtools-schema="true">${serializeSchema(schema)}</script>`,
  ].join("\n    ");
  const noScriptFaqs = faqs
    ? `<section><h2>${escapeHtml(`${seo.toolName} FAQs`)}</h2>${faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("")}</section>`
    : "";
  const noScript = `<noscript><main><h1>${escapeHtml(seo.h1)}</h1><p>${escapeHtml(seo.description)}</p>${noScriptFaqs}<p>JavaScript is required to run this browser-based utility.</p></main></noscript>`;
  return html
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*>/i, "")
    .replace("</head>", `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>${noScript}`);
}
