import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, UserPlus, MapPin, TrendingUp } from "lucide-react";

type DashboardClientesProps = {
  userId: string;
};

export default function DashboardClientes({ userId }: DashboardClientesProps) {
  const [clientesPorEstado, setClientesPorEstado] = useState<any[]>([]);
  const [clientesPorMes, setClientesPorMes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalClientes: 0,
    novosEsseMes: 0,
    estadoMaisClientes: "",
    crescimentoMensal: 0,
  });

  useEffect(() => {
    fetchClientesData();
  }, [userId]);

  const fetchClientesData = async () => {
    const { data: clientes } = await supabase
      .from("clientes")
      .select("*")
      .eq("user_id", userId);

    if (clientes) {
      // Clientes por estado
      const porEstado = clientes.reduce((acc: any, cliente: any) => {
        const estado = cliente.estado || "Não informado";
        if (!acc[estado]) {
          acc[estado] = { estado, total: 0 };
        }
        acc[estado].total++;
        return acc;
      }, {});

      const clientesEstado = Object.values(porEstado).sort((a: any, b: any) => b.total - a.total);
      setClientesPorEstado(clientesEstado);

      // Clientes por mês
      const porMes = clientes.reduce((acc: any, cliente: any) => {
        if (cliente.created_at) {
          const mes = new Date(cliente.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          if (!acc[mes]) {
            acc[mes] = { mes, total: 0 };
          }
          acc[mes].total++;
        }
        return acc;
      }, {});

      setClientesPorMes(Object.values(porMes));

      // Estatísticas
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const novosEsseMes = clientes.filter(c => new Date(c.created_at) >= inicioMes).length;

      const estadoMaisClientes = clientesEstado.length > 0 ? (clientesEstado[0] as any).estado : "";

      setStats({
        totalClientes: clientes.length,
        novosEsseMes,
        estadoMaisClientes,
        crescimentoMensal: clientes.length > 0 ? (novosEsseMes / clientes.length) * 100 : 0,
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
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Este Mês</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.novosEsseMes}</div>
            <p className="text-xs text-muted-foreground">Clientes novos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estado Principal</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.estadoMaisClientes}</div>
            <p className="text-xs text-muted-foreground">Maior concentração</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.crescimentoMensal.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Crescimento mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clientes por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientesPorEstado}
                  dataKey="total"
                  nameKey="estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {clientesPorEstado.map((entry, index) => (
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
            <CardTitle>Evolução de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientesPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
