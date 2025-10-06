import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Wrench, Clock, CheckCircle, TrendingUp } from "lucide-react";

type DashboardMontagemProps = {
  userId: string;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

export default function DashboardMontagem({ userId }: DashboardMontagemProps) {
  const [montagensPorMes, setMontagensPorMes] = useState<any[]>([]);
  const [montagensPorAmbiente, setMontagensPorAmbiente] = useState<any[]>([]);
  const [montagensPorMontador, setMontagensPorMontador] = useState<any[]>([]);
  const [feedbackCliente, setFeedbackCliente] = useState<any[]>([]);
  const [desafiosMontagem, setDesafiosMontagem] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMontagens: 0,
    concluidas: 0,
    agendadas: 0,
    eficienciaMedia: 0,
  });

  useEffect(() => {
    fetchMontagemData();
  }, [userId]);

  const fetchMontagemData = async () => {
    const { data: montagens } = await supabase
      .from("montagem")
      .select("*")
      .eq("user_id", userId);

    if (montagens) {
      // Montagens por mês
      const porMes = montagens.reduce((acc: any, montagem: any) => {
        if (montagem.data_montagem) {
          const mes = new Date(montagem.data_montagem).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          if (!acc[mes]) {
            acc[mes] = { mes, total: 0, concluidas: 0, valor: 0 };
          }
          acc[mes].total++;
          acc[mes].valor += montagem.valor_montagem || 0;
          if (montagem.status === 'CONCLUIDO') acc[mes].concluidas++;
        }
        return acc;
      }, {});

      setMontagensPorMes(Object.values(porMes));

      // Montagens por ambiente
      const porAmbiente = montagens.reduce((acc: any, montagem: any) => {
        const ambiente = montagem.ambiente || "Não informado";
        if (!acc[ambiente]) {
          acc[ambiente] = { ambiente, quantidade: 0, valor: 0 };
        }
        acc[ambiente].quantidade++;
        acc[ambiente].valor += montagem.valor_montagem || 0;
        return acc;
      }, {});
      setMontagensPorAmbiente(Object.values(porAmbiente));

      // Montagens por montador
      const { data: funcionarios } = await supabase
        .from("funcionarios")
        .select("id, nome")
        .eq("user_id", userId)
        .eq("tipo", "Montador");

      if (funcionarios) {
        const porMontador = montagens.reduce((acc: any, mont: any) => {
          if (mont.montador_id) {
            const montador = funcionarios.find(f => f.id === mont.montador_id);
            const nome = montador?.nome || "Sem nome";
            if (!acc[nome]) {
              acc[nome] = { montador: nome, status: mont.status, valor: 0, projetos: 0 };
            }
            acc[nome].valor += mont.valor_montagem || 0;
            acc[nome].projetos++;
          }
          return acc;
        }, {});
        setMontagensPorMontador(Object.values(porMontador).sort((a: any, b: any) => b.valor - a.valor));
      }

      // Feedback do cliente
      const feedbacks = montagens
        .filter(m => m.feedback_cliente)
        .reduce((acc: any, m: any) => {
          const feedback = m.feedback_cliente;
          if (!acc[feedback]) {
            acc[feedback] = { feedback, quantidade: 0 };
          }
          acc[feedback].quantidade++;
          return acc;
        }, {});
      setFeedbackCliente(Object.values(feedbacks));

      // Desafios de montagem  
      const desafios = montagens
        .filter(m => m.desafios)
        .reduce((acc: any, m: any) => {
          const desafio = m.desafios;
          if (!acc[desafio]) {
            acc[desafio] = { desafio, quantidade: 0 };
          }
          acc[desafio].quantidade++;
          return acc;
        }, {});
      setDesafiosMontagem(Object.values(desafios));

      // Estatísticas
      const concluidas = montagens.filter(m => m.status === 'CONCLUIDO').length;
      const agendadas = montagens.filter(m => m.status === 'AGENDADO').length;

      // Calcular eficiência (tempo real vs estimado)
      const montagensComTempo = montagens.filter(m => m.tempo_estimado && m.tempo_real);
      const eficienciaMedia = montagensComTempo.length > 0
        ? (montagensComTempo.reduce((sum, m) => sum + ((m.tempo_estimado / m.tempo_real) * 100), 0) / montagensComTempo.length)
        : 0;

      setStats({
        totalMontagens: montagens.length,
        concluidas,
        agendadas,
        eficienciaMedia,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Montagens</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMontagens}</div>
            <p className="text-xs text-muted-foreground">Montagens cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidas}</div>
            <p className="text-xs text-muted-foreground">Montagens finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agendadas}</div>
            <p className="text-xs text-muted-foreground">Aguardando montagem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eficienciaMedia.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Tempo real vs estimado</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Montagens por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={montagensPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Total" />
                <Bar dataKey="concluidas" fill="#82ca9d" name="Concluídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Montagens por Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={montagensPorAmbiente}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ambiente" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
                <Bar dataKey="valor" fill="#82ca9d" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Montadores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Montador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Projetos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {montagensPorMontador.map((mont, index) => (
                  <TableRow key={index}>
                    <TableCell>{mont.montador}</TableCell>
                    <TableCell>{mont.status}</TableCell>
                    <TableCell>R$ {mont.valor.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{mont.projetos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feedbackCliente}
                  dataKey="quantidade"
                  nameKey="feedback"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {feedbackCliente.map((entry, index) => (
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
            <CardTitle>Tempo Estimado vs Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Eficiência Média</span>
                  <span className="text-sm font-medium">{stats.eficienciaMedia.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(stats.eficienciaMedia, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Desempenho em relação ao planejado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desafios de Montagem</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Desafio</TableHead>
                  <TableHead>Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desafiosMontagem.map((desafio, index) => (
                  <TableRow key={index}>
                    <TableCell>{desafio.desafio}</TableCell>
                    <TableCell>{desafio.quantidade}</TableCell>
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