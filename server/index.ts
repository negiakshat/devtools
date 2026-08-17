import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { publicRoutes, renderRouteSeo, requestOrigin, robotsTxt, sitemapXml } from "./seo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientRoutes = new Set(publicRoutes);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  const originFor = (req: express.Request) => requestOrigin(req.protocol, req.get("host") ?? "localhost", req.get("x-forwarded-proto"));
  app.get("/robots.txt", (req, res) => res.type("text/plain").send(robotsTxt(originFor(req))));
  app.get("/sitemap.xml", (req, res) => res.type("application/xml").send(sitemapXml(originFor(req))));
  app.use(express.static(staticPath));

  // Preserve client-side recovery while returning a real 404 for unknown paths.
  app.get("*", (req, res) => {
    const requestPath = req.path.length > 1 ? req.path.replace(/\/+$/, "") : req.path;
    const origin = originFor(req);
    const template = fs.readFileSync(path.join(staticPath, "index.html"), "utf8");
    res.status(clientRoutes.has(requestPath) ? 200 : 404).type("html").send(renderRouteSeo(template, origin, requestPath));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
