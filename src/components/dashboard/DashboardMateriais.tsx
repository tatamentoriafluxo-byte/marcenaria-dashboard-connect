import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, Layers, DollarSign, TrendingUp } from "lucide-react";

type DashboardMateriaisProps = {
  userId: string;
};

export default function DashboardMateriais({ userId }: DashboardMateriaisProps) {
  const [materiaisPorTipo, setMateriaisPorTipo] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMateriais: 0,
    tiposUnicos: 0,
    precoMedio: 0,
    valorEstoque: 0,
  });

  useEffect(() => {
    fetchMateriaisData();
  }, [userId]);

  const fetchMateriaisData = async () => {
    const { data: materiais } = await supabase
      .from("materiais")
      .select("*")
      .eq("user_id", userId);

    if (materiais) {
      // Materiais por tipo
      const porTipo = materiais.reduce((acc: any, material: any) => {
        const tipo = material.tipo || "Não informado";
        if (!acc[tipo]) {
          acc[tipo] = { tipo, total: 0 };
        }
        acc[tipo].total++;
        return acc;
      }, {});

      setMateriaisPorTipo(Object.values(porTipo));

      // Estatísticas
      const precoMedio = materiais.reduce((sum, m) => sum + (m.preco_medio || 0), 0) / (materiais.length || 1);
      const tiposUnicos = new Set(materiais.map(m => m.tipo)).size;

      // Buscar estoque para calcular valor
      const { data: estoque } = await supabase
        .from("estoque")
        .select("quantidade_atual, material_id")
        .eq("user_id", userId);

      let valorEstoque = 0;
      if (estoque) {
        estoque.forEach(e => {
          const material = materiais.find(m => m.id === e.material_id);
          if (material) {
            valorEstoque += e.quantidade_atual * (material.preco_medio || 0);
          }
        });
      }

      setStats({
        totalMateriais: materiais.length,
        tiposUnicos,
        precoMedio,
        valorEstoque,
      });
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMateriais}</div>
            <p className="text-xs text-muted-foreground">Materiais cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tipos Únicos</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tiposUnicos}</div>
            <p className="text-xs text-muted-foreground">Categorias diferentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.precoMedio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor médio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.valorEstoque.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Capital em estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Materiais por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={materiaisPorTipo}
                dataKey="total"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {materiaisPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
