import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UserCheck, Users, Target, TrendingUp } from "lucide-react";

type DashboardVendedoresProps = {
  userId: string;
};

export default function DashboardVendedores({ userId }: DashboardVendedoresProps) {
  const [performanceVendedores, setPerformanceVendedores] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVendedores: 0,
    ativos: 0,
    comissaoMedia: 0,
    metaMedia: 0,
  });

  useEffect(() => {
    fetchVendedoresData();
  }, [userId]);

  const fetchVendedoresData = async () => {
    const { data: vendedores } = await supabase
      .from("vendedores")
      .select("*")
      .eq("user_id", userId);

    if (vendedores) {
      // Buscar projetos para calcular performance
      const { data: projetos } = await supabase
        .from("projects")
        .select("vendedor_responsavel, valor_venda")
        .eq("user_id", userId)
        .not("valor_venda", "is", null);

      const performance: any = {};

      vendedores.forEach(vendedor => {
        const vendas = projetos?.filter(p => p.vendedor_responsavel === vendedor.nome) || [];
        const totalVendas = vendas.reduce((sum, v) => sum + (v.valor_venda || 0), 0);

        performance[vendedor.nome] = {
          vendedor: vendedor.nome,
          total: totalVendas,
          quantidade: vendas.length,
        };
      });

      setPerformanceVendedores(Object.values(performance));

      // Estatísticas
      const ativos = vendedores.filter(v => v.ativo).length;
      const comissaoMedia = vendedores.reduce((sum, v) => sum + (v.comissao_percentual || 0), 0) / (vendedores.length || 1);
      const metaMedia = vendedores.reduce((sum, v) => sum + (v.meta_mensal || 0), 0) / (vendedores.length || 1);

      setStats({
        totalVendedores: vendedores.length,
        ativos,
        comissaoMedia,
        metaMedia,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vendedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendedores}</div>
            <p className="text-xs text-muted-foreground">Vendedores cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ativos}</div>
            <p className="text-xs text-muted-foreground">Vendedores ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comissão Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comissaoMedia.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Percentual médio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meta Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.metaMedia.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Meta mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Performance dos Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceVendedores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendedor" />
              <YAxis />
              <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total Vendido" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
