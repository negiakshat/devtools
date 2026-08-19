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
    const expectedHost = "https://negiakshat.github.io/devtools";
    const robots = readProjectFile("client/public/robots.txt");
    const sitemap = readProjectFile("client/public/sitemap.xml");
    const prerenderer = readProjectFile("scripts/prerender-static.ts");
    const documentHead = readProjectFile("client/src/components/DocumentHead.tsx");
    const netlifyConfig = readProjectFile("netlify.toml");

    expect(robots).toContain(`${expectedHost}/sitemap.xml`);
    expect(sitemap).toContain(`${expectedHost}/json-formatter`);
    expect(sitemap).not.toContain("https://devtools.manus.space");
    expect(prerenderer).toContain("process.env.VITE_SITE_ORIGIN");
    expect(documentHead).toContain("import.meta.env.VITE_SITE_ORIGIN");
    expect(netlifyConfig).toContain('VITE_SITE_ORIGIN = "https://rundevtools.netlify.app"');
  });

  it("keeps PWA manifest paths compatible with static subpath hosting", () => {
    const manifest = readProjectFile("client/public/manifest.webmanifest");

    expect(manifest).toContain('"start_url": "./"');
    expect(manifest).toContain('"src": "favicon.svg"');
    expect(manifest).not.toContain('"start_url": "/"');
    expect(manifest).not.toContain('"src": "/favicon.svg"');
  });

  it("does not require external analytics configuration for a static Pages deployment", () => {
    const html = readProjectFile("client/index.html");
    const workflow = readProjectFile(".github/workflows/deploy-pages.yml");

    expect(html).not.toContain("VITE_ANALYTICS_");
    expect(html).not.toContain("/umami");
    expect(workflow).not.toContain("VITE_ANALYTICS_");
    expect(workflow).not.toContain("Verify public analytics build variables");
  });
});
