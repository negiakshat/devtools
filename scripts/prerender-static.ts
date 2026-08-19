import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  publicRoutes,
  renderRouteSeo,
  robotsTxt,
  sitemapXml,
} from "../server/seo";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const outputDir = path.join(projectRoot, "dist", "public");
const canonicalOrigin = "https://devtools.work.gd";

function outputFileForRoute(route: string) {
  return route === "/"
    ? path.join(outputDir, "index.html")
    : path.join(outputDir, route.slice(1), "index.html");
}

async function writeRouteHtml(shell: string, route: string) {
  const outputFile = outputFileForRoute(route);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(
    outputFile,
    renderRouteSeo(shell, canonicalOrigin, route),
    "utf8"
  );
}

async function prerender() {
  const shell = await readFile(path.join(outputDir, "index.html"), "utf8");

  await Promise.all(publicRoutes.map(route => writeRouteHtml(shell, route)));
  await writeRouteHtml(shell, "/404");
  await writeFile(
    path.join(outputDir, "404.html"),
    renderRouteSeo(shell, canonicalOrigin, "/404"),
    "utf8"
  );
  await writeFile(
    path.join(outputDir, "robots.txt"),
    robotsTxt(canonicalOrigin),
    "utf8"
  );
  await writeFile(
    path.join(outputDir, "sitemap.xml"),
    sitemapXml(canonicalOrigin),
    "utf8"
  );
}

prerender().catch((error: unknown) => {
  console.error("Static prerender failed.", error);
  process.exitCode = 1;
});
