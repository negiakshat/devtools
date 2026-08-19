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
  const schema = seo.schemaType === "WebApplication"
    ? { "@context": "https://schema.org", "@type": "WebApplication", name: seo.toolName, description: seo.description, applicationCategory: "DeveloperApplication", operatingSystem: "Any", url: canonical, isAccessibleForFree: true, isPartOf: { "@type": "WebSite", name: "Developer Tools", url: site } }
    : { "@context": "https://schema.org", "@type": seo.schemaType, name: seo.title, description: seo.description, url: canonical, ...(seo.schemaType === "WebSite" ? {} : { isPartOf: { "@type": "WebSite", name: "Developer Tools", url: site } }) };
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
  const noScript = `<noscript><main><h1>${escapeHtml(seo.h1)}</h1><p>${escapeHtml(seo.description)}</p><p>JavaScript is required to run this browser-based utility.</p></main></noscript>`;
  return html
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*>/i, "")
    .replace("</head>", `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>${noScript}`);
}
