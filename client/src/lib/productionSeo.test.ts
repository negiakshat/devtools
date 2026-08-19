import { describe, expect, it } from "vitest";
import { publicRoutes, renderRouteSeo, requestOrigin, robotsTxt, routeSeo, sitemapXml } from "../../../server/seo";

const shell = '<!doctype html><html><head><meta name="description" content="fallback" /><title>Fallback</title></head><body><div id="root"></div></body></html>';

describe("production SEO metadata", () => {
  it("lists exactly the implemented public page and utility routes", () => {
    expect(publicRoutes).toHaveLength(15);
    expect(publicRoutes).toContain("/json-formatter");
    expect(publicRoutes).toContain("/contact");
    expect(new Set(publicRoutes).size).toBe(publicRoutes.length);
  });

  it("gives every indexable route a unique title, description, and canonical URL", () => {
    const metadata = publicRoutes.map((path) => routeSeo(path));
    expect(metadata.every((item) => item.robots === "index, follow")).toBe(true);
    expect(new Set(metadata.map((item) => item.title)).size).toBe(metadata.length);
    expect(new Set(metadata.map((item) => item.description)).size).toBe(metadata.length);
    expect(new Set(metadata.map((item) => renderRouteSeo(shell, "https://devtools-gfrrrosv.manus.space", item.path).match(/rel="canonical" href="([^"]+)"/)?.[1])).size).toBe(metadata.length);
  });

  it("renders unique formatter metadata in the initial HTML response", () => {
    const html = renderRouteSeo(shell, "https://devtools-gfrrrosv.manus.space", "/json-formatter");
    expect(html).toContain("JSON Formatter — Format and Validate JSON Locally | Developer Tools");
    expect(html).toContain('rel="canonical" href="https://devtools-gfrrrosv.manus.space/json-formatter/"');
    expect(html).toContain('name="robots" content="index, follow"');
    expect(html).toContain('"@type":"WebApplication"');
    expect(html).toContain('<h1>JSON Formatter</h1>');
    expect(html).toContain('data-devtools-schema="true"');
  });

  it("keeps not-found pages non-indexable", () => {
    const html = renderRouteSeo(shell, "https://devtools-gfrrrosv.manus.space", "/not-a-tool");
    expect(routeSeo("/not-a-tool").robots).toBe("noindex, nofollow");
    expect(html).toContain('name="robots" content="noindex, nofollow"');
    expect(html).toContain('rel="canonical" href="https://devtools-gfrrrosv.manus.space/404"');
  });

  it("preserves HTTPS canonicals behind a TLS-terminating proxy", () => {
    expect(requestOrigin("http", "devtools-gfrrrosv.manus.space", "https")).toBe("https://devtools-gfrrrosv.manus.space");
    expect(requestOrigin("http", "localhost:3000")).toBe("http://localhost:3000");
  });

  it("generates crawler controls for the active production host", () => {
    const origin = "https://devtools-gfrrrosv.manus.space";
    expect(robotsTxt(origin)).toContain("Sitemap: https://devtools-gfrrrosv.manus.space/sitemap.xml");
    const sitemap = sitemapXml(origin);
    expect(sitemap.match(/<loc>/g)).toHaveLength(publicRoutes.length);
    expect(sitemap).toContain("https://devtools-gfrrrosv.manus.space/json-formatter/");
    expect(sitemap).not.toContain("not-a-tool");
  });

  it("uses directory URLs for indexable static pages while keeping crawler files exact", () => {
    const origin = "https://rundevtools.netlify.app";
    const html = renderRouteSeo(shell, origin, "/json-formatter");
    const sitemap = sitemapXml(origin);

    expect(html).toContain('rel="canonical" href="https://rundevtools.netlify.app/json-formatter/"');
    expect(sitemap).toContain("https://rundevtools.netlify.app/json-formatter/");
    expect(robotsTxt(origin)).toContain("Sitemap: https://rundevtools.netlify.app/sitemap.xml");
  });
});
