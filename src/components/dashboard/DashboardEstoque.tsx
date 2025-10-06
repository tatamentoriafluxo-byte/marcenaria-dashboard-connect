import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Package, AlertTriangle, TrendingDown, Boxes } from "lucide-react";

type DashboardEstoqueProps = {
  userId: string;
};

export default function DashboardEstoque({ userId }: DashboardEstoqueProps) {
  const [estoqueData, setEstoqueData] = useState<any[]>([]);
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

      // Calcular estatísticas
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
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItens}</div>
            <p className="text-xs text-muted-foreground">Itens no estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abaixo do Mínimo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.itensAbaixoMinimo}</div>
            <p className="text-xs text-muted-foreground">Requerem reposição</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.valorTotalEstoque.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Valor do estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens Zerados</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.itensZerados}</div>
            <p className="text-xs text-muted-foreground">Sem estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
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
