/** Precision Console design reminder: a dark developer workbench with route-level code splitting and tools as the primary content. */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { useWorkspacePreferences, WorkspacePreferencesProvider } from "./contexts/WorkspacePreferences";
import Home from "./pages/Home";
import TrustPage from "./pages/TrustPage";

const ToolRoute = lazy(() => import("./pages/ToolRoute"));

function RouteLoader() {
  return <div className="route-loader"><span className="pulse-dot" />Opening workbench…</div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/privacy"><TrustPage page="privacy" /></Route>
      <Route path="/about"><TrustPage page="about" /></Route>
      <Route path="/contact"><TrustPage page="contact" /></Route>
      <Route path="/:slug">{(params) => <Suspense fallback={<RouteLoader />}><ToolRoute slug={params.slug} /></Suspense>}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WorkspacePreferencesProvider><AppContent /></WorkspacePreferencesProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { resolvedTheme } = useWorkspacePreferences();
  return <TooltipProvider>
    <Toaster theme={resolvedTheme} position="bottom-right" />
    <Router />
  </TooltipProvider>;
}

export default App;
