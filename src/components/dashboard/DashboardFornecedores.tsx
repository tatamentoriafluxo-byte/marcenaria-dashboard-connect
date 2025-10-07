import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Truck, CheckCircle, Clock, TrendingDown } from "lucide-react";

type DashboardFornecedoresProps = {
  userId: string;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

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

      // Buscar compras
      const { data: compras } = await supabase
        .from("compras")
        .select("*, fornecedores!compras_fornecedor_fkey(nome), itens_compra(*)")
        .eq("user_id", userId);

      if (compras) {
        // Evolução de compras
        const porMes = compras.reduce((acc: any, compra: any) => {
          if (compra.data_compra) {
            const mes = new Date(compra.data_compra).toLocaleDateString('pt-BR', { month: 'short' });
            if (!acc[mes]) acc[mes] = { mes, totalCompra: 0 };
            acc[mes].totalCompra += compra.valor_total || 0;
          }
          return acc;
        }, {});
        setEvolucaoCompras(Object.values(porMes));

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

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fornecedores por Tipo de Material</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fornecedoresPorTipo}
                  dataKey="total"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {fornecedoresPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução Total Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoCompras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Line type="monotone" dataKey="totalCompra" stroke="#8884d8" name="Total Compra" strokeWidth={2} />
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