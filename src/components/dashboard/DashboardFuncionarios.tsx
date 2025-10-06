import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UserCog, Users, UserCheck, DollarSign } from "lucide-react";

type DashboardFuncionariosProps = {
  userId: string;
};

export default function DashboardFuncionarios({ userId }: DashboardFuncionariosProps) {
  const [funcionariosPorTipo, setFuncionariosPorTipo] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalFuncionarios: 0,
    ativos: 0,
    inativos: 0,
    folhaPagamento: 0,
  });

  useEffect(() => {
    fetchFuncionariosData();
  }, [userId]);

  const fetchFuncionariosData = async () => {
    const { data: funcionarios } = await supabase
      .from("funcionarios")
      .select("*")
      .eq("user_id", userId);

    if (funcionarios) {
      // Funcionários por tipo
      const porTipo = funcionarios.reduce((acc: any, func: any) => {
        const tipo = func.tipo || "Não informado";
        if (!acc[tipo]) {
          acc[tipo] = { tipo, total: 0 };
        }
        acc[tipo].total++;
        return acc;
      }, {});

      setFuncionariosPorTipo(Object.values(porTipo));

      // Estatísticas
      const ativos = funcionarios.filter(f => f.ativo).length;
      const folhaPagamento = funcionarios.reduce((sum, f) => sum + (f.salario || 0), 0);

      setStats({
        totalFuncionarios: funcionarios.length,
        ativos,
        inativos: funcionarios.length - ativos,
        folhaPagamento,
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
            <CardTitle className="text-sm font-medium">Total Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFuncionarios}</div>
            <p className="text-xs text-muted-foreground">Funcionários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ativos}</div>
            <p className="text-xs text-muted-foreground">Funcionários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inativos}</div>
            <p className="text-xs text-muted-foreground">Funcionários inativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Folha de Pagamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.folhaPagamento.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Total mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionários por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={funcionariosPorTipo}
                dataKey="total"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {funcionariosPorTipo.map((entry, index) => (
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
  );
}
