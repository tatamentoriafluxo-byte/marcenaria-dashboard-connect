import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Image as ImageIcon, Calendar, Trash2, Eye, Loader2, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLinkPublico } from "@/hooks/useLinkPublico";

type AnaliseHistorico = {
  id: string;
  foto_ambiente_url: string;
  foto_referencia_url: string | null;
  analise_json: any;
  imagem_simulada_url: string | null;
  preferencias_cliente: string | null;
  tipo_ambiente: string | null;
  data_analise: string;
  created_at: string;
  link_publico: string | null;
};

export function HistoricoAnalises() {
  const { user } = useAuth();
  const [selectedAnalise, setSelectedAnalise] = useState<AnaliseHistorico | null>(null);
  const [deletando, setDeletando] = useState<string | null>(null);
  const { gerarLink, gerando: gerandoLink } = useLinkPublico();

  const { data: analises = [], isLoading, refetch } = useQuery({
    queryKey: ["analises-ambiente", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analises_ambiente")
        .select("*")
        .eq("user_id", user!.id)
        .order("data_analise", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as AnaliseHistorico[];
    },
    enabled: !!user,
  });

  const handleDeletar = async (id: string) => {
    try {
      setDeletando(id);
      const { error } = await supabase
        .from("analises_ambiente")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Análise removida do histórico");
      refetch();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao remover análise");
    } finally {
      setDeletando(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (analises.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma análise no histórico</p>
          <p className="text-sm mt-1">As análises realizadas aparecerão aqui</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Análises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {analises.map((analise) => (
                <div
                  key={analise.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
                    {analise.imagem_simulada_url ? (
                      <img
                        src={analise.imagem_simulada_url}
                        alt="Simulação"
                        className="w-full h-full object-cover"
                      />
                    ) : analise.foto_ambiente_url ? (
                      <img
                        src={analise.foto_ambiente_url}
                        alt="Ambiente"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {analise.tipo_ambiente && (
                        <Badge variant="secondary" className="capitalize text-xs">
                          {analise.tipo_ambiente}
                        </Badge>
                      )}
                      {analise.analise_json?.valor_total_estimado && (
                        <span className="text-sm font-medium text-primary">
                          {formatCurrency(analise.analise_json.valor_total_estimado)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(analise.data_analise), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                    </div>
                    {analise.analise_json?.sugestoes_moveis && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {analise.analise_json.sugestoes_moveis.length} móveis sugeridos
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedAnalise(analise)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => gerarLink(analise.id)}
                      disabled={gerandoLink}
                      title={analise.link_publico ? "Copiar link" : "Gerar link público"}
                    >
                      {gerandoLink ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className={`h-4 w-4 ${analise.link_publico ? "text-primary" : ""}`} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletar(analise.id)}
                      disabled={deletando === analise.id}
                      title="Excluir"
                    >
                      {deletando === analise.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog open={!!selectedAnalise} onOpenChange={() => setSelectedAnalise(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Detalhes da Análise
              {selectedAnalise?.tipo_ambiente && (
                <Badge variant="secondary" className="capitalize ml-2">
                  {selectedAnalise.tipo_ambiente}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedAnalise && (
            <div className="space-y-4">
              {/* Imagens */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Foto Original</p>
                  <img
                    src={selectedAnalise.foto_ambiente_url}
                    alt="Ambiente original"
                    className="w-full rounded-lg object-contain max-h-[300px]"
                  />
                </div>
                {selectedAnalise.imagem_simulada_url && (
                  <div>
                    <p className="text-sm font-medium mb-2">Simulação IA</p>
                    <img
                      src={selectedAnalise.imagem_simulada_url}
                      alt="Simulação"
                      className="w-full rounded-lg object-contain max-h-[300px]"
                    />
                  </div>
                )}
              </div>

              {/* Valor Total */}
              {selectedAnalise.analise_json?.valor_total_estimado && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Valor Total Estimado</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedAnalise.analise_json.valor_total_estimado)}
                    </span>
                  </div>
                </div>
              )}

              {/* Móveis Sugeridos */}
              {selectedAnalise.analise_json?.sugestoes_moveis?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Móveis Sugeridos</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAnalise.analise_json.sugestoes_moveis.map((movel: any, i: number) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm">{movel.nome}</p>
                        <p className="text-xs text-muted-foreground capitalize">{movel.tipo}</p>
                        {movel.preco_estimado && (
                          <p className="text-sm font-medium text-primary mt-1">
                            {formatCurrency(movel.preco_estimado)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferências */}
              {selectedAnalise.preferencias_cliente && (
                <div>
                  <p className="text-sm font-medium mb-1">Preferências do Cliente</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAnalise.preferencias_cliente}
                  </p>
                </div>
              )}

              {/* Data */}
              <p className="text-xs text-muted-foreground">
                Análise realizada em {format(new Date(selectedAnalise.data_analise), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
