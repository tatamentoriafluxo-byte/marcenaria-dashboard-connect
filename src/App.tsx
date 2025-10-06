import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Projetos from "./pages/Projetos";
import NovoProjeto from "./pages/NovoProjeto";
import Vendedores from "./pages/Vendedores";
import Clientes from "./pages/Clientes";
import Funcionarios from "./pages/Funcionarios";
import Materiais from "./pages/Materiais";
import Estoque from "./pages/Estoque";
import Compras from "./pages/Compras";
import Fornecedores from "./pages/Fornecedores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1">{children}</main>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/projetos" element={<ProtectedRoute><AppLayout><Projetos /></AppLayout></ProtectedRoute>} />
          <Route path="/novo-projeto" element={<ProtectedRoute><AppLayout><NovoProjeto /></AppLayout></ProtectedRoute>} />
          <Route path="/vendedores" element={<ProtectedRoute><AppLayout><Vendedores /></AppLayout></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><AppLayout><Clientes /></AppLayout></ProtectedRoute>} />
          <Route path="/funcionarios" element={<ProtectedRoute><AppLayout><Funcionarios /></AppLayout></ProtectedRoute>} />
          <Route path="/materiais" element={<ProtectedRoute><AppLayout><Materiais /></AppLayout></ProtectedRoute>} />
          <Route path="/estoque" element={<ProtectedRoute><AppLayout><Estoque /></AppLayout></ProtectedRoute>} />
          <Route path="/compras" element={<ProtectedRoute><AppLayout><Compras /></AppLayout></ProtectedRoute>} />
          <Route path="/fornecedores" element={<ProtectedRoute><AppLayout><Fornecedores /></AppLayout></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
