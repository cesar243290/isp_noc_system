import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Equipamentos from "./pages/Equipamentos";
import POPs from "./pages/POPs";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path={"/"}>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path={"/equipamentos"}>
        <DashboardLayout>
          <Equipamentos />
        </DashboardLayout>
      </Route>
      <Route path={"/pops"}>
        <DashboardLayout>
          <POPs />
        </DashboardLayout>
      </Route>
      <Route path={"/vlans"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">VLANs</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/interfaces"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Interfaces</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/ipam"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">IPAM</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/circuitos"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Circuitos</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/servicos"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Serviços</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/monitoramento"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Monitoramento</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/runbooks"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Runbooks</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/checklists"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Checklists</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/admin/usuarios"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/admin/auditoria"}>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Auditoria</h1>
            <p className="text-muted-foreground">Página em desenvolvimento</p>
          </div>
        </DashboardLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
