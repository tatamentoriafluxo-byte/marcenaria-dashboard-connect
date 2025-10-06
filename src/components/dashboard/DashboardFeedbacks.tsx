import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MessageSquare, ThumbsUp, Star, TrendingUp } from "lucide-react";

type DashboardFeedbacksProps = {
  userId: string;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

export default function DashboardFeedbacks({ userId }: DashboardFeedbacksProps) {
  const [avaliacoesPorCategoria, setAvaliacoesPorCategoria] = useState<any[]>([]);
  const [avaliacaoVendedor, setAvaliacaoVendedor] = useState<any[]>([]);
  const [avaliacaoEquipeProjetos, setAvaliacaoEquipeProjetos] = useState<any[]>([]);
  const [avaliacaoFabricacao, setAvaliacaoFabricacao] = useState<any[]>([]);
  const [avaliacaoMontagem, setAvaliacaoMontagem] = useState<any[]>([]);
  const [avaliacaoAtendimento, setAvaliacaoAtendimento] = useState<any[]>([]);
  const [recomendacao, setRecomendacao] = useState<any[]>([]);
  const [resumoRespostas, setResumoRespostas] = useState<any[]>([]);
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
      .select("*, projects!inner(nome_cliente, telefone, cod_projeto)")
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

      // Distribuição por categoria específica
      const distribuicaoPorCategoria = (campo: string) => {
        const dist = feedbacks
          .filter(f => f[campo])
          .reduce((acc: any, f: any) => {
            const aval = f[campo];
            if (!acc[aval]) acc[aval] = 0;
            acc[aval]++;
            return acc;
          }, {});
        
        return Object.entries(dist).map(([name, value]) => ({
          name,
          value: ((value as number) / feedbacks.length) * 100
        }));
      };

      setAvaliacaoVendedor(distribuicaoPorCategoria('avaliacao_vendedor'));
      setAvaliacaoEquipeProjetos(distribuicaoPorCategoria('avaliacao_equipe_projetos'));
      setAvaliacaoFabricacao(distribuicaoPorCategoria('avaliacao_fabricacao'));
      setAvaliacaoMontagem(distribuicaoPorCategoria('avaliacao_montagem'));
      setAvaliacaoAtendimento(distribuicaoPorCategoria('avaliacao_atendimento_geral'));

      // Recomendação
      const rec = feedbacks.reduce((acc: any, f: any) => {
        const recom = f.recomendaria_servico ? 'Sim' : 'Não';
        if (!acc[recom]) acc[recom] = 0;
        acc[recom]++;
        return acc;
      }, {});
      setRecomendacao(Object.entries(rec).map(([name, value]) => ({ name, value })));

      // Resumo respostas
      const resumo = feedbacks.map(f => ({
        nome: f.projects?.nome_cliente || 'N/A',
        telefone: f.projects?.telefone || 'N/A',
        projeto: f.projects?.cod_projeto || 'N/A',
        montagem: f.avaliacao_montagem || 'N/A',
        qualidade: f.avaliacao_fabricacao || 'N/A',
        vendedor: f.avaliacao_vendedor || 'N/A',
        projetos: f.avaliacao_equipe_projetos || 'N/A',
        geral: f.avaliacao_atendimento_geral || 'N/A'
      }));
      setResumoRespostas(resumo);

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

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Avaliação Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={avaliacaoVendedor}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ value }) => `${value.toFixed(0)}%`}
                >
                  {avaliacaoVendedor.map((entry, index) => (
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
            <CardTitle>Avaliação Equipe de Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={avaliacaoEquipeProjetos}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ value }) => `${value.toFixed(0)}%`}
                >
                  {avaliacaoEquipeProjetos.map((entry, index) => (
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
            <CardTitle>Avaliação Fabricação Móveis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={avaliacaoFabricacao}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ value }) => `${value.toFixed(0)}%`}
                >
                  {avaliacaoFabricacao.map((entry, index) => (
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
            <CardTitle>Avaliação Montagem</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={avaliacaoMontagem}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ value }) => `${value.toFixed(0)}%`}
                >
                  {avaliacaoMontagem.map((entry, index) => (
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
            <CardTitle>Avaliação Atendimento Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={avaliacaoAtendimento}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ value }) => `${value.toFixed(0)}%`}
                >
                  {avaliacaoAtendimento.map((entry, index) => (
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
            <CardTitle>Recomendação do Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={recomendacao}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  {recomendacao.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Respostas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Montagem</TableHead>
                <TableHead>Qualidade</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Projetos</TableHead>
                <TableHead>Geral</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resumoRespostas.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell>{item.telefone}</TableCell>
                  <TableCell>{item.projeto}</TableCell>
                  <TableCell>{item.montagem}</TableCell>
                  <TableCell>{item.qualidade}</TableCell>
                  <TableCell>{item.vendedor}</TableCell>
                  <TableCell>{item.projetos}</TableCell>
                  <TableCell>{item.geral}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}