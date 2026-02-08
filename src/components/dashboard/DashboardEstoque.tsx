import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Package, AlertTriangle, Warehouse } from "lucide-react";

type DashboardEstoqueProps = {
  userId: string;
};

export default function DashboardEstoque({ userId }: DashboardEstoqueProps) {
  const [estoqueData, setEstoqueData] = useState<any[]>([]);
  const [resumoEstoque, setResumoEstoque] = useState<any[]>([]);
  const [estoqueNecessidadeCompra, setEstoqueNecessidadeCompra] = useState<any[]>([]);
  const [ultimaCompra, setUltimaCompra] = useState<any[]>([]);
  const [estoquePorFornecedor, setEstoquePorFornecedor] = useState<any[]>([]);
  const [tipoMaterialPorFornecedor, setTipoMaterialPorFornecedor] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalItens: 0,
    itensAbaixoMinimo: 0,
    valorTotalEstoque: 0,
    itensZerados: 0,
  });

  useEffect(() => {
    fetchEstoqueData();
  }, [userId]);

  const fetchEstoqueData = async () => {
    const { data: estoque } = await supabase
      .from("estoque")
      .select(`
        *,
        materiais:material_id (
          nome,
          preco_medio,
          tipo
        )
      `)
      .eq("user_id", userId);

    if (estoque) {
      // Preparar dados para gráfico
      const estoqueComNomes = estoque.map((item: any) => ({
        ...item,
        nome: item.materiais?.nome || 'Material desconhecido',
        preco: item.materiais?.preco_medio || 0,
        tipo: item.materiais?.tipo || 'Outros',
      }));

      setEstoqueData(estoqueComNomes);

      // Tabela "Resumo estoque" - Material/Tipo/Qtd atual/min/max
      const resumo = estoqueComNomes.map(item => ({
        material: item.nome,
        tipo: item.tipo,
        qtdAtual: item.quantidade_atual,
        qtdMinima: item.quantidade_minima,
        qtdMaxima: item.quantidade_maxima || 0,
        rowAlert: item.quantidade_atual < item.quantidade_minima,
      }));
      setResumoEstoque(resumo);

      // Tabela "Estoque e necessidade compra" - com preços
      const necessidade = estoqueComNomes
        .filter(item => item.quantidade_atual < item.quantidade_minima)
        .map(item => ({
          material: item.nome,
          tipo: item.tipo,
          qtdAtual: item.quantidade_atual,
          necessidade: item.quantidade_minima - item.quantidade_atual,
          precoMedio: item.preco,
        }));
      setEstoqueNecessidadeCompra(necessidade);

      // Tabela "Data última compra"
      const ultimaC = estoqueComNomes
        .filter((item: any) => item.data_ultima_compra)
        .map((item: any) => ({
          tipo: item.tipo,
          ultimaCompra: new Date(item.data_ultima_compra).toLocaleDateString('pt-BR'),
          qtdUltCompra: item.quantidade_ultima_compra || 0,
        }));
      setUltimaCompra(ultimaC);

      // Pizza "Estoque por Fornecedores"
      const porFornecedor = estoqueComNomes.reduce((acc: any, item: any) => {
        const fornecedor = "Geral"; // Seria buscado da relação se disponível
        if (!acc[fornecedor]) acc[fornecedor] = { fornecedor, valor: 0, qtd: 0 };
        acc[fornecedor].valor += item.quantidade_atual * item.preco;
        acc[fornecedor].qtd += item.quantidade_atual;
        return acc;
      }, {});
      setEstoquePorFornecedor(Object.values(porFornecedor));

      // Gráfico barras empilhadas "Tipo de Material"
      const tipoMat: any = {};
      estoqueComNomes.forEach((item: any) => {
        if (!tipoMat[item.tipo]) tipoMat[item.tipo] = { tipo: item.tipo, quantidade: 0, valor: 0 };
        tipoMat[item.tipo].quantidade += item.quantidade_atual;
        tipoMat[item.tipo].valor += item.quantidade_atual * item.preco;
      });
      setTipoMaterialPorFornecedor(Object.values(tipoMat));
      const itensAbaixoMinimo = estoque.filter(
        (item: any) => item.quantidade_atual < item.quantidade_minima
      ).length;

      const itensZerados = estoque.filter(
        (item: any) => item.quantidade_atual === 0
      ).length;

      const valorTotal = estoque.reduce((sum, item: any) => {
        const preco = item.materiais?.preco_medio || 0;
        return sum + (item.quantidade_atual * preco);
      }, 0);

      setStats({
        totalItens: estoque.length,
        itensAbaixoMinimo,
        valorTotalEstoque: valorTotal,
        itensZerados,
      });
    }
  };

  // Agrupar por tipo para gráfico
  const estoquesPorTipo = estoqueData.reduce((acc: any, item: any) => {
    const tipo = item.tipo || 'Outros';
    if (!acc[tipo]) {
      acc[tipo] = { tipo, quantidade: 0, valor: 0 };
    }
    acc[tipo].quantidade += item.quantidade_atual;
    acc[tipo].valor += item.quantidade_atual * item.preco;
    return acc;
  }, {});

  const dadosGrafico = Object.values(estoquesPorTipo);

  // Itens com estoque crítico
  const itensCriticos = estoqueData
    .filter(item => item.quantidade_atual < item.quantidade_minima)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dashboard-navy">RESUMO ESTOQUE</h2>
        <div className="flex items-center gap-2">
          <Warehouse className="h-5 w-5 text-dashboard-orange" />
          <span className="text-sm font-medium text-dashboard-navy">{stats.totalItens} Itens</span>
        </div>
      </div>

      {/* KPIs - Implícitos nas tabelas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total de Itens</div>
            <div className="text-3xl font-bold text-dashboard-navy">{stats.totalItens}</div>
            <div className="text-xs text-muted-foreground mt-2">Itens cadastrados</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Abaixo do Mínimo</div>
            <div className="text-3xl font-bold text-dashboard-danger">{stats.itensAbaixoMinimo}</div>
            <div className="text-xs text-muted-foreground mt-2">Requerem reposição</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Itens Zerados</div>
            <div className="text-3xl font-bold text-dashboard-danger">{stats.itensZerados}</div>
            <div className="text-xs text-muted-foreground mt-2">Sem estoque</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Valor Total</div>
            <div className="text-3xl font-bold text-dashboard-orange">R$ {(stats.valorTotalEstoque / 1000).toFixed(1)}k</div>
            <div className="text-xs text-muted-foreground mt-2">Valor do estoque</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas Principais */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-dashboard-navy text-white">
                  <TableHead className="text-white">Material</TableHead>
                  <TableHead className="text-white">Tipo</TableHead>
                  <TableHead className="text-white text-right">Qtd Atual</TableHead>
                  <TableHead className="text-white text-right">Qtd Mín</TableHead>
                  <TableHead className="text-white text-right">Qtd Máx</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumoEstoque.map((item, idx) => (
                  <TableRow key={idx} className={item.rowAlert ? 'bg-dashboard-warning/20' : ''}>
                    <TableCell className="font-medium">{item.material}</TableCell>
                    <TableCell>{item.tipo}</TableCell>
                    <TableCell className="text-right">{item.qtdAtual}</TableCell>
                    <TableCell className="text-right">{item.qtdMinima}</TableCell>
                    <TableCell className="text-right">{item.qtdMaxima}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estoque e Necessidade de Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-dashboard-navy text-white">
                  <TableHead className="text-white">Material</TableHead>
                  <TableHead className="text-white">Tipo</TableHead>
                  <TableHead className="text-white text-right">Qtd Atual</TableHead>
                  <TableHead className="text-white text-right">Necessidade Compra</TableHead>
                  <TableHead className="text-white text-right">Preço Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estoqueNecessidadeCompra.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.material}</TableCell>
                    <TableCell>{item.tipo}</TableCell>
                    <TableCell className="text-right">{item.qtdAtual}</TableCell>
                    <TableCell className="text-right font-medium text-dashboard-danger">{item.necessidade}</TableCell>
                    <TableCell className="text-right">R$ {item.precoMedio.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Última Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-dashboard-navy text-white">
                  <TableHead className="text-white text-sm">Tipo</TableHead>
                  <TableHead className="text-white text-sm">Última Compra</TableHead>
                  <TableHead className="text-white text-sm text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ultimaCompra.slice(0, 5).map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm">{item.tipo}</TableCell>
                    <TableCell className="text-sm">{item.ultimaCompra}</TableCell>
                    <TableCell className="text-sm text-right">{item.qtdUltCompra}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estoque por Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={estoquePorFornecedor}
                  dataKey="valor"
                  nameKey="fornecedor"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ valor }) => `R$ ${(valor / 1000).toFixed(0)}k`}
                >
                  {estoquePorFornecedor.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#f97316', '#1e3a5f'][index % 2]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tipo de Material</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tipoMaterialPorFornecedor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" tick={{ fontSize: 12 }} angle={-45} height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" stackId="a" fill="#1e3a5f" name="Qty" />
                <Bar dataKey="valor" stackId="a" fill="#f97316" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
        <Card>
          <CardHeader>
            <CardTitle>Estoque por Tipo de Material</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor do Estoque por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="valor" fill="#82ca9d" name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Itens com Estoque Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            {itensCriticos.length > 0 ? (
              <div className="space-y-4">
                {itensCriticos.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {item.tipo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        <span className="font-medium text-red-600">
                          {item.quantidade_atual}
                        </span>
                        {" / "}
                        <span className="text-muted-foreground">
                          {item.quantidade_minima} mín.
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Repor: {item.quantidade_minima - item.quantidade_atual} unidades
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum item com estoque crítico
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
