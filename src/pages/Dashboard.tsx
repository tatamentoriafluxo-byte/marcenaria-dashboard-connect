import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardVendas from "@/components/dashboard/DashboardVendas";
import DashboardLucro from "@/components/dashboard/DashboardLucro";
import DashboardProjetos from "@/components/dashboard/DashboardProjetos";
import DashboardProducao from "@/components/dashboard/DashboardProducao";
import DashboardEstoque from "@/components/dashboard/DashboardEstoque";
import DashboardClientes from "@/components/dashboard/DashboardClientes";
import DashboardFornecedores from "@/components/dashboard/DashboardFornecedores";
import DashboardFuncionarios from "@/components/dashboard/DashboardFuncionarios";
import DashboardMateriais from "@/components/dashboard/DashboardMateriais";
import DashboardVendedores from "@/components/dashboard/DashboardVendedores";
import DashboardCompras from "@/components/dashboard/DashboardCompras";
import DashboardMontagem from "@/components/dashboard/DashboardMontagem";
import DashboardFluxoCaixa from "@/components/dashboard/DashboardFluxoCaixa";
import DashboardContasPagar from "@/components/dashboard/DashboardContasPagar";
import DashboardContasReceber from "@/components/dashboard/DashboardContasReceber";
import DashboardCheques from "@/components/dashboard/DashboardCheques";
import DashboardMetas from "@/components/dashboard/DashboardMetas";
import DashboardFeedbacks from "@/components/dashboard/DashboardFeedbacks";
import DashboardParceiros from "@/components/dashboard/DashboardParceiros";
import DashboardOrcamentos from "@/components/dashboard/DashboardOrcamentos";
import { PainelSemaforo } from "@/components/alertas/PainelSemaforo";
import { BarChart3, TrendingUp, FolderKanban, Factory, Package, Users, Truck, UserCog, Box, UserCheck, ShoppingCart, Wrench, Wallet, Target, MessageSquare, Handshake, CreditCard, DollarSign, FileText, Calculator, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <Tabs defaultValue="alertas" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-1 mb-6 h-auto p-1">
          <TabsTrigger value="alertas" className="flex items-center gap-2 text-xs">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="orcamentos" className="flex items-center gap-2 text-xs">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Orçamentos</span>
          </TabsTrigger>
          <TabsTrigger value="vendas" className="flex items-center gap-2 text-xs">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Vendas</span>
          </TabsTrigger>
          <TabsTrigger value="lucro" className="flex items-center gap-2 text-xs">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Lucro</span>
          </TabsTrigger>
          <TabsTrigger value="projetos" className="flex items-center gap-2 text-xs">
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">Projetos</span>
          </TabsTrigger>
          <TabsTrigger value="compras" className="flex items-center gap-2 text-xs">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Compras</span>
          </TabsTrigger>
          <TabsTrigger value="estoque" className="flex items-center gap-2 text-xs">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Estoque</span>
          </TabsTrigger>
          <TabsTrigger value="producao" className="flex items-center gap-2 text-xs">
            <Factory className="h-4 w-4" />
            <span className="hidden sm:inline">Produção</span>
          </TabsTrigger>
          <TabsTrigger value="montagem" className="flex items-center gap-2 text-xs">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Montagem</span>
          </TabsTrigger>
          <TabsTrigger value="contaspagar" className="flex items-center gap-2 text-xs">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Pagar</span>
          </TabsTrigger>
          <TabsTrigger value="contasreceber" className="flex items-center gap-2 text-xs">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Receber</span>
          </TabsTrigger>
          <TabsTrigger value="cheques" className="flex items-center gap-2 text-xs">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Cheques</span>
          </TabsTrigger>
          <TabsTrigger value="fluxocaixa" className="flex items-center gap-2 text-xs">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Fluxo Caixa</span>
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-2 text-xs">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="flex items-center gap-2 text-xs">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Fornecedores</span>
          </TabsTrigger>
          <TabsTrigger value="funcionarios" className="flex items-center gap-2 text-xs">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Funcionários</span>
          </TabsTrigger>
          <TabsTrigger value="materiais" className="flex items-center gap-2 text-xs">
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">Materiais</span>
          </TabsTrigger>
          <TabsTrigger value="vendedores" className="flex items-center gap-2 text-xs">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Vendedores</span>
          </TabsTrigger>
          <TabsTrigger value="metas" className="flex items-center gap-2 text-xs">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Metas</span>
          </TabsTrigger>
          <TabsTrigger value="feedbacks" className="flex items-center gap-2 text-xs">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Feedbacks</span>
          </TabsTrigger>
          <TabsTrigger value="parceiros" className="flex items-center gap-2 text-xs">
            <Handshake className="h-4 w-4" />
            <span className="hidden sm:inline">Parceiros</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alertas">
          <PainelSemaforo showTitle={false} />
        </TabsContent>

        <TabsContent value="orcamentos">
          <DashboardOrcamentos userId={user!.id} />
        </TabsContent>

        <TabsContent value="vendas">
          <DashboardVendas userId={user!.id} />
        </TabsContent>

        <TabsContent value="lucro">
          <DashboardLucro userId={user!.id} />
        </TabsContent>

        <TabsContent value="projetos">
          <DashboardProjetos userId={user!.id} />
        </TabsContent>

        <TabsContent value="compras">
          <DashboardCompras userId={user!.id} />
        </TabsContent>

        <TabsContent value="estoque">
          <DashboardEstoque userId={user!.id} />
        </TabsContent>

        <TabsContent value="producao">
          <DashboardProducao userId={user!.id} />
        </TabsContent>

        <TabsContent value="montagem">
          <DashboardMontagem userId={user!.id} />
        </TabsContent>

        <TabsContent value="contaspagar">
          <DashboardContasPagar userId={user!.id} />
        </TabsContent>

        <TabsContent value="contasreceber">
          <DashboardContasReceber userId={user!.id} />
        </TabsContent>

        <TabsContent value="cheques">
          <DashboardCheques userId={user!.id} />
        </TabsContent>

        <TabsContent value="fluxocaixa">
          <DashboardFluxoCaixa userId={user!.id} />
        </TabsContent>

        <TabsContent value="clientes">
          <DashboardClientes userId={user!.id} />
        </TabsContent>

        <TabsContent value="fornecedores">
          <DashboardFornecedores userId={user!.id} />
        </TabsContent>

        <TabsContent value="funcionarios">
          <DashboardFuncionarios userId={user!.id} />
        </TabsContent>

        <TabsContent value="materiais">
          <DashboardMateriais userId={user!.id} />
        </TabsContent>

        <TabsContent value="vendedores">
          <DashboardVendedores userId={user!.id} />
        </TabsContent>

        <TabsContent value="metas">
          <DashboardMetas userId={user!.id} />
        </TabsContent>

        <TabsContent value="feedbacks">
          <DashboardFeedbacks userId={user!.id} />
        </TabsContent>

        <TabsContent value="parceiros">
          <DashboardParceiros userId={user!.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
