import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Package, Target } from 'lucide-react';

interface StatsCardsProps {
  totalProjetos: number;
  taxaConversao: number;
  faturamentoTotal: number;
  ticketMedio: number;
}

export const StatsCards = ({ totalProjetos, taxaConversao, faturamentoTotal, ticketMedio }: StatsCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
          <Package className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalProjetos}</div>
          <p className="text-xs text-muted-foreground mt-1">projetos cadastrados</p>
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          <Target className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{taxaConversao.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">orçamentos convertidos</p>
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
          <DollarSign className="h-4 w-4 text-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: 'hsl(var(--gold))' }}>
            {formatCurrency(faturamentoTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">vendas realizadas</p>
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(ticketMedio)}</div>
          <p className="text-xs text-muted-foreground mt-1">valor médio por venda</p>
        </CardContent>
      </Card>
    </div>
  );
};
