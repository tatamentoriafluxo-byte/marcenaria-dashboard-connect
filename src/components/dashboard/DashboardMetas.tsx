import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Target, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

type DashboardMetasProps = {
  userId: string;
};

export default function DashboardMetas({ userId }: DashboardMetasProps) {
  const [metasPorMes, setMetasPorMes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMetas: 0,
    metaFaturamento: 0,
    realizadoFaturamento: 0,
    percentualAlcancado: 0,
  });

  useEffect(() => {
    fetchMetasData();
  }, [userId]);

  const fetchMetasData = async () => {
    const { data: metas } = await supabase
      .from("metas")
      .select("*")
      .eq("user_id", userId);

    const { data: projetos } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .not("valor_venda", "is", null);

    if (metas && projetos) {
      // Calcular metas por mês
      const metasComRealizacao = metas.map(meta => {
        const mesMeta = new Date(meta.mes_referencia);
        const mes = mesMeta.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

        // Projetos do mês
        const projetosMes = projetos.filter(p => {
          if (!p.data_venda) return false;
          const dataVenda = new Date(p.data_venda);
          return dataVenda.getMonth() === mesMeta.getMonth() && 
                 dataVenda.getFullYear() === mesMeta.getFullYear();
        });

        const faturamentoRealizado = projetosMes.reduce((sum, p) => sum + (p.valor_venda || 0), 0);
        const projetosRealizados = projetosMes.length;

        return {
          mes,
          metaFaturamento: meta.meta_faturamento || 0,
          realizadoFaturamento: faturamentoRealizado,
          metaProjetos: meta.meta_projetos || 0,
          realizadoProjetos: projetosRealizados,
        };
      });

      setMetasPorMes(metasComRealizacao);

      // Estatísticas do mês atual
      const hoje = new Date();
      const metaMesAtual = metas.find(m => {
        const mesMeta = new Date(m.mes_referencia);
        return mesMeta.getMonth() === hoje.getMonth() && 
               mesMeta.getFullYear() === hoje.getFullYear();
      });

      if (metaMesAtual) {
        const projetosMesAtual = projetos.filter(p => {
          if (!p.data_venda) return false;
          const dataVenda = new Date(p.data_venda);
          return dataVenda.getMonth() === hoje.getMonth() && 
                 dataVenda.getFullYear() === hoje.getFullYear();
        });

        const realizadoFaturamento = projetosMesAtual.reduce((sum, p) => sum + (p.valor_venda || 0), 0);
        const percentualAlcancado = (metaMesAtual.meta_faturamento || 0) > 0
          ? (realizadoFaturamento / metaMesAtual.meta_faturamento) * 100
          : 0;

        setStats({
          totalMetas: metas.length,
          metaFaturamento: metaMesAtual.meta_faturamento || 0,
          realizadoFaturamento,
          percentualAlcancado,
        });
      } else {
        setStats({
          totalMetas: metas.length,
          metaFaturamento: 0,
          realizadoFaturamento: 0,
          percentualAlcancado: 0,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMetas}</div>
            <p className="text-xs text-muted-foreground">Metas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meta do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.metaFaturamento.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Faturamento esperado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Realizado</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.realizadoFaturamento.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Faturamento atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Percentual Alcançado</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.percentualAlcancado.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Da meta mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Metas vs Realizado - Faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Legend />
              <Bar dataKey="metaFaturamento" fill="#8884d8" name="Meta" />
              <Bar dataKey="realizadoFaturamento" fill="#82ca9d" name="Realizado" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
