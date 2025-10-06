import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Truck, CheckCircle, Clock, TrendingDown } from "lucide-react";

type DashboardFornecedoresProps = {
  userId: string;
};

export default function DashboardFornecedores({ userId }: DashboardFornecedoresProps) {
  const [fornecedoresPorTipo, setFornecedoresPorTipo] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalFornecedores: 0,
    ativos: 0,
    inativos: 0,
    prazoMedio: 0,
  });

  useEffect(() => {
    fetchFornecedoresData();
  }, [userId]);

  const fetchFornecedoresData = async () => {
    const { data: fornecedores } = await supabase
      .from("fornecedores")
      .select("*")
      .eq("user_id", userId);

    if (fornecedores) {
      // Fornecedores por tipo de material
      const porTipo = fornecedores.reduce((acc: any, fornecedor: any) => {
        const tipo = fornecedor.tipo_material || "Não informado";
        if (!acc[tipo]) {
          acc[tipo] = { tipo, total: 0 };
        }
        acc[tipo].total++;
        return acc;
      }, {});

      setFornecedoresPorTipo(Object.values(porTipo));

      // Estatísticas
      const ativos = fornecedores.filter(f => f.ativo).length;
      const prazoMedio = fornecedores.reduce((sum, f) => sum + (f.prazo_entrega_medio || 0), 0) / (fornecedores.length || 1);

      setStats({
        totalFornecedores: fornecedores.length,
        ativos,
        inativos: fornecedores.length - ativos,
        prazoMedio,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fornecedores</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFornecedores}</div>
            <p className="text-xs text-muted-foreground">Fornecedores cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ativos}</div>
            <p className="text-xs text-muted-foreground">Fornecedores ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inativos}</div>
            <p className="text-xs text-muted-foreground">Fornecedores inativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prazo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prazoMedio.toFixed(0)} dias</div>
            <p className="text-xs text-muted-foreground">Entrega média</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Fornecedores por Tipo de Material</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fornecedoresPorTipo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Fornecedores" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
