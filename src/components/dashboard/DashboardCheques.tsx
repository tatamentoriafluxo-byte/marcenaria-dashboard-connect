import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, addDays } from "date-fns";

interface DashboardChequesProps {
  userId: string;
}

interface Stats {
  recebidosPendentes: number;
  valorRecebidosPendentes: number;
  emitidosPendentes: number;
  valorEmitidosPendentes: number;
  devolvidos: number;
  valorDevolvidos: number;
  compensadosMes: number;
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6'];

export default function DashboardCheques({ userId }: DashboardChequesProps) {
  const [stats, setStats] = useState<Stats>({
    recebidosPendentes: 0,
    valorRecebidosPendentes: 0,
    emitidosPendentes: 0,
    valorEmitidosPendentes: 0,
    devolvidos: 0,
    valorDevolvidos: 0,
    compensadosMes: 0,
  });
  const [proximasCompensacoes, setProximasCompensacoes] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [chequesVencidos, setChequesVencidos] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    const { data: cheques } = await supabase
      .from("cheques")
      .select("*")
      .eq("user_id", userId);

    if (!cheques) return;

    const hoje = new Date();

    // Estatísticas
    const recebidosPend = cheques.filter(c => c.tipo === 'RECEBIDO' && c.status === 'PENDENTE');
    const emitidosPend = cheques.filter(c => c.tipo === 'EMITIDO' && c.status === 'PENDENTE');
    const devolvidos = cheques.filter(c => c.status === 'DEVOLVIDO');
    const compensadosMes = cheques.filter(c => {
      if (c.status !== 'COMPENSADO') return false;
      const dataComp = new Date(c.data_compensacao);
      const mesAtual = hoje.getMonth();
      return dataComp.getMonth() === mesAtual;
    });

    setStats({
      recebidosPendentes: recebidosPend.length,
      valorRecebidosPendentes: recebidosPend.reduce((s, c) => s + c.valor, 0),
      emitidosPendentes: emitidosPend.length,
      valorEmitidosPendentes: emitidosPend.reduce((s, c) => s + c.valor, 0),
      devolvidos: devolvidos.length,
      valorDevolvidos: devolvidos.reduce((s, c) => s + c.valor, 0),
      compensadosMes: compensadosMes.length,
    });

    // Próximas compensações (próximos 30 dias)
    const proxComp = cheques
      .filter(c => {
        if (c.status !== 'PENDENTE') return false;
        const dataComp = new Date(c.data_compensacao);
        return dataComp >= hoje && dataComp <= addDays(hoje, 30);
      })
      .sort((a, b) => new Date(a.data_compensacao).getTime() - new Date(b.data_compensacao).getTime())
      .slice(0, 10)
      .map(c => ({
        numero: c.numero_cheque,
        banco: c.banco,
        titular: c.titular,
        valor: c.valor,
        tipo: c.tipo,
        data_compensacao: c.data_compensacao,
      }));
    setProximasCompensacoes(proxComp);

    // Distribuição por status
    const statusMap = new Map();
    cheques.forEach(c => {
      const atual = statusMap.get(c.status) || 0;
      statusMap.set(c.status, atual + 1);
    });
    
    const statusDist = Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    setStatusDistribution(statusDist);

    // Cheques vencidos não compensados
    const vencidos = cheques
      .filter(c => {
        if (c.status === 'COMPENSADO' || c.status === 'DEVOLVIDO') return false;
        return new Date(c.data_compensacao) < hoje;
      })
      .map(c => ({
        numero: c.numero_cheque,
        banco: c.banco,
        titular: c.titular,
        valor: c.valor,
        tipo: c.tipo,
        data_compensacao: c.data_compensacao,
        dias_vencido: Math.floor((hoje.getTime() - new Date(c.data_compensacao).getTime()) / (1000 * 60 * 60 * 24)),
      }));
    setChequesVencidos(vencidos);
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
            <CardTitle className="text-sm font-medium">Cheques Recebidos (Pendentes)</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recebidosPendentes}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(stats.valorRecebidosPendentes)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cheques Emitidos (Pendentes)</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emitidosPendentes}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(stats.valorEmitidosPendentes)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cheques Devolvidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.devolvidos}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(stats.valorDevolvidos)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compensados no Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compensadosMes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Compensações (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proximasCompensacoes.slice(0, 5).map((cheque, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{cheque.numero}</TableCell>
                    <TableCell>
                      <Badge variant={cheque.tipo === 'RECEBIDO' ? 'default' : 'secondary'}>
                        {cheque.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(cheque.valor)}</TableCell>
                    <TableCell>{format(new Date(cheque.data_compensacao), 'dd/MM/yyyy')}</TableCell>
                  </TableRow>
                ))}
                {proximasCompensacoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma compensação prevista
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {chequesVencidos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cheques Vencidos Não Compensados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Titular</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Atraso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chequesVencidos.slice(0, 10).map((cheque, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{cheque.numero}</TableCell>
                    <TableCell>{cheque.banco}</TableCell>
                    <TableCell>{cheque.titular}</TableCell>
                    <TableCell>
                      <Badge variant={cheque.tipo === 'RECEBIDO' ? 'default' : 'secondary'}>
                        {cheque.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(cheque.valor)}</TableCell>
                    <TableCell>{format(new Date(cheque.data_compensacao), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{cheque.dias_vencido} dias</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
