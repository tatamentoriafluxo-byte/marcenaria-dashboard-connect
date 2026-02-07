import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Share2, Image as ImageIcon, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface VisaoClienteProps {
  imagemSimuladaUrl: string | null;
  valorTotalEstimado: number | null;
  gerandoImagem: boolean;
}

export function VisaoCliente({ imagemSimuladaUrl, valorTotalEstimado, gerandoImagem }: VisaoClienteProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCompartilhar = async () => {
    if (imagemSimuladaUrl) {
      try {
        await navigator.clipboard.writeText(imagemSimuladaUrl);
        toast.success("Link da imagem copiado!");
      } catch {
        window.open(imagemSimuladaUrl, "_blank");
      }
    }
  };

  const handleBaixar = async () => {
    if (!imagemSimuladaUrl) return;

    try {
      toast.info("Preparando download...");
      
      const response = await fetch(imagemSimuladaUrl);
      if (!response.ok) throw new Error("Falha ao baixar imagem");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      
      // Nome amigável com data
      const date = new Date().toISOString().split("T")[0];
      const extension = blob.type.includes("png") ? "png" : "jpg";
      link.download = `simulacao_ambiente_${date}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      toast.success("Imagem baixada com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      toast.error("Erro ao baixar. Tente abrir o link e salvar manualmente.");
      window.open(imagemSimuladaUrl, "_blank");
    }
  };

  if (gerandoImagem) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[400px]">
        <CardContent className="text-center">
          <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
          <p className="font-medium text-lg">Gerando simulação...</p>
          <p className="text-sm text-muted-foreground mt-2">
            A IA está criando uma visualização do seu ambiente com os móveis sugeridos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Imagem Simulada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Simulação do Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {imagemSimuladaUrl ? (
            <div className="space-y-4">
              <img
                src={imagemSimuladaUrl}
                alt="Simulação do ambiente com móveis"
                className="w-full rounded-lg object-contain max-h-[400px]"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleBaixar}
                >
                  <Download className="h-4 w-4" />
                  Baixar Imagem
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleCompartilhar}
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Simulação visual não disponível</p>
              <p className="text-xs mt-1">A IA não conseguiu gerar a imagem nesta análise</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Valor Total */}
      {valorTotalEstimado && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="font-medium">Valor Estimado</span>
              </div>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(valorTotalEstimado)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              *Valor estimado baseado na análise do ambiente. O orçamento final pode variar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
