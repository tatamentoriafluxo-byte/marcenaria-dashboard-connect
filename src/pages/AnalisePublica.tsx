import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, DollarSign, Package, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AnalisePublica = {
  id: string;
  imagem_simulada_url: string | null;
  foto_ambiente_url: string;
  tipo_ambiente: string | null;
  analise_json: any;
  data_analise: string;
};

export default function AnalisePublica() {
  const { linkId } = useParams<{ linkId: string }>();

  const { data: analise, isLoading, error } = useQuery({
    queryKey: ["analise-publica", linkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analises_ambiente")
        .select("id, imagem_simulada_url, foto_ambiente_url, tipo_ambiente, analise_json, data_analise")
        .eq("link_publico", linkId)
        .single();

      if (error) throw error;
      return data as AnalisePublica;
    },
    enabled: !!linkId,
    retry: false,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleWhatsApp = () => {
    const valor = analise?.analise_json?.valor_total_estimado;
    const tipo = analise?.tipo_ambiente || "ambiente";
    const moveis = analise?.analise_json?.sugestoes_moveis?.length || 0;

    const mensagem = `Olá! Gostei da simulação do meu ${tipo}.\n\n` +
      (valor ? `💰 Valor estimado: ${formatCurrency(valor)}\n` : "") +
      `📦 ${moveis} móveis sugeridos\n\n` +
      `Gostaria de mais informações!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando análise...</p>
        </div>
      </div>
    );
  }

  if (error || !analise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Link inválido ou expirado</h2>
            <p className="text-muted-foreground">
              Esta análise não foi encontrada ou o link não está mais disponível.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const valor = analise.analise_json?.valor_total_estimado;
  const moveis = analise.analise_json?.sugestoes_moveis || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Simulação do Seu Ambiente</h1>
          {analise.tipo_ambiente && (
            <Badge variant="secondary" className="capitalize text-base px-4 py-1">
              {analise.tipo_ambiente}
            </Badge>
          )}
        </div>

        {/* Imagem Principal */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-muted">
            {analise.imagem_simulada_url ? (
              <img
                src={analise.imagem_simulada_url}
                alt="Simulação do ambiente"
                className="w-full h-full object-contain"
              />
            ) : analise.foto_ambiente_url ? (
              <img
                src={analise.foto_ambiente_url}
                alt="Foto do ambiente"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </Card>

        {/* Valor Estimado */}
        {valor && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor Estimado</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(valor)}</p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                *Valor estimado baseado na análise do ambiente. O orçamento final pode variar.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Móveis Sugeridos */}
        {moveis.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium">{moveis.length} móveis sugeridos</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {moveis.map((movel: any, i: number) => (
                  <div key={i} className="p-2 bg-muted/50 rounded-md">
                    <p className="font-medium text-sm truncate">{movel.nome}</p>
                    {movel.preco_estimado && (
                      <p className="text-xs text-primary">{formatCurrency(movel.preco_estimado)}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão de Contato */}
        <Button className="w-full gap-2 py-6 text-lg" size="lg" onClick={handleWhatsApp}>
          <MessageCircle className="h-5 w-5" />
          Falar com o Vendedor
        </Button>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          Análise gerada com inteligência artificial
        </p>
      </div>
    </div>
  );
}
