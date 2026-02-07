import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { GitCompare, Calendar, DollarSign, Package, ArrowRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type AnaliseHistorico = {
  id: string;
  foto_ambiente_url: string;
  analise_json: any;
  imagem_simulada_url: string | null;
  tipo_ambiente: string | null;
  data_analise: string;
};

export function ComparacaoAnalises() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selecionadas, setSelecionadas] = useState<AnaliseHistorico[]>([]);

  const { data: analises = [] } = useQuery({
    queryKey: ["analises-ambiente-comparacao", user?.id],
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
    enabled: !!user && open,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const toggleSelecionada = (analise: AnaliseHistorico) => {
    if (selecionadas.some((a) => a.id === analise.id)) {
      setSelecionadas(selecionadas.filter((a) => a.id !== analise.id));
    } else if (selecionadas.length < 2) {
      setSelecionadas([...selecionadas, analise]);
    }
  };

  const limparSelecao = () => {
    setSelecionadas([]);
  };

  const getMoveis = (analise: AnaliseHistorico) => {
    return analise.analise_json?.sugestoes_moveis || [];
  };

  const getValor = (analise: AnaliseHistorico) => {
    return analise.analise_json?.valor_total_estimado || 0;
  };

  const diferenca = selecionadas.length === 2
    ? getValor(selecionadas[1]) - getValor(selecionadas[0])
    : 0;

  const diferencaMoveis = selecionadas.length === 2
    ? getMoveis(selecionadas[1]).length - getMoveis(selecionadas[0]).length
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GitCompare className="h-4 w-4" />
          Comparar Análises
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparar Análises
          </DialogTitle>
        </DialogHeader>

        {selecionadas.length < 2 ? (
          <div className="flex-1 overflow-hidden">
            <p className="text-sm text-muted-foreground mb-4">
              Selecione 2 análises para comparar ({selecionadas.length}/2 selecionadas)
            </p>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {analises.map((analise) => {
                  const isSelected = selecionadas.some((a) => a.id === analise.id);
                  return (
                    <div
                      key={analise.id}
                      className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                      }`}
                      onClick={() => toggleSelecionada(analise)}
                    >
                      <Checkbox checked={isSelected} />
                      <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted">
                        {analise.imagem_simulada_url ? (
                          <img
                            src={analise.imagem_simulada_url}
                            alt="Simulação"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={analise.foto_ambiente_url}
                            alt="Ambiente"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {analise.tipo_ambiente && (
                            <Badge variant="secondary" className="capitalize text-xs">
                              {analise.tipo_ambiente}
                            </Badge>
                          )}
                          <span className="text-sm font-medium">
                            {formatCurrency(getValor(analise))}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(analise.data_analise), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="sm" onClick={limparSelecao} className="gap-1">
                <X className="h-4 w-4" />
                Nova Comparação
              </Button>
            </div>

            {/* Comparação lado a lado */}
            <div className="grid grid-cols-2 gap-4">
              {selecionadas.map((analise, index) => (
                <Card key={analise.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(analise.data_analise), "dd/MM/yyyy", { locale: ptBR })}
                      {analise.tipo_ambiente && (
                        <Badge variant="secondary" className="capitalize text-xs">
                          {analise.tipo_ambiente}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Imagem */}
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      {analise.imagem_simulada_url ? (
                        <img
                          src={analise.imagem_simulada_url}
                          alt="Simulação"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={analise.foto_ambiente_url}
                          alt="Ambiente"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    {/* Valor */}
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(getValor(analise))}
                      </span>
                    </div>

                    {/* Móveis */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{getMoveis(analise).length} móveis sugeridos</span>
                    </div>

                    {/* Lista de móveis */}
                    <div className="space-y-1">
                      {getMoveis(analise).slice(0, 5).map((movel: any, i: number) => (
                        <div key={i} className="text-xs flex justify-between">
                          <span className="truncate">{movel.nome}</span>
                          {movel.preco_estimado && (
                            <span className="text-muted-foreground">
                              {formatCurrency(movel.preco_estimado)}
                            </span>
                          )}
                        </div>
                      ))}
                      {getMoveis(analise).length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{getMoveis(analise).length - 5} mais...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumo da diferença */}
            <Card className="mt-4 border-dashed">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Diferença de Valor</p>
                    <p className={`text-lg font-bold ${diferenca >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {diferenca >= 0 ? "+" : ""}{formatCurrency(diferenca)}
                    </p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Diferença de Móveis</p>
                    <p className={`text-lg font-bold ${diferencaMoveis >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {diferencaMoveis >= 0 ? "+" : ""}{diferencaMoveis} móveis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
