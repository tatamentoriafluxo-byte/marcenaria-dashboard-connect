import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardVendas from "@/components/dashboard/DashboardVendas";
import DashboardLucro from "@/components/dashboard/DashboardLucro";
import DashboardProjetos from "@/components/dashboard/DashboardProjetos";
import DashboardProducao from "@/components/dashboard/DashboardProducao";
import DashboardEstoque from "@/components/dashboard/DashboardEstoque";
import { BarChart3, TrendingUp, FolderKanban, Factory, Package } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
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
      </Tabs>
    </div>
  );
}
