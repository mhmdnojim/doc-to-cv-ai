import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { getAppRedirectUrl } from "@/lib/app-url";
import Index from "./pages/Index.tsx";
import Templates from "./pages/Templates.tsx";
import Builder from "./pages/Builder.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";
import PagesChecker from "./pages/PagesChecker.tsx";

const queryClient = new QueryClient();
const HEALTH_MESSAGE_TYPE = "doc-to-cv-ai:github-pages-health";
const HEALTH_QUERY_PARAM = "gh_pages_health";

const GitHubPagesHealthReporter = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(HEALTH_QUERY_PARAM) !== "1" || window.parent === window) return;

    window.parent.postMessage(
      {
        type: HEALTH_MESSAGE_TYPE,
        ok: true,
        href: window.location.href,
        pathname: window.location.pathname,
        baseUrl: new URL(import.meta.env.BASE_URL || "/", window.location.origin).toString(),
        builderRedirectUrl: getAppRedirectUrl("builder"),
        timestamp: Date.now(),
      },
      "*"
    );
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GitHubPagesHealthReporter />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/pages-checker" element={<PagesChecker />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
