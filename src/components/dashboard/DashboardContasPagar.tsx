import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, Calendar, TrendingDown } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";

interface DashboardContasPagarProps {
  userId: string;
}

interface Stats {
  totalAPagar: number;
  contasVencidas: number;
  valorVencido: number;
  venceProximos7Dias: number;
  totalPagoMes: number;
}

interface ContaVencida {
  id: string;
  descricao: string;
  fornecedor: string;
  valor: number;
  data_vencimento: string;
  dias_atraso: number;
}

export default function DashboardContasPagar({ userId }: DashboardContasPagarProps) {
  const [stats, setStats] = useState<Stats>({
    totalAPagar: 0,
    contasVencidas: 0,
    valorVencido: 0,
    venceProximos7Dias: 0,
    totalPagoMes: 0,
  });
  const [projecaoSaidas, setProjecaoSaidas] = useState<any[]>([]);
  const [topFornecedores, setTopFornecedores] = useState<any[]>([]);
  const [contasVencidas, setContasVencidas] = useState<ContaVencida[]>([]);
  const [proximosVencimentos, setProximosVencimentos] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    // Buscar todas as contas a pagar
    const { data: contas } = await supabase
      .from("contas")
      .select(`
        *,
        fornecedores!contas_fornecedor_fkey(nome)
      `)
      .eq("user_id", userId)
      .eq("tipo", "PAGAR");

    if (!contas) return;

    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);
    const proximos7Dias = addDays(hoje, 7);

    // Calcular estatísticas
    const totalAPagar = contas
      .filter(c => c.status !== 'PAGA_TOTAL' && c.status !== 'CANCELADA')
      .reduce((sum, c) => sum + (c.saldo_devedor || 0), 0);

    const vencidas = contas.filter(c => 
      new Date(c.data_vencimento) < hoje && 
      c.status !== 'PAGA_TOTAL' && 
      c.status !== 'CANCELADA'
    );

    const valorVencido = vencidas.reduce((sum, c) => sum + (c.saldo_devedor || 0), 0);

    const venceEmBreve = contas
      .filter(c => {
        const venc = new Date(c.data_vencimento);
        return venc >= hoje && venc <= proximos7Dias && c.status !== 'PAGA_TOTAL';
      })
      .reduce((sum, c) => sum + (c.saldo_devedor || 0), 0);

    const pagoMes = contas
      .filter(c => {
        const venc = new Date(c.data_vencimento);
        return venc >= inicioMes && venc <= fimMes;
      })
      .reduce((sum, c) => sum + (c.valor_pago || 0), 0);

    setStats({
      totalAPagar,
      contasVencidas: vencidas.length,
      valorVencido,
      venceProximos7Dias: venceEmBreve,
      totalPagoMes: pagoMes,
    });

    // Contas vencidas com detalhes
    const contasVencidasDetalhes: ContaVencida[] = vencidas.map(c => ({
      id: c.id,
      descricao: c.descricao,
      fornecedor: c.fornecedores?.nome || '-',
      valor: c.saldo_devedor,
      data_vencimento: c.data_vencimento,
      dias_atraso: Math.floor((hoje.getTime() - new Date(c.data_vencimento).getTime()) / (1000 * 60 * 60 * 24)),
    }));
    setContasVencidas(contasVencidasDetalhes);

    // Próximos vencimentos
    const proxVenc = contas
      .filter(c => {
        const venc = new Date(c.data_vencimento);
        return venc >= hoje && c.status !== 'PAGA_TOTAL';
      })
      .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())
      .slice(0, 10)
      .map(c => ({
        descricao: c.descricao,
        fornecedor: c.fornecedores?.nome || '-',
        valor: c.saldo_devedor,
        data_vencimento: c.data_vencimento,
      }));
    setProximosVencimentos(proxVenc);

    // Projeção de saídas (próximos 90 dias)
    const { data: projecaoData } = await supabase
      .rpc('calcular_projecao_fluxo', {
        _user_id: userId,
        _data_inicio: format(hoje, 'yyyy-MM-dd'),
        _data_fim: format(addDays(hoje, 90), 'yyyy-MM-dd'),
      });

    if (projecaoData) {
      const projecaoFormatada = projecaoData.map((item: any) => ({
        data: format(new Date(item.data), 'dd/MM'),
        saidas: item.saidas_previstas || 0,
      }));
      setProjecaoSaidas(projecaoFormatada);
    }

    // Top 5 fornecedores com maior saldo devedor
    const fornecedoresMap = new Map();
    contas
      .filter(c => c.fornecedor_id && c.status !== 'PAGA_TOTAL')
      .forEach(c => {
        const nome = c.fornecedores?.nome || 'Sem fornecedor';
        const atual = fornecedoresMap.get(nome) || 0;
        fornecedoresMap.set(nome, atual + (c.saldo_devedor || 0));
      });

    const topForn = Array.from(fornecedoresMap.entries())
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
    setTopFornecedores(topForn);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAPagar)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.contasVencidas}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(stats.valorVencido)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vence em 7 Dias</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.venceProximos7Dias)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pago no Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPagoMes)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projeção de Saídas (90 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projecaoSaidas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="saidas" stroke="#ef4444" name="Saídas Previstas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Fornecedores - Saldo Devedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topFornecedores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={100} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="valor" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas de Alertas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Contas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Atraso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasVencidas.slice(0, 5).map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell>{conta.fornecedor}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{conta.descricao}</TableCell>
                    <TableCell>{formatCurrency(conta.valor)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{conta.dias_atraso} dias</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {contasVencidas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma conta vencida
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proximosVencimentos.slice(0, 5).map((conta, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{conta.fornecedor}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{conta.descricao}</TableCell>
                    <TableCell>{formatCurrency(conta.valor)}</TableCell>
                    <TableCell>{format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                  </TableRow>
                ))}
                {proximosVencimentos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum vencimento próximo
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
