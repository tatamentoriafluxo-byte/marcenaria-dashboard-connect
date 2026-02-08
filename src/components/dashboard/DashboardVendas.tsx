import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from "recharts";
import { DollarSign, TrendingUp, FileText, XCircle } from "lucide-react";
import { DashboardKPICard, DashboardTable, DashboardFilter, type Column, type DashboardFilters, type FilterOption } from "./ui";
import { startOfMonth, subMonths, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DashboardVendasProps = {
  userId: string;
};

const CHART_COLORS = {
  SALA: "hsl(var(--dashboard-orange))",
  COZINHA: "hsl(var(--dashboard-navy))",
  "QUARTO CASAL": "hsl(var(--dashboard-success))",
  "QUARTO SOLTEIRO": "hsl(var(--dashboard-info))",
  BANHEIRO: "hsl(var(--dashboard-warning))",
  OUTROS: "hsl(var(--muted-foreground))",
};

interface VendedorRanking {
  vendedor: string;
  valorVenda: number;
  quantidade: number;
}

interface ClienteRanking {
  cliente: string;
  valorVenda: number;
  quantidade: number;
}

interface AmbienteData {
  ambiente: string;
  valorVenda: number;
  quantidade: number;
}

export default function DashboardVendas({ userId }: DashboardVendasProps) {
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: {
      from: startOfMonth(subMonths(new Date(), 6)),
      to: endOfMonth(new Date()),
    },
    vendedor: null,
  });

  const [vendasMes, setVendasMes] = useState<any[]>([]);
  const [crescimentoPorAmbiente, setCrescimentoPorAmbiente] = useState<any[]>([]);
  const [vendasPorAmbiente, setVendasPorAmbiente] = useState<AmbienteData[]>([]);
  const [rankingVendedores, setRankingVendedores] = useState<VendedorRanking[]>([]);
  const [rankingClientes, setRankingClientes] = useState<ClienteRanking[]>([]);
  const [vendedorOptions, setVendedorOptions] = useState<FilterOption[]>([]);
  const [stats, setStats] = useState({
    totalVendas: 0,
    totalOrcamentos: 0,
    vendaMaisOrcamento: 0,
    totalPerdido: 0,
    metaMensal: 100000,
    quantidadeVendas: 0,
  });

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId, filters]);

  const fetchDashboardData = async () => {
    // Build base query conditions
    let dateCondition = {};
    if (filters.periodo) {
      dateCondition = {
        gte: filters.periodo.from.toISOString(),
        lte: filters.periodo.to.toISOString(),
      };
    }

    // Fetch vendedores for filter options
    const { data: vendedoresData } = await supabase
      .from("vendedores")
      .select("id, nome")
      .eq("user_id", userId)
      .eq("ativo", true);

    if (vendedoresData) {
      setVendedorOptions(
        vendedoresData.map((v) => ({ value: v.nome, label: v.nome }))
      );
    }

    // Fetch projects data
    let projectsQuery = supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId);

    if (filters.periodo) {
      projectsQuery = projectsQuery
        .gte("data_venda", filters.periodo.from.toISOString().split("T")[0])
        .lte("data_venda", filters.periodo.to.toISOString().split("T")[0]);
    }

    if (filters.vendedor) {
      projectsQuery = projectsQuery.eq("vendedor_responsavel", filters.vendedor);
    }

    const { data: projectsData } = await projectsQuery;

    // Fetch orcamentos data
    let orcamentosQuery = supabase
      .from("orcamentos")
      .select("*")
      .eq("user_id", userId);

    if (filters.periodo) {
      orcamentosQuery = orcamentosQuery
        .gte("data_orcamento", filters.periodo.from.toISOString().split("T")[0])
        .lte("data_orcamento", filters.periodo.to.toISOString().split("T")[0]);
    }

    const { data: orcamentosData } = await orcamentosQuery;

    if (projectsData) {
      // Calculate stats
      const vendasConcluidas = projectsData.filter(
        (p) => (p.status === "CONVERTIDO" || p.status === "ENTREGUE") && p.valor_venda
      );
      const projetosPerdidos = projectsData.filter(
        (p) => p.status === "CANCELADO"
      );

      const totalVendas = vendasConcluidas.reduce(
        (sum, p) => sum + (p.valor_venda || 0),
        0
      );
      const totalPerdido = projetosPerdidos.reduce(
        (sum, p) => sum + (p.valor_orcamento || 0),
        0
      );
      const totalOrcamentos = orcamentosData?.reduce(
        (sum, o) => sum + (o.valor_total || 0),
        0
      ) || 0;

      // Fetch meta from metas table
      const mesAtual = format(new Date(), "yyyy-MM-01");
      const { data: metaData } = await supabase
        .from("metas")
        .select("meta_faturamento")
        .eq("user_id", userId)
        .eq("mes_referencia", mesAtual)
        .maybeSingle();

      const meta = metaData?.meta_faturamento || 100000;

      setStats({
        totalVendas,
        totalOrcamentos,
        vendaMaisOrcamento: totalVendas + totalOrcamentos,
        totalPerdido,
        metaMensal: meta,
        quantidadeVendas: vendasConcluidas.length,
      });

      // Vendas por mês (crescimento)
      const vendasPorMes = vendasConcluidas.reduce((acc: any, venda: any) => {
        const mes = format(new Date(venda.data_venda), "MMM/yy", { locale: ptBR });
        if (!acc[mes]) acc[mes] = 0;
        acc[mes] += venda.valor_venda;
        return acc;
      }, {});
      setVendasMes(
        Object.entries(vendasPorMes).map(([mes, valor]) => ({ mes, valor }))
      );

      // Crescimento por ambiente (multi-série)
      const porAmbienteMes: Record<string, Record<string, number>> = {};
      vendasConcluidas.forEach((p: any) => {
        const mes = format(new Date(p.data_venda), "MMM/yy", { locale: ptBR });
        const ambiente = p.ambiente || "OUTROS";
        if (!porAmbienteMes[mes]) porAmbienteMes[mes] = {};
        if (!porAmbienteMes[mes][ambiente]) porAmbienteMes[mes][ambiente] = 0;
        porAmbienteMes[mes][ambiente] += p.valor_venda || 0;
      });

      const ambientes = [...new Set(vendasConcluidas.map((p: any) => p.ambiente || "OUTROS"))];
      const crescimentoData = Object.entries(porAmbienteMes).map(([mes, dados]) => ({
        mes,
        ...dados,
      }));
      setCrescimentoPorAmbiente(crescimentoData);

      // Valor e quantidade por ambiente
      const porAmbiente = vendasConcluidas.reduce((acc: any, p: any) => {
        const ambiente = p.ambiente || "Não informado";
        if (!acc[ambiente]) {
          acc[ambiente] = { ambiente, valorVenda: 0, quantidade: 0 };
        }
        acc[ambiente].valorVenda += p.valor_venda || 0;
        acc[ambiente].quantidade++;
        return acc;
      }, {});
      setVendasPorAmbiente(Object.values(porAmbiente));

      // Ranking vendedores
      const porVendedor = vendasConcluidas.reduce((acc: any, p: any) => {
        const vendedor = p.vendedor_responsavel || "Sem vendedor";
        if (!acc[vendedor]) {
          acc[vendedor] = { vendedor, valorVenda: 0, quantidade: 0 };
        }
        acc[vendedor].valorVenda += p.valor_venda || 0;
        acc[vendedor].quantidade++;
        return acc;
      }, {});
      setRankingVendedores(
        Object.values(porVendedor).sort(
          (a: any, b: any) => b.valorVenda - a.valorVenda
        ) as VendedorRanking[]
      );

      // Ranking clientes
      const porCliente = vendasConcluidas.reduce((acc: any, p: any) => {
        const cliente = p.nome_cliente || "Não informado";
        if (!acc[cliente]) {
          acc[cliente] = { cliente, valorVenda: 0, quantidade: 0 };
        }
        acc[cliente].valorVenda += p.valor_venda || 0;
        acc[cliente].quantidade++;
        return acc;
      }, {});
      setRankingClientes(
        Object.values(porCliente)
          .sort((a: any, b: any) => b.valorVenda - a.valorVenda)
          .slice(0, 10) as ClienteRanking[]
      );
    }
  };

  const percentualMeta = (stats.totalVendas / stats.metaMensal) * 100;

  // Mini chart data for KPIs
  const miniChartData = useMemo(() => {
    return vendasMes.slice(-6).map((v) => ({ value: v.valor as number }));
  }, [vendasMes]);

  // Table columns
  const vendedorColumns: Column<VendedorRanking>[] = [
    { key: "vendedor", header: "Vendedor" },
    {
      key: "valorVenda",
      header: "Valor da Venda",
      align: "right",
      render: (row) => `R$ ${row.valorVenda.toLocaleString("pt-BR")}`,
    },
    { key: "quantidade", header: "Quantidade", align: "center" },
  ];

  const clienteColumns: Column<ClienteRanking>[] = [
    { key: "cliente", header: "Cliente" },
    {
      key: "valorVenda",
      header: "Valor da Venda",
      align: "right",
      render: (row) => `R$ ${row.valorVenda.toLocaleString("pt-BR")}`,
    },
    { key: "quantidade", header: "Quantidade", align: "center" },
  ];

  const ambienteColumns: Column<AmbienteData>[] = [
    { key: "ambiente", header: "Ambiente" },
    {
      key: "valorVenda",
      header: "Valor da Venda",
      align: "right",
      render: (row) => `R$ ${row.valorVenda.toLocaleString("pt-BR")}`,
    },
    { key: "quantidade", header: "Quantidade", align: "center" },
  ];

  // Get unique ambientes for chart
  const ambientes = useMemo(() => {
    const uniqueAmbientes = new Set<string>();
    crescimentoPorAmbiente.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "mes") uniqueAmbientes.add(key);
      });
    });
    return Array.from(uniqueAmbientes);
  }, [crescimentoPorAmbiente]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <DashboardFilter
        filters={filters}
        onFilterChange={setFilters}
        showPeriodo
        showVendedor
        vendedorOptions={vendedorOptions}
      />

      {/* KPIs - Layout Look Studio */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardKPICard
          title="Total Vendas"
          value={`R$ ${stats.totalVendas.toLocaleString("pt-BR")}`}
          icon={DollarSign}
          progress={percentualMeta}
          progressColor={percentualMeta >= 100 ? "success" : percentualMeta >= 70 ? "warning" : "danger"}
          trend={{
            value: percentualMeta,
            label: `Meta: R$ ${stats.metaMensal.toLocaleString("pt-BR")}`,
            positive: percentualMeta >= 100,
          }}
          miniChart={{
            data: miniChartData,
            type: "bar",
          }}
        />

        <DashboardKPICard
          title="Total Orçamento"
          value={`R$ ${stats.totalOrcamentos.toLocaleString("pt-BR")}`}
          icon={FileText}
          subtitle={`${stats.quantidadeVendas} vendas realizadas`}
          valueColor="default"
        />

        <DashboardKPICard
          title="Venda + Orçamento"
          value={`R$ ${stats.vendaMaisOrcamento.toLocaleString("pt-BR")}`}
          icon={TrendingUp}
          subtitle="Total geral"
          valueColor="default"
        />

        <DashboardKPICard
          title="Total Perdido"
          value={`R$ ${stats.totalPerdido.toLocaleString("pt-BR")}`}
          icon={XCircle}
          subtitle="Projetos perdidos"
          valueColor={stats.totalPerdido > 0 ? "danger" : "default"}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Crescimento de venda por mês */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crescimento de venda por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vendasMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) =>
                    `R$ ${Number(value).toLocaleString("pt-BR")}`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="hsl(var(--dashboard-orange))"
                  strokeWidth={2}
                  name="Faturamento"
                  dot={{ fill: "hsl(var(--dashboard-orange))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crescimento por ambiente (multi-série) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crescimento por Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={crescimentoPorAmbiente}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) =>
                    `R$ ${Number(value).toLocaleString("pt-BR")}`
                  }
                />
                <Legend />
                {ambientes.map((ambiente) => (
                  <Line
                    key={ambiente}
                    type="monotone"
                    dataKey={ambiente}
                    stroke={CHART_COLORS[ambiente as keyof typeof CHART_COLORS] || CHART_COLORS.OUTROS}
                    strokeWidth={2}
                    name={ambiente}
                    dot={{ fill: CHART_COLORS[ambiente as keyof typeof CHART_COLORS] || CHART_COLORS.OUTROS }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Valor e Quantidade por ambiente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valor e Quantidade de Venda por Ambiente</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardTable
            data={vendasPorAmbiente}
            columns={ambienteColumns}
            showPagination={false}
            totalRow={{
              label: "Total Geral",
              values: {
                valorVenda: `R$ ${vendasPorAmbiente.reduce((s, a) => s + a.valorVenda, 0).toLocaleString("pt-BR")}`,
                quantidade: vendasPorAmbiente.reduce((s, a) => s + a.quantidade, 0),
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Rankings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ranking por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardTable
              data={rankingVendedores}
              columns={vendedorColumns}
              itemsPerPage={5}
              totalRow={{
                label: "Total Geral",
                values: {
                  valorVenda: `R$ ${rankingVendedores.reduce((s, v) => s + v.valorVenda, 0).toLocaleString("pt-BR")}`,
                  quantidade: rankingVendedores.reduce((s, v) => s + v.quantidade, 0),
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ranking por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardTable
              data={rankingClientes}
              columns={clienteColumns}
              itemsPerPage={5}
              totalRow={{
                label: "Total Geral",
                values: {
                  valorVenda: `R$ ${rankingClientes.reduce((s, c) => s + c.valorVenda, 0).toLocaleString("pt-BR")}`,
                  quantidade: rankingClientes.reduce((s, c) => s + c.quantidade, 0),
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Desempenho vs Meta - Visual aprimorado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desempenho vs Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Faturamento Atual</span>
                <span className="text-sm font-medium">
                  R$ {stats.totalVendas.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all bg-dashboard-success"
                  style={{ width: `${Math.min(percentualMeta, 100)}%` }}
                />
              </div>
              <p
                className={`text-xs mt-1 ${
                  percentualMeta >= 100
                    ? "text-dashboard-success"
                    : "text-muted-foreground"
                }`}
              >
                {percentualMeta > 100
                  ? `Meta superada em ${(percentualMeta - 100).toFixed(1)}%`
                  : `Faltam ${(100 - percentualMeta).toFixed(1)}% para atingir a meta`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
