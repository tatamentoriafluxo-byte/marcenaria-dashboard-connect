import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

type DashboardFluxoCaixaProps = {
  userId: string;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

export default function DashboardFluxoCaixa({ userId }: DashboardFluxoCaixaProps) {
  const [fluxoPorMes, setFluxoPorMes] = useState<any[]>([]);
  const [transacoesPorCategoria, setTransacoesPorCategoria] = useState<any[]>([]);
  const [transacoesPorSubcategoria, setTransacoesPorSubcategoria] = useState<any[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<any[]>([]);
  const [detalheNF, setDetalheNF] = useState<any[]>([]);
  const [stats, setStats] = useState({
    saldoAtual: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    saldoMesAtual: 0,
  });

  useEffect(() => {
    fetchFluxoCaixaData();
  }, [userId]);

  const fetchFluxoCaixaData = async () => {
    const { data: transacoes } = await supabase
      .from("transacoes_financeiras")
      .select("*")
      .eq("user_id", userId);

    if (transacoes) {
      // Fluxo por mês
      const porMes = transacoes.reduce((acc: any, trans: any) => {
        if (trans.data_transacao) {
          const mes = new Date(trans.data_transacao).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          if (!acc[mes]) {
            acc[mes] = { mes, entradas: 0, saidas: 0 };
          }
          if (trans.tipo === 'RECEITA') {
            acc[mes].entradas += trans.valor || 0;
          } else {
            acc[mes].saidas += trans.valor || 0;
          }
        }
        return acc;
      }, {});

      setFluxoPorMes(Object.values(porMes));

      // Transações por categoria
      const porCategoria = transacoes.reduce((acc: any, trans: any) => {
        const categoria = trans.categoria || "Não informado";
        if (!acc[categoria]) {
          acc[categoria] = { categoria, valor: 0 };
        }
        acc[categoria].valor += trans.valor || 0;
        return acc;
      }, {});

      setTransacoesPorCategoria(Object.values(porCategoria));

      // Transações por subcategoria
      const porSubcategoria = transacoes.reduce((acc: any, trans: any) => {
        const subcategoria = trans.subcategoria || "Não informado";
        if (!acc[subcategoria]) {
          acc[subcategoria] = { subcategoria, valor: 0 };
        }
        acc[subcategoria].valor += trans.valor || 0;
        return acc;
      }, {});
      setTransacoesPorSubcategoria(Object.values(porSubcategoria));

      // Forma de pagamento (apenas entradas)
      const porFormaPagamento = transacoes
        .filter(t => t.tipo === 'RECEITA')
        .reduce((acc: any, trans: any) => {
          const forma = trans.forma_pagamento || "Não informado";
          if (!acc[forma]) {
            acc[forma] = { forma, valor: 0 };
          }
          acc[forma].valor += trans.valor || 0;
          return acc;
        }, {});
      setFormaPagamento(Object.values(porFormaPagamento));

      // Detalhe por NF
      const nfData = transacoes
        .filter(t => t.numero_nf)
        .map(t => ({
          nf: t.numero_nf,
          status: t.status_pagamento || 'N/A',
          valor: t.valor || 0,
          tipo: t.tipo
        }));
      setDetalheNF(nfData);

      // Estatísticas
      const totalEntradas = transacoes
        .filter(t => t.tipo === 'RECEITA')
        .reduce((sum, t) => sum + (t.valor || 0), 0);

      const totalSaidas = transacoes
        .filter(t => t.tipo === 'DESPESA')
        .reduce((sum, t) => sum + (t.valor || 0), 0);

      const saldoAtual = totalEntradas - totalSaidas;

      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const transacoesMes = transacoes.filter(t => new Date(t.data_transacao) >= inicioMes);
      
      const entradasMes = transacoesMes
        .filter(t => t.tipo === 'RECEITA')
        .reduce((sum, t) => sum + (t.valor || 0), 0);
      
      const saidasMes = transacoesMes
        .filter(t => t.tipo === 'DESPESA')
        .reduce((sum, t) => sum + (t.valor || 0), 0);

      setStats({
        saldoAtual,
        totalEntradas,
        totalSaidas,
        saldoMesAtual: entradasMes - saidasMes,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dashboard-navy">RESUMO FLUXO DE CAIXA</h2>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-dashboard-orange" />
          <span className="text-sm font-medium text-dashboard-navy">Período: Geral</span>
        </div>
      </div>

      {/* 3 KPIs principais com mini-gráficos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Receita (Entradas)</div>
            <div className="text-3xl font-bold text-dashboard-success">R$ {(stats.totalEntradas / 1000).toFixed(1)}k</div>
            <div className="text-xs text-muted-foreground mt-2">Total acumulado</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Saídas</div>
            <div className={`text-3xl font-bold ${stats.totalSaidas > stats.totalEntradas ? 'text-dashboard-danger' : 'text-dashboard-warning'}`}>
              R$ {(stats.totalSaidas / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-muted-foreground mt-2">Despesas acumuladas</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Saldo</div>
            <div className={`text-3xl font-bold ${stats.saldoAtual >= 0 ? 'text-dashboard-success' : 'text-dashboard-danger'}`}>
              R$ {(stats.saldoAtual / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-muted-foreground mt-2">Saldo atual</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Receita x Saídas e Categorias */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita x Saídas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fluxoPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="entradas" fill="#22c55e" name="Entradas" />
                <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento (Entradas)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formaPagamento}
                  dataKey="valor"
                  nameKey="forma"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ valor }) => `R$ ${(valor / 1000).toFixed(0)}k`}
                >
                  {formaPagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#f97316', '#1e3a5f', '#22c55e'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações por Subcategoria</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subcategoria</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoesPorSubcategoria.slice(0, 5).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.subcategoria}</TableCell>
                    <TableCell>R$ {item.valor.toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento (Entradas)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formaPagamento}
                  dataKey="valor"
                  nameKey="forma"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {formaPagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalhe por NF</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalheNF.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.nf}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.tipo}</TableCell>
                    <TableCell>R$ {item.valor.toLocaleString('pt-BR')}</TableCell>
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
