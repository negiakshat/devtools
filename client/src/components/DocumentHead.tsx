import { useEffect } from "react";
import type { ToolDefinition } from "@/lib/toolRegistry";

export type PageMetadata = {
  path: string;
  title: string;
  description: string;
  type?: "WebPage" | "WebApplication" | "WebSite";
  robots?: "index, follow" | "noindex, nofollow";
};

const CANONICAL_ORIGIN = (
  import.meta.env.VITE_SITE_ORIGIN || "https://negiakshat.github.io/devtools"
).replace(/\/+$/, "");

function canonicalUrlForPath(path: string) {
  const url = new URL(CANONICAL_ORIGIN);
  const basePath = url.pathname.replace(/\/+$/, "");
  const routePath = path.replace(/^\/+/, "");
  const isIndexableRoute = routePath !== "404" && !routePath.includes(".");

  url.pathname = routePath
    ? `${basePath}/${routePath}${isIndexableRoute ? "/" : ""}`
    : `${basePath || ""}/`;
  return url.toString();
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertStructuredData(data: Record<string, unknown>) {
  let element = document.head.querySelector("script[data-devtools-schema]") as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.devtoolsSchema = "true";
    document.head.appendChild(element);
  }
  element.text = JSON.stringify(data);
}

function structuredDataForTool(tool: ToolDefinition, canonicalUrl: string, siteUrl: string) {
  const application = {
    "@type": "WebApplication",
    name: tool.name,
    description: tool.seoDescription,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: canonicalUrl,
    isAccessibleForFree: true,
    isPartOf: { "@type": "WebSite", name: "Developer Tools", url: siteUrl },
  };
  const faq = {
    "@type": "FAQPage",
    mainEntity: tool.help.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return { "@context": "https://schema.org", "@graph": [application, faq] };
}

// Precision Console: every route declares a clear intent, canonical URL, and small truthful schema payload.
export default function DocumentHead({ tool, page }: { tool?: ToolDefinition; page?: PageMetadata }) {
  useEffect(() => {
    const title = tool ? tool.seoTitle : page?.title ?? "Developer Tools — Fast, Free, Local-First Utilities";
    const description = tool ? tool.seoDescription : page?.description ?? "Fast, free browser utilities for formatting, validating, converting, and debugging developer data.";
    const path = tool ? `/${tool.slug}` : page?.path ?? "/";
    const robots = page?.robots ?? "index, follow";
    const canonicalUrl = canonicalUrlForPath(path);
    const siteUrl = canonicalUrlForPath("/");
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:type", "website");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "robots", robots);
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    upsertStructuredData(tool ? structuredDataForTool(tool, canonicalUrl, siteUrl) : page ? {
      "@context": "https://schema.org",
      "@type": page.type ?? "WebPage",
      name: title,
      description,
      url: canonicalUrl,
      isPartOf: { "@type": "WebSite", name: "Developer Tools", url: siteUrl },
    } : {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Developer Tools",
      description,
      url: canonicalUrl,
    });
  }, [tool, page]);
  return null;
}
