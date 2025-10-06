import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, ShoppingCart, Target } from "lucide-react";

type DashboardVendasProps = {
  userId: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardVendas({ userId }: DashboardVendasProps) {
  const [vendasMes, setVendasMes] = useState<any[]>([]);
  const [vendasVendedor, setVendasVendedor] = useState<any[]>([]);
  const [origemLeads, setOrigemLeads] = useState<any[]>([]);
  const [stats, setStats] = useState({
    faturamentoTotal: 0,
    ticketMedio: 0,
    totalVendas: 0,
    metaMensal: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    // Buscar dados de vendas por mês
    const { data: vendasData } = await supabase
      .from("projects")
      .select("data_venda, valor_venda")
      .eq("user_id", userId)
      .not("data_venda", "is", null)
      .not("valor_venda", "is", null)
      .gte("data_venda", new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

    if (vendasData) {
      const vendasPorMes = vendasData.reduce((acc: any, venda: any) => {
        const mes = new Date(venda.data_venda).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        if (!acc[mes]) acc[mes] = 0;
        acc[mes] += venda.valor_venda;
        return acc;
      }, {});

      setVendasMes(Object.entries(vendasPorMes).map(([mes, valor]) => ({ mes, valor })));
    }

    // Buscar vendas por vendedor
    const { data: vendedoresData } = await supabase
      .from("projects")
      .select("vendedor_responsavel, valor_venda")
      .eq("user_id", userId)
      .not("valor_venda", "is", null);

    if (vendedoresData) {
      const vendasPorVendedor = vendedoresData.reduce((acc: any, venda: any) => {
        const vendedor = venda.vendedor_responsavel || "Sem vendedor";
        if (!acc[vendedor]) acc[vendedor] = 0;
        acc[vendedor] += venda.valor_venda;
        return acc;
      }, {});

      setVendasVendedor(Object.entries(vendasPorVendedor).map(([vendedor, valor]) => ({ vendedor, valor })));
    }

    // Buscar origem dos leads
    const { data: leadsData } = await supabase
      .from("projects")
      .select("origem_lead")
      .eq("user_id", userId);

    if (leadsData) {
      const origemCount = leadsData.reduce((acc: any, lead: any) => {
        const origem = lead.origem_lead || "Outros";
        if (!acc[origem]) acc[origem] = 0;
        acc[origem]++;
        return acc;
      }, {});

      setOrigemLeads(Object.entries(origemCount).map(([name, value]) => ({ name, value })));
    }

    // Calcular estatísticas
    const { data: statsData } = await supabase
      .from("projects")
      .select("valor_venda")
      .eq("user_id", userId)
      .not("valor_venda", "is", null);

    if (statsData && statsData.length > 0) {
      const total = statsData.reduce((sum, p) => sum + p.valor_venda, 0);
      setStats({
        faturamentoTotal: total,
        ticketMedio: total / statsData.length,
        totalVendas: statsData.length,
        metaMensal: 100000, // Valor exemplo - pode buscar da tabela metas
      });
    }
  };

  const percentualMeta = (stats.faturamentoTotal / stats.metaMensal) * 100;

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.faturamentoTotal.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              {percentualMeta.toFixed(0)}% da meta mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.ticketMedio.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Por venda realizada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendas}</div>
            <p className="text-xs text-muted-foreground">Vendas concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.metaMensal.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Objetivo do mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vendasMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#8884d8" name="Faturamento" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendasVendedor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendedor" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="valor" fill="#82ca9d" name="Faturamento" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Origem dos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={origemLeads}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {origemLeads.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desempenho vs Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Faturamento Atual</span>
                  <span className="text-sm font-medium">R$ {stats.faturamentoTotal.toLocaleString('pt-BR')}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(percentualMeta, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {percentualMeta > 100 ? `Meta superada em ${(percentualMeta - 100).toFixed(1)}%` : `Faltam ${(100 - percentualMeta).toFixed(1)}% para atingir a meta`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
