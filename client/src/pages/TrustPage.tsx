import { Link } from "wouter";
import { ArrowUpRight, FileText, Mail, ShieldCheck, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import DocumentHead from "@/components/DocumentHead";

// Precision Console: trust pages are compact operating notes, not a marketing detour from the workbench.
type TrustPageKind = "privacy" | "about" | "contact";

const pageContent: Record<TrustPageKind, { eyebrow: string; title: string; lede: string; icon: typeof ShieldCheck; sections: Array<{ title: string; body: string }> }> = {
  privacy: {
    eyebrow: "Trust / data handling",
    title: "Privacy, stated plainly.",
    lede: "Developer Tools is designed so ordinary tool transformations run in your browser rather than requiring an account or a server upload.",
    icon: ShieldCheck,
    sections: [
      { title: "Tool input", body: "The application does not send JSON, JWT, Base64, CSV, or YAML input to a remote service in order to format, validate, convert, compare, encode, or decode it. Input remains in the browser tab while you work." },
      { title: "Storage and retention", body: "This version does not provide accounts, cloud workspaces, or a feature that saves your tool input to long-term browser storage. Closing or refreshing the tab clears in-memory tool content." },
      { title: "Analytics and hosting", body: "The hosted environment may use privacy-conscious traffic analytics and standard infrastructure logs to understand aggregate usage and operate the service. Product events can record a tool name, action, outcome, and navigation source, but never pasted or loaded text, transformed output, JWTs, Base64, JSON, clipboard contents, file names, parser messages, or error stacks. Providers can process technical information such as device, browser, IP-derived network data, and page requests under their own policies." },
      { title: "Cookies and choices", body: "The tool interface does not require application cookies to run its core utilities. Browser, hosting, or analytics providers may use essential storage or similar mechanisms. You can limit these using browser privacy controls or extensions." },
      { title: "Third parties", body: "External resources are limited to the hosting environment, loaded fonts, and the configured analytics endpoint. Developer Tools does not sell tool input or use it to train a model." },
    ],
  },
  about: {
    eyebrow: "About / operating principles",
    title: "Small utilities. Serious workflow.",
    lede: "Developer Tools is a browser-first collection of focused utilities for developers who want to inspect and transform common data formats without ceremony.",
    icon: Sparkles,
    sections: [
      { title: "What it is", body: "A practical workbench for routine tasks such as formatting JSON, checking syntax, comparing documents, converting data, decoding JWT content, and handling Base64." },
      { title: "Who it is for", body: "People building, debugging, reviewing, or integrating software—especially when a quick, readable answer is more useful than installing a dependency or handing data to an unfamiliar service." },
      { title: "Why it exists", body: "Routine developer work benefits from tools that open quickly, explain their state clearly, and remain useful with keyboard input, small screens, and long documents." },
      { title: "Free-first philosophy", body: "The platform is built around accessible browser utilities with no account requirement for the core workflows. The goal is practical utility, not artificial usage gates." },
    ],
  },
  contact: {
    eyebrow: "Contact / service questions",
    title: "A real path for support.",
    lede: "This site intentionally has no fake contact form. Use the service support channel for hosting or project questions, and do not include sensitive tool input in a support request.",
    icon: Mail,
    sections: [
      { title: "Hosted service support", body: "For questions about this hosted workspace, account access, or site behavior, use the linked support channel below. Include the page URL, a short reproduction path, and any non-sensitive error detail." },
      { title: "Security and privacy", body: "Do not paste credentials, private keys, access tokens, production JWTs, or sensitive source data into a support message. If you believe you found a security concern, describe the behavior without attaching confidential input." },
      { title: "No outbound form", body: "A contact form that silently discards messages is not useful. This page links to the service’s real help destination instead." },
    ],
  },
};

export default function TrustPage({ page }: { page: TrustPageKind }) {
  const content = pageContent[page];
  const Icon = content.icon;
  return <AppShell>
    <DocumentHead page={{ path: `/${page}`, title: `${content.title} | Developer Tools`, description: content.lede, type: "WebPage" }} />
    <article className="trust-page">
      <header className="trust-heading">
        <div className="trust-heading-icon"><Icon size={26} /></div>
        <div><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p>{content.lede}</p></div>
      </header>
      <section className="trust-runtime-strip" aria-label="Policy operating context"><span><i />ROUTE / {page.toUpperCase()}</span><span>EXECUTION / BROWSER</span><span>INPUT STATE / VOLATILE</span><b>[•] POLICY LOADED</b></section>
      <div className="trust-layout">
        <div className="trust-content">
          {content.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}
          {page === "contact" && <a className="primary-link trust-contact-link" href="https://help.manus.im" target="_blank" rel="noreferrer">Open service support <ArrowUpRight size={15} /></a>}
        </div>
        <aside className="trust-aside"><FileText size={17} /><div><p>[•] WORKBENCH POLICY</p><span>These pages describe the behavior of this static client application. They are updated with the product, not hidden in a modal.</span></div><dl className="trust-aside-data"><div><dt>PROCESS</dt><dd>IN-BROWSER</dd></div><div><dt>RETENTION</dt><dd>SESSION MEMORY</dd></div></dl>{page !== "privacy" && <Link href="/privacy" className="text-link">Read privacy details <ArrowUpRight size={14} /></Link>}</aside>
      </div>
    </article>
  </AppShell>;
}
