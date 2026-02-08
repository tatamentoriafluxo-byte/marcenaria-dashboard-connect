import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Target, AlertCircle } from "lucide-react";
import { DashboardKPICard, DashboardFilter, type DashboardFilters } from "./ui";

type DashboardLucroProps = {
  userId: string;
};

export default function DashboardLucro({ userId }: DashboardLucroProps) {
  const [lucroMes, setLucroMes] = useState<any[]>([]);
  const [lucroVendedor, setLucroVendedor] = useState<any[]>([]);
  const [lucroPorAmbiente, setLucroPorAmbiente] = useState<any[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: null,
    vendedor: null,
  });
  const [stats, setStats] = useState({
    lucroTotal: 0,
    metaLucro: 0,
    lucroVsMeta: 0,
    atingimentoMeta: 0,
  });

  useEffect(() => {
    if (!userId) return;
    fetchLucroData();
  }, [userId, filters]);

  const fetchLucroData = async () => {
    if (!userId) return;

    // Buscar projetos com lucro calculado
    let query = supabase
      .from("resumo_projetos")
      .select("*")
      .eq("user_id", userId);

    // Aplicar filtros
    if (filters.periodo) {
      query = query
        .gte("data_venda", filters.periodo.from.toISOString().split('T')[0])
        .lte("data_venda", filters.periodo.to.toISOString().split('T')[0]);
    }
    if (filters.vendedor) {
      query = query.eq("vendedor_responsavel", filters.vendedor);
    }

    const { data: projetos } = await query;

    if (projetos) {
      let lucroTotal = 0;
      const lucrosPorMes: any = {};
      const lucrosPorVendedor: any = {};
      const lucrosPorAmbiente: any = {};

      projetos.forEach((projeto: any) => {
        const lucro = (projeto.lucro || 0);
        lucroTotal += lucro;

        // Lucro por mês
        if (projeto.data_venda) {
          const mes = new Date(projeto.data_venda).toLocaleDateString('pt-BR', { 
            month: '2-digit', 
            year: 'numeric' 
          });
          if (!lucrosPorMes[mes]) {
            lucrosPorMes[mes] = { mes, lucro: 0 };
          }
          lucrosPorMes[mes].lucro += lucro;
        }

        // Lucro por vendedor
        const vendedor = projeto.vendedor_nome || "Sem vendedor";
        if (!lucrosPorVendedor[vendedor]) {
          lucrosPorVendedor[vendedor] = { 
            vendedor, 
            lucro: 0, 
            telefone: projeto.cliente_telefone || "N/A",
            telefonePercentual: 0,
            valorVenda: 0 
          };
        }
        lucrosPorVendedor[vendedor].lucro += lucro;
        lucrosPorVendedor[vendedor].valorVenda += projeto.valor_venda || 0;

        // Lucro por ambiente
        const ambiente = projeto.ambiente || "Não informado";
        if (!lucrosPorAmbiente[ambiente]) {
          lucrosPorAmbiente[ambiente] = { ambiente, lucro: 0, percentual: 0 };
        }
        lucrosPorAmbiente[ambiente].lucro += lucro;
      });

      // Buscar meta de lucro
      const dataAtual = new Date();
      const mesReferencia = dataAtual.toISOString().split('T')[0].substring(0, 7); // yyyy-mm
      const { data: metas } = await supabase
        .from("metas")
        .select("meta_lucro")
        .eq("user_id", userId)
        .ilike("mes_referencia", `%${mesReferencia}%`)
        .single();

      const metaLucro = metas?.meta_lucro || 0;
      const lucroVsMeta = lucroTotal - metaLucro;
      const atingimentoMeta = metaLucro > 0 ? (lucroTotal / metaLucro) * 100 - 100 : 0;

      setLucroMes(Object.values(lucrosPorMes).sort((a: any, b: any) => 
        new Date(a.mes).getTime() - new Date(b.mes).getTime()
      ));

      // Calcular percentuais por ambiente
      const ambientesComPercentual = Object.values(lucrosPorAmbiente).map((amb: any) => ({
        ...amb,
        percentual: lucroTotal > 0 ? (amb.lucro / lucroTotal) * 100 : 0
      }));
      setLucroPorAmbiente(ambientesComPercentual);

      // Calcular percentuais por vendedor
      const vendedoresComPercentual = Object.values(lucrosPorVendedor)
        .sort((a: any, b: any) => b.lucro - a.lucro)
        .map((vend: any) => ({
          ...vend,
          telefonePercentual: lucroTotal > 0 ? (vend.lucro / lucroTotal) * 100 : 0
        }));
      setLucroVendedor(vendedoresComPercentual);

      setStats({
        lucroTotal,
        metaLucro,
        lucroVsMeta,
        atingimentoMeta,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dashboard-navy">RESUMO LUCRO</h2>
        <DashboardFilter 
          filters={filters} 
          onFilterChange={setFilters}
          showPeriodo
          showVendedor
        />
      </div>

      {/* KPIs principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardKPICard
          title="Total Lucro"
          value={`R$ ${(stats.lucroTotal / 1_000_000_000).toFixed(2)}B`}
          icon={TrendingUp}
          valueColor="default"
        />

        <DashboardKPICard
          title="Meta Lucro"
          value={`R$ ${(stats.metaLucro / 1000).toFixed(0)}k`}
          icon={Target}
          valueColor="default"
        />

        <DashboardKPICard
          title="Lucro x Meta"
          value={`R$ ${(stats.lucroVsMeta / 1000).toFixed(0)}k`}
          icon={AlertCircle}
          valueColor={stats.lucroVsMeta >= 0 ? "success" : "danger"}
        />

        <DashboardKPICard
          title="Atingimento Meta"
          value={`${stats.atingimentoMeta.toFixed(1)}%`}
          icon={Target}
          valueColor={stats.atingimentoMeta >= 0 ? "success" : "danger"}
        />
      </div>

      {/* Gráfico: Crescimento do lucro por mês */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Crescimento do Lucro por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lucroMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value: any) => `R$ ${(value / 1_000_000_000).toFixed(2)}B`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="lucro" 
                stroke="#f97316" 
                strokeWidth={2}
                name="Lucro"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela: Lucro e %Representatividade por Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Lucro e %Representatividade por Ambiente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-dashboard-navy text-white">
                <TableHead className="text-white">Ambiente</TableHead>
                <TableHead className="text-white text-right">Lucro</TableHead>
                <TableHead className="text-white text-right">% Representatividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lucroPorAmbiente.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.ambiente}</TableCell>
                  <TableCell className="text-right">R$ {(item.lucro / 1_000_000_000).toFixed(2)}B</TableCell>
                  <TableCell className="text-right">{item.percentual.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabela: Ranking Lucro por Vendedor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ranking Lucro por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-dashboard-navy text-white">
                <TableHead className="text-white">Vendedor</TableHead>
                <TableHead className="text-white">Telefone</TableHead>
                <TableHead className="text-white text-right">Telefone %</TableHead>
                <TableHead className="text-white text-right">Valor da Venda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lucroVendedor.map((vendedor, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{vendedor.vendedor}</TableCell>
                  <TableCell>{vendedor.telefone}</TableCell>
                  <TableCell className="text-right">{vendedor.telefonePercentual.toFixed(2)}%</TableCell>
                  <TableCell className="text-right font-medium text-dashboard-orange">
                    R$ {(vendedor.valorVenda / 1000).toFixed(0)}k
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}