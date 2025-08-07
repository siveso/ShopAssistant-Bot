import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Orders from "@/pages/orders";
import Users from "@/pages/users";
import Conversations from "@/pages/conversations";
import BotSettings from "@/pages/bot-settings";
import Translations from "@/pages/translations";
import Categories from "@/pages/categories";
import Reports from "@/pages/reports";
import Help from "@/pages/help";
import Marketing from "@/pages/marketing";
import Logout from "@/pages/logout";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import About from "@/pages/about";
import Home from "@/pages/home";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Public routes (accessible without authentication)
  return (
    <Switch>
      <Route path="/catalog" component={Catalog} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/about" component={About} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      {isAuthenticated ? (
        <>
          <Route path="/admin" component={Dashboard} />
          <Route path="/products" component={Products} />
          <Route path="/orders" component={Orders} />
          <Route path="/users" component={Users} />
          <Route path="/conversations" component={Conversations} />
          <Route path="/bot-settings" component={BotSettings} />
          <Route path="/translations" component={Translations} />
          <Route path="/categories" component={Categories} />
          <Route path="/reports" component={Reports} />
          <Route path="/help" component={Help} />
          <Route path="/marketing" component={Marketing} />
          <Route path="/logout" component={Logout} />
        </>
      ) : (
        <Route path="/admin" component={Login} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const { isAuthenticated } = useAuth();
  
  // Check if current route is a public route
  const isPublicRoute = window.location.pathname === '/' ||
                       window.location.pathname.startsWith('/catalog') || 
                       window.location.pathname.startsWith('/product/') ||
                       window.location.pathname === '/about' ||
                       window.location.pathname === '/home' ||
                       window.location.pathname === '/login';
  
  if (!isAuthenticated && !isPublicRoute) {
    return <Router />;
  }
  
  if (isPublicRoute) {
    return <Router />;
  }
  
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
        <CartProvider>
          <SidebarProvider>
            <Toaster />
            <AppLayout />
          </SidebarProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
