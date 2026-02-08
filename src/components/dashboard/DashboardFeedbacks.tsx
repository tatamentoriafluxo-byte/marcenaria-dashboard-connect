import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MessageSquare } from "lucide-react";

type DashboardFeedbacksProps = {
  userId: string;
};

const COLORS = ['#22c55e', '#f97316', '#ef4444', '#fef08a', '#0088fe'];

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
      .select("*, projects!feedbacks_project_fkey(nome_cliente, telefone, cod_projeto)")
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
      {/* Header com KPI simplificado */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dashboard-navy">RESUMO FEEDBACK</h2>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-dashboard-orange" />
          <span className="text-sm font-medium text-dashboard-navy">{stats.totalFeedbacks} Feedbacks</span>
        </div>
      </div>

      {/* Cards de Estatísticas - Simplificado */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Taxa de Recomendação</div>
            <div className="text-3xl font-bold text-dashboard-success">{stats.taxaRecomendacao.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground mt-2">Clientes que recomendariam</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Nota Média Geral</div>
            <div className="text-3xl font-bold text-dashboard-orange">{stats.notaMedia.toFixed(1)}/5</div>
            <div className="text-xs text-muted-foreground mt-2">Avaliação média</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-dashboard-navy border-l-4">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total de Respostas</div>
            <div className="text-3xl font-bold text-dashboard-navy">{stats.totalFeedbacks}</div>
            <div className="text-xs text-muted-foreground mt-2">Avaliações coletadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - 6 Pizzas em layout 3x2 */}
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