import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/hooks/use-sidebar";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Orders from "@/pages/orders";
import Users from "@/pages/users";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/orders" component={Orders} />
      <Route path="/users" component={Users} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Router />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <AppLayout />
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
