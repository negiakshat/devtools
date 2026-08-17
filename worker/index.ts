import {
  publicRoutes,
  renderRouteSeo,
  robotsTxt,
  sitemapXml,
} from "../server/seo";

type AssetsBinding = {
  fetch(input: Request | URL | string): Promise<Response>;
};

type Env = {
  ASSETS: AssetsBinding;
  RENDER_ORIGIN?: string;
};

const clientRoutes = new Set<string>(publicRoutes);

function normalizePathname(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function textResponse(body: string, contentType: string, request: Request) {
  return new Response(request.method === "HEAD" ? null : body, {
    headers: { "content-type": contentType },
  });
}

function isBackendPath(path: string) {
  return (
    path === "/api" ||
    path.startsWith("/api/") ||
    path.startsWith("/manus-storage/")
  );
}

async function proxyBackend(request: Request, env: Env) {
  if (!env.RENDER_ORIGIN) {
    return new Response("Backend service is unavailable.", { status: 503 });
  }

  let origin: URL;
  try {
    origin = new URL(env.RENDER_ORIGIN);
  } catch {
    return new Response("Backend service is unavailable.", { status: 503 });
  }

  if (origin.protocol !== "https:") {
    return new Response("Backend service is unavailable.", { status: 503 });
  }

  const incomingUrl = new URL(request.url);
  const target = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, origin);

  return fetch(new Request(target, request));
}

async function htmlResponse(
  request: Request,
  env: Env,
  status: 200 | 404,
  path: string
) {
  const template = await env.ASSETS.fetch(new URL("/index.html", request.url));
  const headers = new Headers(template.headers);
  headers.set("content-type", "text/html; charset=UTF-8");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  headers.delete("content-length");
  headers.delete("etag");

  const body =
    request.method === "HEAD"
      ? null
      : renderRouteSeo(await template.text(), new URL(request.url).origin, path);
  return new Response(body, { status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = normalizePathname(url.pathname);

    if (isBackendPath(path)) {
      return proxyBackend(request, env);
    }

    if (request.method === "GET" || request.method === "HEAD") {
      if (path === "/robots.txt") {
        return textResponse(
          robotsTxt(url.origin),
          "text/plain; charset=UTF-8",
          request
        );
      }

      if (path === "/sitemap.xml") {
        return textResponse(
          sitemapXml(url.origin),
          "application/xml; charset=UTF-8",
          request
        );
      }

      if (clientRoutes.has(path)) {
        return htmlResponse(request, env, 200, path);
      }

      if (/\.[a-z0-9]+$/i.test(path)) {
        return env.ASSETS.fetch(request);
      }

      return htmlResponse(request, env, 404, path);
    }

    return env.ASSETS.fetch(request);
  },
};
