/** Precision Console design reminder: errors remain calm, compact, and provide an immediate navigation escape. */
import { Link } from "wouter";
import AppShell from "@/components/AppShell";
import DocumentHead from "@/components/DocumentHead";

export default function NotFound() {
  return <AppShell><DocumentHead page={{ path: "/404", title: "Workbench Not Found | Developer Tools", description: "The requested developer utility route is not available.", type: "WebPage", robots: "noindex, nofollow" }} /><section className="not-found"><p className="eyebrow">Route not found · 404</p><h1>This workbench does not exist.</h1><p>Choose a working utility from the tool rail or return to the directory.</p><Link href="/" className="primary-link">Return to tools</Link></section></AppShell>;
}
