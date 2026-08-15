import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientRoutes = new Set([
  "/",
  "/json-formatter",
  "/json-validator",
  "/json-minifier",
  "/json-diff",
  "/json-to-csv",
  "/json-to-yaml",
  "/json-sorter",
  "/json-to-typescript",
  "/json-schema-generator",
  "/jwt-decoder",
  "/base64",
  "/about",
  "/privacy",
  "/contact",
]);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Preserve client-side recovery while returning a real 404 for unknown paths.
  app.get("*", (req, res) => {
    const requestPath = req.path.length > 1 ? req.path.replace(/\/+$/, "") : req.path;
    res.status(clientRoutes.has(requestPath) ? 200 : 404).sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
