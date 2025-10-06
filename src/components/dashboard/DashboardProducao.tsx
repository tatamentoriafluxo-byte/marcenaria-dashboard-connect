import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Factory, Clock, AlertTriangle, TrendingUp } from "lucide-react";

type DashboardProducaoProps = {
  userId: string;
};

export default function DashboardProducao({ userId }: DashboardProducaoProps) {
  const [producoesMes, setProducoesMes] = useState<any[]>([]);
  const [producaoPorMarceneiro, setProducaoPorMarceneiro] = useState<any[]>([]);
  const [capacidadeProducao, setCapacidadeProducao] = useState<any[]>([]);
  const [variacaoTempo, setVariacaoTempo] = useState<any[]>([]);
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

      // Produção por marceneiro
      const { data: funcionarios } = await supabase
        .from("funcionarios")
        .select("id, nome")
        .eq("user_id", userId)
        .eq("tipo", "Marceneiro");

      if (funcionarios) {
        const porMarceneiro = producoes.reduce((acc: any, prod: any) => {
          if (prod.marceneiro_id) {
            const marceneiro = funcionarios.find(f => f.id === prod.marceneiro_id);
            const nome = marceneiro?.nome || "Sem nome";
            if (!acc[nome]) {
              acc[nome] = { nome, valorProd: 0, dataRealInicio: null };
            }
            acc[nome].valorProd += prod.valor_producao || 0;
            if (prod.data_inicio && !acc[nome].dataRealInicio) {
              acc[nome].dataRealInicio = new Date(prod.data_inicio).toLocaleDateString('pt-BR');
            }
          }
          return acc;
        }, {});
        setProducaoPorMarceneiro(Object.values(porMarceneiro).sort((a: any, b: any) => b.valorProd - a.valorProd));
      }

      // Capacidade de produção
      const { data: capacidade } = await supabase
        .from("capacidade_producao")
        .select("*")
        .eq("user_id", userId)
        .order("mes_referencia", { ascending: true });

      if (capacidade) {
        setCapacidadeProducao(
          capacidade.map(c => ({
            mes: new Date(c.mes_referencia).toLocaleDateString('pt-BR', { month: 'short' }),
            capacidade: c.capacidade_mensal_projetos || 0,
            realizado: c.projetos_realizados || 0
          }))
        );
      }

      // Variação tempo estimado x real
      const variacoes = producoes
        .filter(p => p.tempo_estimado && p.tempo_real)
        .map(p => ({
          ambiente: p.ambiente || "N/A",
          tempoEstimado: p.tempo_estimado || 0,
          tempoReal: p.tempo_real || 0,
          valorProducao: p.valor_producao || 0,
          codProjeto: p.project_id,
          taxaRejeicao: p.taxa_rejeicao || 0
        }));
      setVariacaoTempo(variacoes);

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
            <CardTitle>Produção por Marceneiro</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Marceneiro</TableHead>
                  <TableHead>Valor Prod</TableHead>
                  <TableHead>Data Real Início</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {producaoPorMarceneiro.map((marc, index) => (
                  <TableRow key={index}>
                    <TableCell>{marc.nome}</TableCell>
                    <TableCell>R$ {marc.valorProd.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{marc.dataRealInicio || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacidade de Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={capacidadeProducao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="capacidade" fill="#82ca9d" name="Capacidade" />
                <Bar dataKey="realizado" fill="#8884d8" name="Realizado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Variação Tempo Estimado x Real</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ambiente</TableHead>
                  <TableHead>Tempo Estimado</TableHead>
                  <TableHead>Tempo Real</TableHead>
                  <TableHead>Valor Produção</TableHead>
                  <TableHead>Taxa Rejeição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variacaoTempo.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.ambiente}</TableCell>
                    <TableCell>{item.tempoEstimado}h</TableCell>
                    <TableCell>{item.tempoReal}h</TableCell>
                    <TableCell>R$ {item.valorProducao.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{item.taxaRejeicao}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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