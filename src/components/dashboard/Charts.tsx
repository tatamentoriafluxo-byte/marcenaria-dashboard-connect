import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartsProps {
  projetosPorStatus: any[];
  projetosPorOrigem: any[];
  projetosPorAmbiente: any[];
}

const COLORS = {
  status: ['hsl(25 65% 35%)', 'hsl(110 45% 25%)', 'hsl(43 74% 49%)', 'hsl(35 40% 85%)', 'hsl(0 84.2% 60.2%)'],
  origem: ['hsl(25 65% 35%)', 'hsl(25 65% 45%)', 'hsl(110 45% 25%)', 'hsl(43 74% 49%)', 'hsl(35 40% 65%)', 'hsl(30 25% 45%)'],
};

export const Charts = ({ projetosPorStatus, projetosPorOrigem, projetosPorAmbiente }: ChartsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-md">
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {projetosPorStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Projetos por Origem</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projetosPorOrigem}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(25 65% 35%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 shadow-md">
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
              <Bar dataKey="value" fill="hsl(110 45% 25%)" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
