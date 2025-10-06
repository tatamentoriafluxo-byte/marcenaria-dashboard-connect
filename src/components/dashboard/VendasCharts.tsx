import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface VendasChartsProps {
  dashboardVendas: any[];
}

export const VendasCharts = ({ dashboardVendas }: VendasChartsProps) => {
  const vendasPorVendedor = dashboardVendas
    .filter(v => v.vendedor_nome)
    .map(v => ({
      vendedor: v.vendedor_nome,
      faturamento: parseFloat(v.faturamento_total || 0),
      vendas: parseInt(v.total_vendas || 0),
      lucro: parseFloat(v.lucro_total || 0)
    }))
    .sort((a, b) => b.faturamento - a.faturamento);

  const vendasPorMes = dashboardVendas
    .map(v => ({
      mes: new Date(v.mes).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      faturamento: parseFloat(v.faturamento_total || 0),
      lucro: parseFloat(v.lucro_total || 0),
      vendas: parseInt(v.total_vendas || 0)
    }))
    .sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Faturamento por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendasPorVendedor}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="vendedor" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }}
              />
              <Legend />
              <Bar dataKey="faturamento" fill="hsl(var(--primary))" name="Faturamento" />
              <Bar dataKey="lucro" fill="hsl(var(--gold))" name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Número de Vendas por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendasPorVendedor}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="vendedor" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }}
              />
              <Bar dataKey="vendas" fill="hsl(var(--accent))" name="Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {vendasPorMes.length > 0 && (
        <Card className="md:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Evolução de Vendas ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vendasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="faturamento" stroke="hsl(var(--primary))" strokeWidth={2} name="Faturamento" />
                <Line type="monotone" dataKey="lucro" stroke="hsl(var(--gold))" strokeWidth={2} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
