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
import DashboardMetas from "@/components/dashboard/DashboardMetas";
import DashboardFeedbacks from "@/components/dashboard/DashboardFeedbacks";
import { BarChart3, TrendingUp, FolderKanban, Factory, Package, Users, Truck, UserCog, Box, UserCheck, ShoppingCart, Wrench, Wallet, Target, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 mb-6 h-auto flex-wrap">
          <TabsTrigger value="vendas" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="lucro" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Lucro
          </TabsTrigger>
          <TabsTrigger value="projetos" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Projetos
          </TabsTrigger>
          <TabsTrigger value="producao" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Produção
          </TabsTrigger>
          <TabsTrigger value="estoque" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="funcionarios" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Funcionários
          </TabsTrigger>
          <TabsTrigger value="materiais" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Materiais
          </TabsTrigger>
          <TabsTrigger value="vendedores" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Vendedores
          </TabsTrigger>
          <TabsTrigger value="compras" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Compras
          </TabsTrigger>
          <TabsTrigger value="montagem" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Montagem
          </TabsTrigger>
          <TabsTrigger value="fluxocaixa" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="metas" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="feedbacks" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedbacks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendas">
          <DashboardVendas userId={user!.id} />
        </TabsContent>

        <TabsContent value="lucro">
          <DashboardLucro userId={user!.id} />
        </TabsContent>

        <TabsContent value="projetos">
          <DashboardProjetos userId={user!.id} />
        </TabsContent>

        <TabsContent value="producao">
          <DashboardProducao userId={user!.id} />
        </TabsContent>

        <TabsContent value="estoque">
          <DashboardEstoque userId={user!.id} />
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

        <TabsContent value="compras">
          <DashboardCompras userId={user!.id} />
        </TabsContent>

        <TabsContent value="montagem">
          <DashboardMontagem userId={user!.id} />
        </TabsContent>

        <TabsContent value="fluxocaixa">
          <DashboardFluxoCaixa userId={user!.id} />
        </TabsContent>

        <TabsContent value="metas">
          <DashboardMetas userId={user!.id} />
        </TabsContent>

        <TabsContent value="feedbacks">
          <DashboardFeedbacks userId={user!.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
