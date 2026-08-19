import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function readProjectFile(relativePath: string) {
  return readFileSync(fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)), "utf8");
}

describe("production hardening", () => {
  it("keeps development diagnostics out of production builds", () => {
    const viteConfig = readProjectFile("vite.config.ts");

    expect(viteConfig).toContain('name: "manus-debug-collector"');
    expect(viteConfig).toContain('apply: "serve"');
  });

  it("uses the configured production hostname in crawler assets", () => {
    const expectedHost = "https://devtools.work.gd";
    const robots = readProjectFile("client/public/robots.txt");
    const sitemap = readProjectFile("client/public/sitemap.xml");

    expect(robots).toContain(`${expectedHost}/sitemap.xml`);
    expect(sitemap).toContain(`${expectedHost}/json-formatter`);
    expect(sitemap).not.toContain("https://devtools.manus.space");
  });

  it("keeps PWA manifest paths compatible with static subpath hosting", () => {
    const manifest = readProjectFile("client/public/manifest.webmanifest");

    expect(manifest).toContain('"start_url": "./"');
    expect(manifest).toContain('"src": "favicon.svg"');
    expect(manifest).not.toContain('"start_url": "/"');
    expect(manifest).not.toContain('"src": "/favicon.svg"');
  });
});
