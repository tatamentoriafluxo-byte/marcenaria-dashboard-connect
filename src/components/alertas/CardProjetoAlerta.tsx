import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Clock, MapPin, User } from 'lucide-react';
import { ProjetoComAlerta, TipoAlerta } from '@/hooks/useAlertasProjetos';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CardProjetoAlertaProps {
  projeto: ProjetoComAlerta;
  onClick?: () => void;
}

const alertaConfig: Record<TipoAlerta, { 
  bgClass: string; 
  borderClass: string; 
  iconClass: string;
  Icon: typeof CheckCircle;
  label: string;
}> = {
  VERDE: {
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle,
    label: 'OK',
  },
  AMARELO: {
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    Icon: AlertTriangle,
    label: 'Atenção',
  },
  VERMELHO: {
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-red-200 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    Icon: XCircle,
    label: 'Crítico',
  },
};

const statusLabels: Record<string, string> = {
  ORCAMENTO: 'Orçamento',
  CONVERTIDO: 'Convertido',
  EM_PRODUCAO: 'Em Produção',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export function CardProjetoAlerta({ projeto, onClick }: CardProjetoAlertaProps) {
  const config = alertaConfig[projeto.tipoAlerta];
  const { Icon } = config;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]',
        config.bgClass,
        config.borderClass,
        'border-2'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', config.iconClass)} />
            <span className="font-bold text-sm">{projeto.cod_projeto}</span>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              projeto.tipoAlerta === 'VERDE' && 'bg-emerald-100 text-emerald-700 border-emerald-300',
              projeto.tipoAlerta === 'AMARELO' && 'bg-amber-100 text-amber-700 border-amber-300',
              projeto.tipoAlerta === 'VERMELHO' && 'bg-red-100 text-red-700 border-red-300'
            )}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium truncate">{projeto.nome_cliente}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{projeto.ambiente}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDate(projeto.data_contato)}</span>
          </div>
          {projeto.valor_venda && (
            <span className="font-semibold text-foreground">
              {formatCurrency(projeto.valor_venda)}
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-border/50">
          <Badge variant="secondary" className="text-xs">
            {statusLabels[projeto.status] || projeto.status}
          </Badge>
        </div>

        {/* Motivos do alerta */}
        <div className="space-y-1">
          {projeto.motivosAlerta.slice(0, 2).map((motivo, idx) => (
            <p key={idx} className="text-xs text-muted-foreground truncate">
              • {motivo}
            </p>
          ))}
          {projeto.motivosAlerta.length > 2 && (
            <p className="text-xs text-muted-foreground">
              +{projeto.motivosAlerta.length - 2} mais...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
