import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Percent } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardParceirosProps {
  userId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const DashboardParceiros = ({ userId }: DashboardParceirosProps) => {
  const { data: parceiros } = useQuery({
    queryKey: ['parceiros', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parceiros')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: projetos } = useQuery({
    queryKey: ['projetos-parceiros', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, parceiro:parceiros(nome, categoria)')
        .eq('user_id', userId)
        .not('parceiro_id', 'is', null);
      
      if (error) throw error;
      return data || [];
    },
  });

  const stats = {
    totalParceiros: parceiros?.length || 0,
    totalIndicacoes: projetos?.length || 0,
    valorGerado: projetos?.reduce((sum, p) => sum + (p.valor_venda || 0), 0) || 0,
    comissoesPendentes: projetos?.filter(p => p.status_pagamento_parceiro === 'PENDENTE')
      .reduce((sum, p) => sum + (p.comissao_parceiro || 0), 0) || 0,
  };

  // Dados por categoria
  const categoriaData = parceiros?.reduce((acc: any[], p) => {
    const existing = acc.find(item => item.categoria === p.categoria);
    if (existing) {
      existing.quantidade++;
      existing.vendas += p.total_vendas_geradas;
    } else {
      acc.push({
        categoria: p.categoria.replace(/_/g, ' '),
        quantidade: 1,
        vendas: p.total_vendas_geradas,
      });
    }
    return acc;
  }, []) || [];

  // Ranking de parceiros
  const ranking = parceiros
    ?.sort((a, b) => b.total_vendas_geradas - a.total_vendas_geradas)
    .slice(0, 10) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parceiros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParceiros}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Indicações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIndicacoes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Gerado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.valorGerado)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.comissoesPendentes)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoriaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="vendas" fill="#8884d8" name="Vendas Geradas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriaData}
                  dataKey="quantidade"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoriaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Parceiros */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Parceiros</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posição</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Indicações</TableHead>
                <TableHead>Vendas Geradas</TableHead>
                <TableHead>Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((parceiro, index) => (
                <TableRow key={parceiro.id}>
                  <TableCell>
                    <Badge variant={index < 3 ? 'default' : 'outline'}>
                      {index + 1}º
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{parceiro.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {parceiro.categoria.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{parceiro.total_indicacoes}</TableCell>
                  <TableCell>{formatCurrency(parceiro.total_vendas_geradas)}</TableCell>
                  <TableCell>{parceiro.percentual_comissao}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardParceiros;
