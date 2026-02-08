import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Wrench } from "lucide-react";

type DashboardMontagemProps = {
  userId: string;
};

const COLORS = ['#f97316', '#1e3a5f', '#22c55e', '#ff8042', '#0088fe'];

export default function DashboardMontagem({ userId }: DashboardMontagemProps) {
  const [montagensPorMes, setMontagensPorMes] = useState<any[]>([]);
  const [montagensPorAmbiente, setMontagensPorAmbiente] = useState<any[]>([]);
  const [montagensPorMontador, setMontagensPorMontador] = useState<any[]>([]);
  const [montagensPorMovel, setMontagensPorMovel] = useState<any[]>([]);
  const [tempoComparativo, setTempoComparativo] = useState<any[]>([]);
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

      // Montagens por móvel
      const porMovel = montagens.reduce((acc: any, montagem: any) => {
        const movel = montagem.nome_movel || "Não informado";
        if (!acc[movel]) {
          acc[movel] = { movel, quantidade: 0, valor: 0 };
        }
        acc[movel].quantidade++;
        acc[movel].valor += montagem.valor_montagem || 0;
        return acc;
      }, {});
      setMontagensPorMovel(Object.values(porMovel).sort((a: any, b: any) => b.valor - a.valor));

      // Tempo estimado vs Real - para gráfico horizontal
      const tempoComp = montagens
        .filter(m => m.tempo_estimado && m.tempo_real)
        .map(m => ({
          movel: m.nome_movel || "Sem nome",
          estimado: m.tempo_estimado,
          real: m.tempo_real,
          diferenca: (m.tempo_real - m.tempo_estimado),
        }));
      setTempoComparativo(tempoComp);

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

      // Desafios de montagem com dados expandidos
      const desafios = montagens
        .filter(m => m.desafios)
        .map((m, idx) => ({
          id: idx,
          montador_nome: "Montador", // Buscar do banco se disponível
          movel: m.nome_movel || "Sem nome",
          desafio: m.desafios || "Sem desafio",
          ambiente: m.ambiente || "Não informado",
        }));
      setDesafiosMontagem(desafios);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dashboard-navy">RESUMO MONTAGEM</h2>
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-dashboard-orange" />
          <span className="text-sm font-medium text-dashboard-navy">{stats.totalMontagens} Montagens</span>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total Montagens</div>
            <div className="text-3xl font-bold text-dashboard-navy">{stats.totalMontagens}</div>
            <div className="text-xs text-muted-foreground mt-2">Cadastradas</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Concluídas</div>
            <div className="text-3xl font-bold text-dashboard-success">{stats.concluidas}</div>
            <div className="text-xs text-muted-foreground mt-2">Finalizadas</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Agendadas</div>
            <div className="text-3xl font-bold text-dashboard-orange">{stats.agendadas}</div>
            <div className="text-xs text-muted-foreground mt-2">Pendentes</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Eficiência</div>
            <div className="text-3xl font-bold text-dashboard-orange">{stats.eficienciaMedia.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground mt-2">Estimado vs Real</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - 3 primeiros em destaque */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Montadores - Barras */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Montadores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={montagensPorMontador}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="montador" angle={-45} height={80} interval={0} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#f97316" name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Montagem por Ambiente - Barras Empilhadas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Montagem por Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={montagensPorAmbiente}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ambiente" angle={-45} height={80} interval={0} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" stackId="a" fill="#1e3a5f" name="Qtd" />
                <Bar dataKey="valor" stackId="a" fill="#f97316" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Montagem por Projeto/Móvel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Montagem por Móvel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={montagensPorMovel.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="movel" angle={-45} height={80} interval={0} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#22c55e" name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Tempo Estimado vs Real - Horizontal */}
      <Card>
        <CardHeader>
          <CardTitle>Tempo Estimado vs Real (Horas)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={tempoComparativo}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="movel" width={150} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="estimado" fill="#1e3a5f" name="Estimado" />
              <Bar dataKey="real" fill="#f97316" name="Real" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feedback e Desafios */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Feedback Cliente - Pizza */}
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
                  label={({ value }) => `${value}`}
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

        {/* Desafios de Montagem - Tabela Expandida */}
        <Card>
          <CardHeader>
            <CardTitle>Desafios de Montagem</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-dashboard-navy text-white">
                  <TableHead className="text-white">Móvel</TableHead>
                  <TableHead className="text-white">Desafio</TableHead>
                  <TableHead className="text-white">Ambiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desafiosMontagem.slice(0, 8).map((desafio) => (
                  <TableRow key={desafio.id}>
                    <TableCell className="font-medium">{desafio.movel}</TableCell>
                    <TableCell>{desafio.desafio}</TableCell>
                    <TableCell>{desafio.ambiente}</TableCell>
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