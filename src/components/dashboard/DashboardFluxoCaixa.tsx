import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

type DashboardFluxoCaixaProps = {
  userId: string;
};

export default function DashboardFluxoCaixa({ userId }: DashboardFluxoCaixaProps) {
  const [fluxoPorMes, setFluxoPorMes] = useState<any[]>([]);
  const [transacoesPorCategoria, setTransacoesPorCategoria] = useState<any[]>([]);
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
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.saldoAtual.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Saldo total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {stats.totalEntradas.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Receitas totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {stats.totalSaidas.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Despesas totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.saldoMesAtual.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Saldo mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fluxoPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Line type="monotone" dataKey="entradas" stroke="#82ca9d" name="Entradas" strokeWidth={2} />
                <Line type="monotone" dataKey="saidas" stroke="#ff8042" name="Saídas" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transacoesPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="valor" fill="#8884d8" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
