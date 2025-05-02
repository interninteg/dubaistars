import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import BookTrip from "@/pages/BookTrip";
import Packages from "@/pages/Packages";
import Accommodations from "@/pages/Accommodations";
import AIAdvisor from "@/pages/AIAdvisor";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  return (
    <Layout>
      <Switch>
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/book" component={BookTrip} />
        <ProtectedRoute path="/packages" component={Packages} />
        <ProtectedRoute path="/accommodations" component={Accommodations} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/ai-advisor" component={AIAdvisor} />
        <Route path="/advisor" component={AIAdvisor} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
