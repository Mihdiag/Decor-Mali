import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import QuotePage from "./pages/QuotePage";
import QuoteDetail from "./pages/QuoteDetail";
import AdminDashboard from "./pages/AdminDashboard";

// ---- tRPC + React Query (ajout) ----
import { trpc, trpcClientOptions } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/quote" component={QuotePage} />
      <Route path="/quote/:id" component={QuoteDetail} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // ---- tRPC + React Query (ajout) ----
  const queryClient = new QueryClient();
  const client = trpc.createClient(trpcClientOptions);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          {/* Providers tRPC + React Query (obligatoire pour les hooks tRPC) */}
          <trpc.Provider client={client} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <Router />
            </QueryClientProvider>
          </trpc.Provider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
