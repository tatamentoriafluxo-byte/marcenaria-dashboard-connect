import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingDown, Percent, AlertCircle } from "lucide-react";

type DashboardLucroProps = {
  userId: string;
};

export default function DashboardLucro({ userId }: DashboardLucroProps) {
  const [lucroMes, setLucroMes] = useState<any[]>([]);
  const [lucroVendedor, setLucroVendedor] = useState<any[]>([]);
  const [stats, setStats] = useState({
    lucroTotal: 0,
    margemMedia: 0,
    custoTotal: 0,
    receitaTotal: 0,
  });

  useEffect(() => {
    fetchLucroData();
  }, [userId]);

  const fetchLucroData = async () => {
    // Buscar projetos com lucro calculado
    const { data: projetos } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .not("valor_venda", "is", null);

    if (projetos) {
      let lucroTotal = 0;
      let custoTotal = 0;
      let receitaTotal = 0;
      const lucrosPorMes: any = {};
      const lucrosPorVendedor: any = {};

      projetos.forEach((projeto: any) => {
        const lucro = (projeto.valor_venda || 0) - (projeto.custo_materiais || 0) - (projeto.custo_mao_obra || 0) - (projeto.outros_custos || 0);
        const custo = (projeto.custo_materiais || 0) + (projeto.custo_mao_obra || 0) + (projeto.outros_custos || 0);
        const receita = projeto.valor_venda || 0;

        lucroTotal += lucro;
        custoTotal += custo;
        receitaTotal += receita;

        // Lucro por mês
        if (projeto.data_venda) {
          const mes = new Date(projeto.data_venda).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          if (!lucrosPorMes[mes]) {
            lucrosPorMes[mes] = { mes, lucro: 0, receita: 0, custo: 0 };
          }
          lucrosPorMes[mes].lucro += lucro;
          lucrosPorMes[mes].receita += receita;
          lucrosPorMes[mes].custo += custo;
        }

        // Lucro por vendedor
        const vendedor = projeto.vendedor_responsavel || "Sem vendedor";
        if (!lucrosPorVendedor[vendedor]) {
          lucrosPorVendedor[vendedor] = { vendedor, lucro: 0 };
        }
        lucrosPorVendedor[vendedor].lucro += lucro;
      });

      setLucroMes(Object.values(lucrosPorMes));
      setLucroVendedor(Object.values(lucrosPorVendedor));

      const margemMedia = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;

      setStats({
        lucroTotal,
        margemMedia,
        custoTotal,
        receitaTotal,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.lucroTotal.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Lucro acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.margemMedia.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Margem de lucro média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.custoTotal.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Custos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.receitaTotal.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Receita total</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Evolução: Receita, Custo e Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={lucroMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Line type="monotone" dataKey="receita" stroke="#82ca9d" name="Receita" strokeWidth={2} />
                <Line type="monotone" dataKey="custo" stroke="#ff8042" name="Custo" strokeWidth={2} />
                <Line type="monotone" dataKey="lucro" stroke="#8884d8" name="Lucro" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lucro por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lucroVendedor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendedor" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="lucro" fill="#8884d8" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composição dos Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Materiais</span>
                  <span className="text-sm font-medium">
                    {stats.custoTotal > 0 ? ((stats.custoTotal * 0.6 / stats.custoTotal) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Mão de Obra</span>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "30%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Outros Custos</span>
                  <span className="text-sm font-medium">10%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "10%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
