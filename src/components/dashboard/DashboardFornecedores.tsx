import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Truck } from "lucide-react";

type DashboardFornecedoresProps = {
  userId: string;
};

const COLORS = ['#f97316', '#1e3a5f', '#82ca9d', '#ff8042', '#0088fe'];

export default function DashboardFornecedores({ userId }: DashboardFornecedoresProps) {
  const [fornecedoresPorTipo, setFornecedoresPorTipo] = useState<any[]>([]);
  const [evolucaoCompras, setEvolucaoCompras] = useState<any[]>([]);
  const [detalheFornecedores, setDetalheFornecedores] = useState<any[]>([]);
  const [rankingFornecedores, setRankingFornecedores] = useState<any[]>([]);
  const [materialPorFornecedor, setMaterialPorFornecedor] = useState<any[]>([]);
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
      // Fornecedores por tipo
      const porTipo = fornecedores.reduce((acc: any, fornecedor: any) => {
        const tipo = fornecedor.tipo_material || "Não informado";
        if (!acc[tipo]) acc[tipo] = { tipo, total: 0 };
        acc[tipo].total++;
        return acc;
      }, {});
      setFornecedoresPorTipo(Object.values(porTipo));

      // Buscar compras com detalhes
      const { data: compras } = await supabase
        .from("compras")
        .select("*, fornecedores!compras_fornecedor_id_fkey(nome), itens_compra(*)")
        .eq("user_id", userId);

      if (compras) {
        // Detalhes fornecedor - agrupado por mês (para gráfico barras empilhadas)
        const detalhePorMes: any = {};
        const evolucaoPorFornecedor: Record<string, any[]> = {};

        compras.forEach((compra: any) => {
          if (compra.data_compra) {
            const mes = new Date(compra.data_compra).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            const nomeFornecedor = compra.fornecedores?.nome || "Sem nome";

            // Detalhe por mês
            if (!detalhePorMes[mes]) detalhePorMes[mes] = { mes };
            if (!detalhePorMes[mes][nomeFornecedor]) detalhePorMes[mes][nomeFornecedor] = 0;
            detalhePorMes[mes][nomeFornecedor] += compra.valor_total || 0;

            // Evolução por fornecedor
            if (!evolucaoPorFornecedor[nomeFornecedor]) evolucaoPorFornecedor[nomeFornecedor] = [];
            const existeMes = evolucaoPorFornecedor[nomeFornecedor].find(e => e.mes === mes);
            if (existeMes) {
              existeMes.valor += compra.valor_total || 0;
            } else {
              evolucaoPorFornecedor[nomeFornecedor].push({ mes, valor: compra.valor_total || 0, fornecedor: nomeFornecedor });
            }
          }
        });

        // Ordenar por mês
        const detalheArray = Object.values(detalhePorMes).sort((a: any, b: any) => {
          const dateA = new Date(a.mes);
          const dateB = new Date(b.mes);
          return dateA.getTime() - dateB.getTime();
        });

        setDetalheFornecedores(detalheArray);

        // Evolução - combinar todos fornecedores em meses
        const mesesUnicos = new Set<string>();
        Object.values(evolucaoPorFornecedor).forEach((meses: any[]) => {
          meses.forEach(m => mesesUnicos.add(m.mes));
        });

        const evolucaoArray = Array.from(mesesUnicos).sort().map(mes => {
          const obj: any = { mes };
          Object.entries(evolucaoPorFornecedor).forEach(([fornecedor, dados]: any) => {
            const found = dados.find((d: any) => d.mes === mes);
            obj[fornecedor] = found ? found.valor : 0;
          });
          return obj;
        });

        setEvolucaoCompras(evolucaoArray);

        // Ranking fornecedores
        const ranking: Record<string, {
          nome: string;
          totalCompra: number;
          quantidadeAdquirida: number;
          percentualTotal: number;
        }> = compras.reduce((acc: any, compra: any) => {
          const nome = compra.fornecedores?.nome || "Sem nome";
          if (!acc[nome]) {
            acc[nome] = { 
              nome, 
              totalCompra: 0, 
              quantidadeAdquirida: 0,
              percentualTotal: 0 
            };
          }
          acc[nome].totalCompra += compra.valor_total || 0;
          
          // Somar quantidades dos itens
          if (compra.itens_compra) {
            compra.itens_compra.forEach((item: any) => {
              acc[nome].quantidadeAdquirida += item.quantidade || 0;
            });
          }
          return acc;
        }, {});

        const totalGeral: number = Object.values(ranking).reduce((sum: number, r) => sum + r.totalCompra, 0);
        const rankingArray = Object.values(ranking).map((r) => ({
          ...r,
          percentualTotal: totalGeral > 0 ? (r.totalCompra / totalGeral) * 100 : 0
        })).sort((a, b) => b.totalCompra - a.totalCompra);

        setRankingFornecedores(rankingArray);

        // Detalhes com status
        const detalhes = compras.map(c => ({
          nome: c.fornecedores?.nome || "N/A",
          status: c.status,
          totalCompra: c.valor_total || 0,
          ordemCompra: c.ordem_compra || "N/A"
        }));
        setDetalheFornecedores(detalhes);
      }

      // Material por fornecedor (dados fictícios baseados em tipo)
      const materiaisFornecedor = fornecedores
        .filter(f => f.tipo_material)
        .map(f => ({
          fornecedor: f.nome,
          material: f.tipo_material,
          custoMedio: Math.floor(Math.random() * 50) + 20
        }));
      setMaterialPorFornecedor(materiaisFornecedor);

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
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dashboard-navy">RESUMO FORNECEDOR</h2>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-dashboard-orange" />
          <span className="text-sm font-medium text-dashboard-navy">{stats.totalFornecedores} Fornecedores</span>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Fornecedores</div>
            <div className="text-3xl font-bold text-dashboard-navy">{stats.totalFornecedores}</div>
            <div className="text-xs text-muted-foreground mt-2">Cadastrados</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Ativos</div>
            <div className="text-3xl font-bold text-dashboard-success">{stats.ativos}</div>
            <div className="text-xs text-muted-foreground mt-2">Em operação</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Inativos</div>
            <div className="text-3xl font-bold text-dashboard-danger">{stats.inativos}</div>
            <div className="text-xs text-muted-foreground mt-2">Desativados</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Prazo Médio</div>
            <div className="text-3xl font-bold text-dashboard-orange">{stats.prazoMedio.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground mt-2">dias de entrega</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Detalhes fornecedor - Barras Empilhadas */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes Fornecedor por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={detalheFornecedores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                {/* Dynamicamente adicionar fornecedores */}
                {detalheFornecedores[0] && Object.keys(detalheFornecedores[0])
                  .filter(key => key !== 'mes')
                  .map((fornecedor, idx) => (
                    <Bar key={idx} dataKey={fornecedor} stackId="a" fill={COLORS[idx % COLORS.length]} />
                  ))
                }
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução total compra - Linha Multi-Série */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Total Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={evolucaoCompras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                {evolucaoCompras[0] && Object.keys(evolucaoCompras[0])
                  .filter(key => key !== 'mes')
                  .map((fornecedor, idx) => (
                    <Line key={idx} type="monotone" dataKey={fornecedor} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Total Compra</TableHead>
                  <TableHead>Qtd Adquirida</TableHead>
                  <TableHead>%Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingFornecedores.slice(0, 5).map((forn, index) => (
                  <TableRow key={index}>
                    <TableCell>{forn.nome}</TableCell>
                    <TableCell>R$ {forn.totalCompra.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{forn.quantidadeAdquirida}</TableCell>
                    <TableCell>{forn.percentualTotal.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material por Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Custo Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialPorFornecedor.slice(0, 5).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.fornecedor}</TableCell>
                    <TableCell>{item.material}</TableCell>
                    <TableCell>R$ {item.custoMedio}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Compra</TableHead>
                  <TableHead>Ordem de Compra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalheFornecedores.map((det, index) => (
                  <TableRow key={index}>
                    <TableCell>{det.nome}</TableCell>
                    <TableCell>{det.status}</TableCell>
                    <TableCell>R$ {det.totalCompra.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{det.ordemCompra}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}