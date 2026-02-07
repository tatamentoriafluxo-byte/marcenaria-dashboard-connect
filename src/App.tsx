import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Projetos from "./pages/Projetos";
import NovoProjeto from "./pages/NovoProjeto";
import Vendedores from "./pages/Vendedores";
import Parceiros from "./pages/Parceiros";
import Clientes from "./pages/Clientes";
import Funcionarios from "./pages/Funcionarios";
import Materiais from "./pages/Materiais";
import Estoque from "./pages/Estoque";
import Compras from "./pages/Compras";
import Fornecedores from "./pages/Fornecedores";
import Ferramentas from "./pages/Ferramentas";
import Fretistas from "./pages/Fretistas";
import Producao from "./pages/Producao";
import Montagem from "./pages/Montagem";
import FluxoCaixa from "./pages/FluxoCaixa";
import ContasPagar from "./pages/ContasPagar";
import ContasReceber from "./pages/ContasReceber";
import Cheques from "./pages/Cheques";
import Metas from "./pages/Metas";
import Feedbacks from "./pages/Feedbacks";
import CapacidadeProducao from "./pages/CapacidadeProducao";
import DadosTeste from "./pages/DadosTeste";
import Orcamentos from "./pages/Orcamentos";
import CatalogoPrecos from "./pages/CatalogoPrecos";
import NovoOrcamento from "./pages/NovoOrcamento";
import ImportarDados from "./pages/ImportarDados";
import AnaliseFoto from "./pages/AnaliseFoto";
import AnalisePublica from "./pages/AnalisePublica";
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
          <Route path="/" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/projetos" element={<ProtectedRoute><AppLayout><Projetos /></AppLayout></ProtectedRoute>} />
          <Route path="/novo-projeto" element={<ProtectedRoute><AppLayout><NovoProjeto /></AppLayout></ProtectedRoute>} />
          <Route path="/vendedores" element={<ProtectedRoute><AppLayout><Vendedores /></AppLayout></ProtectedRoute>} />
          <Route path="/parceiros" element={<ProtectedRoute><AppLayout><Parceiros /></AppLayout></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><AppLayout><Clientes /></AppLayout></ProtectedRoute>} />
          <Route path="/funcionarios" element={<ProtectedRoute><AppLayout><Funcionarios /></AppLayout></ProtectedRoute>} />
          <Route path="/materiais" element={<ProtectedRoute><AppLayout><Materiais /></AppLayout></ProtectedRoute>} />
          <Route path="/estoque" element={<ProtectedRoute><AppLayout><Estoque /></AppLayout></ProtectedRoute>} />
          <Route path="/compras" element={<ProtectedRoute><AppLayout><Compras /></AppLayout></ProtectedRoute>} />
          <Route path="/fornecedores" element={<ProtectedRoute><AppLayout><Fornecedores /></AppLayout></ProtectedRoute>} />
          <Route path="/producao" element={<ProtectedRoute><AppLayout><Producao /></AppLayout></ProtectedRoute>} />
          <Route path="/montagem" element={<ProtectedRoute><AppLayout><Montagem /></AppLayout></ProtectedRoute>} />
          <Route path="/fluxo-caixa" element={<ProtectedRoute><AppLayout><FluxoCaixa /></AppLayout></ProtectedRoute>} />
          <Route path="/contas-pagar" element={<ProtectedRoute><AppLayout><ContasPagar /></AppLayout></ProtectedRoute>} />
          <Route path="/contas-receber" element={<ProtectedRoute><AppLayout><ContasReceber /></AppLayout></ProtectedRoute>} />
          <Route path="/cheques" element={<ProtectedRoute><AppLayout><Cheques /></AppLayout></ProtectedRoute>} />
          <Route path="/metas" element={<ProtectedRoute><AppLayout><Metas /></AppLayout></ProtectedRoute>} />
          <Route path="/feedbacks" element={<ProtectedRoute><AppLayout><Feedbacks /></AppLayout></ProtectedRoute>} />
          <Route path="/capacidade-producao" element={<ProtectedRoute><AppLayout><CapacidadeProducao /></AppLayout></ProtectedRoute>} />
          <Route path="/dados-teste" element={<ProtectedRoute><AppLayout><DadosTeste /></AppLayout></ProtectedRoute>} />
          <Route path="/ferramentas" element={<ProtectedRoute><AppLayout><Ferramentas /></AppLayout></ProtectedRoute>} />
          <Route path="/fretistas" element={<ProtectedRoute><AppLayout><Fretistas /></AppLayout></ProtectedRoute>} />
          <Route path="/orcamentos" element={<ProtectedRoute><AppLayout><Orcamentos /></AppLayout></ProtectedRoute>} />
          <Route path="/orcamentos/novo" element={<ProtectedRoute><AppLayout><NovoOrcamento /></AppLayout></ProtectedRoute>} />
          <Route path="/orcamentos/:id" element={<ProtectedRoute><AppLayout><NovoOrcamento /></AppLayout></ProtectedRoute>} />
          <Route path="/catalogo-precos" element={<ProtectedRoute><AppLayout><CatalogoPrecos /></AppLayout></ProtectedRoute>} />
          <Route path="/importar-dados" element={<ProtectedRoute><AppLayout><ImportarDados /></AppLayout></ProtectedRoute>} />
          <Route path="/analise-foto" element={<ProtectedRoute><AppLayout><AnaliseFoto /></AppLayout></ProtectedRoute>} />
          <Route path="/analise-publica/:linkId" element={<AnalisePublica />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
