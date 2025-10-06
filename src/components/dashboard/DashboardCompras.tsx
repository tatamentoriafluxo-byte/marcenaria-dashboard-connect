import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShoppingCart, DollarSign, Package, TrendingUp } from "lucide-react";

type DashboardComprasProps = {
  userId: string;
};

export default function DashboardCompras({ userId }: DashboardComprasProps) {
  const [comprasPorMes, setComprasPorMes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCompras: 0,
    valorTotal: 0,
    pendentes: 0,
    ticketMedio: 0,
  });

  useEffect(() => {
    fetchComprasData();
  }, [userId]);

  const fetchComprasData = async () => {
    const { data: compras } = await supabase
      .from("compras")
      .select("*")
      .eq("user_id", userId);

    if (compras) {
      // Compras por mês
      const porMes = compras.reduce((acc: any, compra: any) => {
        if (compra.data_compra) {
          const mes = new Date(compra.data_compra).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          if (!acc[mes]) {
            acc[mes] = { mes, total: 0, valor: 0 };
          }
          acc[mes].total++;
          acc[mes].valor += compra.valor_total || 0;
        }
        return acc;
      }, {});

      setComprasPorMes(Object.values(porMes));

      // Estatísticas
      const valorTotal = compras.reduce((sum, c) => sum + (c.valor_total || 0), 0);
      const pendentes = compras.filter(c => c.status === 'PENDENTE').length;
      const ticketMedio = valorTotal / (compras.length || 1);

      setStats({
        totalCompras: compras.length,
        valorTotal,
        pendentes,
        ticketMedio,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompras}</div>
            <p className="text-xs text-muted-foreground">Compras realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.valorTotal.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Total investido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardando entrega</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.ticketMedio.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Valor médio por compra</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comprasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: any) => value.toLocaleString('pt-BR')} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="total" stroke="#8884d8" name="Quantidade" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#82ca9d" name="Valor (R$)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
