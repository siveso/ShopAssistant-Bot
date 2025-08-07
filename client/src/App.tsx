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
import Conversations from "@/pages/conversations";
import BotSettings from "@/pages/bot-settings";
import Translations from "@/pages/translations";
import Reports from "@/pages/reports";
import Help from "@/pages/help";
import Logout from "@/pages/logout";
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
      <Route path="/conversations" component={Conversations} />
      <Route path="/bot-settings" component={BotSettings} />
      <Route path="/translations" component={Translations} />
      <Route path="/reports" component={Reports} />
      <Route path="/help" component={Help} />
      <Route path="/logout" component={Logout} />
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
