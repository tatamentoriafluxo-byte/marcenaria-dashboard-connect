import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MessageSquare, ThumbsUp, Star, TrendingUp } from "lucide-react";

type DashboardFeedbacksProps = {
  userId: string;
};

export default function DashboardFeedbacks({ userId }: DashboardFeedbacksProps) {
  const [avaliacoesPorCategoria, setAvaliacoesPorCategoria] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    recomendariam: 0,
    notaMedia: 0,
    taxaRecomendacao: 0,
  });

  useEffect(() => {
    fetchFeedbacksData();
  }, [userId]);

  const fetchFeedbacksData = async () => {
    const { data: feedbacks } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("user_id", userId);

    if (feedbacks) {
      // Converter avaliações em notas numéricas
      const avaliacaoParaNota = {
        'EXCELENTE': 5,
        'BOM': 4,
        'REGULAR': 3,
        'RUIM': 2,
        'PESSIMO': 1,
      };

      // Calcular médias por categoria
      const categorias = [
        { nome: 'Vendedor', campo: 'avaliacao_vendedor' },
        { nome: 'Atendimento', campo: 'avaliacao_atendimento_geral' },
        { nome: 'Montagem', campo: 'avaliacao_montagem' },
        { nome: 'Fabricação', campo: 'avaliacao_fabricacao' },
        { nome: 'Projetos', campo: 'avaliacao_equipe_projetos' },
      ];

      const avaliacoes = categorias.map(cat => {
        const feedbacksCat = feedbacks.filter(f => f[cat.campo]);
        const somaNotas = feedbacksCat.reduce((sum, f) => {
          const avaliacao = f[cat.campo] as keyof typeof avaliacaoParaNota;
          return sum + (avaliacaoParaNota[avaliacao] || 0);
        }, 0);
        const media = feedbacksCat.length > 0 ? somaNotas / feedbacksCat.length : 0;

        return {
          categoria: cat.nome,
          nota: media,
        };
      });

      setAvaliacoesPorCategoria(avaliacoes);

      // Estatísticas gerais
      const recomendariam = feedbacks.filter(f => f.recomendaria_servico === true).length;
      const taxaRecomendacao = feedbacks.length > 0 ? (recomendariam / feedbacks.length) * 100 : 0;

      // Calcular nota média geral
      let totalNotas = 0;
      let countNotas = 0;

      feedbacks.forEach(f => {
        categorias.forEach(cat => {
          if (f[cat.campo]) {
            const avaliacao = f[cat.campo] as keyof typeof avaliacaoParaNota;
            totalNotas += avaliacaoParaNota[avaliacao] || 0;
            countNotas++;
          }
        });
      });

      const notaMedia = countNotas > 0 ? totalNotas / countNotas : 0;

      setStats({
        totalFeedbacks: feedbacks.length,
        recomendariam,
        notaMedia,
        taxaRecomendacao,
      });
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeedbacks}</div>
            <p className="text-xs text-muted-foreground">Avaliações recebidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recomendariam</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recomendariam}</div>
            <p className="text-xs text-muted-foreground">Clientes satisfeitos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notaMedia.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">De 5 estrelas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Recomendação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaRecomendacao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Percentual de aprovação</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliações por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avaliacoesPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis domain={[0, 5]} />
              <Tooltip formatter={(value: any) => value.toFixed(2)} />
              <Legend />
              <Bar dataKey="nota" fill="#8884d8" name="Nota Média (0-5)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
