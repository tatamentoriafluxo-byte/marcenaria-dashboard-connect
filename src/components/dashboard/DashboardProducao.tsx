import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Factory, Clock, AlertTriangle, TrendingUp } from "lucide-react";

type DashboardProducaoProps = {
  userId: string;
};

export default function DashboardProducao({ userId }: DashboardProducaoProps) {
  const [producoesMes, setProducoesMes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProducoes: 0,
    emAndamento: 0,
    taxaRejeicaoMedia: 0,
    eficienciaMedia: 0,
  });

  useEffect(() => {
    fetchProducaoData();
  }, [userId]);

  const fetchProducaoData = async () => {
    const { data: producoes } = await supabase
      .from("producao")
      .select("*")
      .eq("user_id", userId);

    if (producoes) {
      // Produções por mês
      const producoesPorMes = producoes.reduce((acc: any, prod: any) => {
        if (prod.data_inicio) {
          const mes = new Date(prod.data_inicio).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          if (!acc[mes]) {
            acc[mes] = { mes, total: 0, concluidas: 0, emAndamento: 0 };
          }
          acc[mes].total++;
          if (prod.status === 'CONCLUIDO') acc[mes].concluidas++;
          if (prod.status === 'EM_ANDAMENTO') acc[mes].emAndamento++;
        }
        return acc;
      }, {});

      setProducoesMes(Object.values(producoesPorMes));

      // Estatísticas
      const emAndamento = producoes.filter(p => p.status === 'EM_ANDAMENTO').length;
      const taxaRejeicaoMedia = producoes.reduce((sum, p) => sum + (p.taxa_rejeicao || 0), 0) / (producoes.length || 1);
      
      // Calcular eficiência (tempo real vs estimado)
      const producoesComTempo = producoes.filter(p => p.tempo_estimado && p.tempo_real);
      const eficienciaMedia = producoesComTempo.length > 0
        ? (producoesComTempo.reduce((sum, p) => sum + ((p.tempo_estimado / p.tempo_real) * 100), 0) / producoesComTempo.length)
        : 0;

      setStats({
        totalProducoes: producoes.length,
        emAndamento,
        taxaRejeicaoMedia,
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
            <CardTitle className="text-sm font-medium">Total Produções</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducoes}</div>
            <p className="text-xs text-muted-foreground">Produções cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emAndamento}</div>
            <p className="text-xs text-muted-foreground">Produções ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaRejeicaoMedia.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Taxa média</p>
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Produções por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={producoesMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Total" />
                <Bar dataKey="concluidas" fill="#82ca9d" name="Concluídas" />
                <Bar dataKey="emAndamento" fill="#ffc658" name="Em Andamento" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Taxa de Aprovação</span>
                  <span className="text-sm font-medium">{(100 - stats.taxaRejeicaoMedia).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ width: `${100 - stats.taxaRejeicaoMedia}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Taxa de Rejeição</span>
                  <span className="text-sm font-medium text-red-600">{stats.taxaRejeicaoMedia.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-4">
                  <div
                    className="bg-red-500 h-4 rounded-full transition-all"
                    style={{ width: `${stats.taxaRejeicaoMedia}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eficiência de Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Eficiência Média</span>
                  <span className="text-sm font-medium">{stats.eficienciaMedia.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(stats.eficienciaMedia, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.eficienciaMedia > 100 
                    ? `${(stats.eficienciaMedia - 100).toFixed(0)}% mais rápido que o estimado`
                    : stats.eficienciaMedia < 100
                    ? `${(100 - stats.eficienciaMedia).toFixed(0)}% mais lento que o estimado`
                    : 'Dentro do prazo estimado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
