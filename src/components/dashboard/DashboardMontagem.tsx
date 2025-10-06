import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Wrench, Clock, CheckCircle, TrendingUp } from "lucide-react";

type DashboardMontagemProps = {
  userId: string;
};

export default function DashboardMontagem({ userId }: DashboardMontagemProps) {
  const [montagensPorMes, setMontagensPorMes] = useState<any[]>([]);
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
            acc[mes] = { mes, total: 0, concluidas: 0 };
          }
          acc[mes].total++;
          if (montagem.status === 'CONCLUIDO') acc[mes].concluidas++;
        }
        return acc;
      }, {});

      setMontagensPorMes(Object.values(porMes));

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

      {/* Gráfico */}
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
    </div>
  );
}
