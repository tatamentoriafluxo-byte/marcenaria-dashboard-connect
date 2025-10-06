import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FolderKanban, Clock, CheckCircle, XCircle } from "lucide-react";

type DashboardProjetosProps = {
  userId: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D'];

export default function DashboardProjetos({ userId }: DashboardProjetosProps) {
  const [projetosPorStatus, setProjetosPorStatus] = useState<any[]>([]);
  const [projetosPorAmbiente, setProjetosPorAmbiente] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProjetos: 0,
    emAndamento: 0,
    concluidos: 0,
    atrasados: 0,
  });

  useEffect(() => {
    fetchProjetosData();
  }, [userId]);

  const fetchProjetosData = async () => {
    const { data: projetos } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId);

    if (projetos) {
      // Contar por status
      const statusCount = projetos.reduce((acc: any, projeto: any) => {
        const status = projeto.status || "Sem status";
        if (!acc[status]) acc[status] = 0;
        acc[status]++;
        return acc;
      }, {});

      setProjetosPorStatus(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

      // Contar por ambiente
      const ambienteCount = projetos.reduce((acc: any, projeto: any) => {
        const ambiente = projeto.ambiente || "Outros";
        if (!acc[ambiente]) acc[ambiente] = 0;
        acc[ambiente]++;
        return acc;
      }, {});

      setProjetosPorAmbiente(Object.entries(ambienteCount).map(([name, value]) => ({ name, value })));

      // Calcular estatísticas
      const emAndamento = projetos.filter(p => 
        ['APROVADO', 'EM_PRODUCAO', 'MONTAGEM'].includes(p.status)
      ).length;

      const concluidos = projetos.filter(p => p.status === 'ENTREGUE').length;

      const atrasados = projetos.filter(p => {
        if (!p.data_entrega) return false;
        return new Date(p.data_entrega) < new Date() && p.status !== 'ENTREGUE';
      }).length;

      setStats({
        totalProjetos: projetos.length,
        emAndamento,
        concluidos,
        atrasados,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjetos}</div>
            <p className="text-xs text-muted-foreground">Projetos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emAndamento}</div>
            <p className="text-xs text-muted-foreground">Projetos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidos}</div>
            <p className="text-xs text-muted-foreground">Projetos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atrasados}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projetos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projetosPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projetosPorStatus.map((entry, index) => (
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
            <CardTitle>Projetos por Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projetosPorAmbiente}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Taxa de Conversão do Funil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Orçamentos</span>
                  <span className="text-sm">100%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-8">
                  <div className="bg-blue-500 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ width: "100%" }}>
                    {stats.totalProjetos}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Em Produção</span>
                  <span className="text-sm">{stats.totalProjetos > 0 ? ((stats.emAndamento / stats.totalProjetos) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-8">
                  <div 
                    className="bg-green-500 h-8 rounded-full flex items-center justify-center text-white text-sm" 
                    style={{ width: stats.totalProjetos > 0 ? `${(stats.emAndamento / stats.totalProjetos) * 100}%` : "0%" }}
                  >
                    {stats.emAndamento}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Concluídos</span>
                  <span className="text-sm">{stats.totalProjetos > 0 ? ((stats.concluidos / stats.totalProjetos) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-8">
                  <div 
                    className="bg-purple-500 h-8 rounded-full flex items-center justify-center text-white text-sm" 
                    style={{ width: stats.totalProjetos > 0 ? `${(stats.concluidos / stats.totalProjetos) * 100}%` : "0%" }}
                  >
                    {stats.concluidos}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
