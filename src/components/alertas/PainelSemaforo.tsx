import { useAlertasProjetos, TipoAlerta } from '@/hooks/useAlertasProjetos';
import { CardProjetoAlerta } from './CardProjetoAlerta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, XCircle, LayoutGrid, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PainelSemaforoProps {
  showTitle?: boolean;
  maxItems?: number;
  compact?: boolean;
}

export function PainelSemaforo({ showTitle = true, maxItems, compact = false }: PainelSemaforoProps) {
  const { 
    projetos, 
    projetosVerdes, 
    projetosAmarelos, 
    projetosVermelhos, 
    loading,
    refetch 
  } = useAlertasProjetos();
  const navigate = useNavigate();

  const handleProjetoClick = (projetoId: string) => {
    navigate(`/editar-projeto/${projetoId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && <Skeleton className="h-8 w-64" />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  const getDisplayItems = (items: typeof projetos) => {
    return maxItems ? items.slice(0, maxItems) : items;
  };

  // Cards de resumo
  const SummaryCards = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">Críticos</p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                {projetosVermelhos.length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Atenção</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                {projetosAmarelos.length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">OK</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                {projetosVerdes.length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Grid de projetos por tipo
  const ProjetosGrid = ({ items, emptyMessage }: { items: typeof projetos; emptyMessage: string }) => {
    const displayItems = getDisplayItems(items);
    
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className={cn(
        "grid gap-4",
        compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}>
        {displayItems.map(projeto => (
          <CardProjetoAlerta
            key={projeto.id}
            projeto={projeto}
            onClick={() => handleProjetoClick(projeto.id)}
          />
        ))}
        {maxItems && items.length > maxItems && (
          <Card 
            className="flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors border-dashed"
            onClick={() => navigate('/projetos')}
          >
            <CardContent className="text-center py-8">
              <LayoutGrid className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                +{items.length - maxItems} projetos
              </p>
              <p className="text-xs text-muted-foreground">
                Ver todos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Painel de Alertas</h2>
            <Badge variant="outline" className="text-xs">
              {projetos.length} projetos ativos
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      )}

      <SummaryCards />

      <Tabs defaultValue="criticos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="criticos" className="gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="hidden sm:inline">Críticos</span>
            <Badge variant="destructive" className="ml-1">{projetosVermelhos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="atencao" className="gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="hidden sm:inline">Atenção</span>
            <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">{projetosAmarelos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ok" className="gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">OK</span>
            <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700">{projetosVerdes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="todos" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Todos</span>
            <Badge variant="outline" className="ml-1">{projetos.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="criticos" className="mt-4">
          <ProjetosGrid 
            items={projetosVermelhos} 
            emptyMessage="Nenhum projeto crítico! 🎉" 
          />
        </TabsContent>

        <TabsContent value="atencao" className="mt-4">
          <ProjetosGrid 
            items={projetosAmarelos} 
            emptyMessage="Nenhum projeto necessitando atenção" 
          />
        </TabsContent>

        <TabsContent value="ok" className="mt-4">
          <ProjetosGrid 
            items={projetosVerdes} 
            emptyMessage="Nenhum projeto ativo no momento" 
          />
        </TabsContent>

        <TabsContent value="todos" className="mt-4">
          <ProjetosGrid 
            items={projetos} 
            emptyMessage="Nenhum projeto cadastrado" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
