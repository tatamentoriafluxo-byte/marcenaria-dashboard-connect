import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Camera, Sparkles, Eye, Settings, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadFotoAmbiente } from "./UploadFotoAmbiente";
import { VisaoCliente } from "./VisaoCliente";
import { VisaoVendedor } from "./VisaoVendedor";
import { HistoricoAnalises } from "./HistoricoAnalises";
import { TemplatesPreferencias } from "./TemplatesPreferencias";
import { ComparacaoAnalises } from "./ComparacaoAnalises";

type AnaliseResultado = {
  analise_ambiente?: {
    tipo_ambiente: string;
    dimensoes_estimadas?: {
      largura_metros: number;
      profundidade_metros: number;
      pe_direito_metros: number;
    };
    caracteristicas: string[];
    pontos_atencao: string[];
  };
  sugestoes_moveis?: Array<{
    nome: string;
    tipo: string;
    dimensoes_sugeridas?: {
      largura: number;
      altura: number;
      profundidade: number;
    };
    material_sugerido?: string;
    acabamento_sugerido?: string;
    item_catalogo_correspondente?: string | null;
    preco_estimado?: number;
  }>;
  layout_sugerido?: string;
  valor_total_estimado?: number;
  observacoes?: string;
  nivel_complexidade?: string;
  analise_texto?: string;
  erro_parse?: boolean;
  descricao_visual_completa?: string;
};

export function AnaliseFotoAmbiente() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadingReferencia, setUploadingReferencia] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [referenciaUrl, setReferenciaUrl] = useState<string | null>(null);
  const [preferencias, setPreferencias] = useState("");
  const [resultado, setResultado] = useState<AnaliseResultado | null>(null);
  const [imagemSimuladaUrl, setImagemSimuladaUrl] = useState<string | null>(null);
  const [analiseId, setAnaliseId] = useState<string | null>(null);
  const [visaoAtiva, setVisaoAtiva] = useState<"cliente" | "vendedor">("cliente");
  const [showHistorico, setShowHistorico] = useState(false);

  // Buscar nome da marcenaria do perfil
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("nome_marcenaria")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleFileUpload = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    tipo: "ambiente" | "referencia"
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB");
      return;
    }

    try {
      if (tipo === "ambiente") {
        setUploading(true);
      } else {
        setUploadingReferencia(true);
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${tipo}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("fotos-ambientes")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("fotos-ambientes")
        .getPublicUrl(fileName);

      if (tipo === "ambiente") {
        setImageUrl(urlData.publicUrl);
        setResultado(null);
        setImagemSimuladaUrl(null);
        toast.success("Foto do ambiente carregada!");
      } else {
        setReferenciaUrl(urlData.publicUrl);
        toast.success("Foto de referência carregada!");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao carregar foto");
    } finally {
      if (tipo === "ambiente") {
        setUploading(false);
      } else {
        setUploadingReferencia(false);
      }
    }
  }, [user]);

  const handleAnalisar = async () => {
    if (!imageUrl || !user) return;

    try {
      setAnalisando(true);
      setResultado(null);
      setImagemSimuladaUrl(null);
      setAnaliseId(null);

      const response = await supabase.functions.invoke("analisar-foto-ambiente", {
        body: {
          image_url: imageUrl,
          referencia_url: referenciaUrl || undefined,
          user_id: user.id,
          preferencias: preferencias || undefined,
        },
      });

      if (response.error) throw response.error;

      if (response.data?.analise) {
        setResultado(response.data.analise);
        if (response.data.imagem_simulada_url) {
          setImagemSimuladaUrl(response.data.imagem_simulada_url);
        }
        if (response.data.analise_id) {
          setAnaliseId(response.data.analise_id);
        }
        // Invalidar cache do histórico para mostrar a nova análise
        queryClient.invalidateQueries({ queryKey: ["analises-ambiente", user?.id] });
        toast.success("Análise concluída!");
      } else {
        throw new Error("Resposta inválida da análise");
      }
    } catch (error) {
      console.error("Erro na análise:", error);
      toast.error("Erro ao analisar foto. Tente novamente.");
    } finally {
      setAnalisando(false);
    }
  };

  const handleRemoveAmbiente = () => {
    setImageUrl(null);
    setResultado(null);
    setImagemSimuladaUrl(null);
    setAnaliseId(null);
  };

  const handleRemoveReferencia = () => {
    setReferenciaUrl(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Camera className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Análise de Foto com IA</h2>
        </div>
        <div className="flex gap-2">
          <ComparacaoAnalises />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistorico(!showHistorico)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            {showHistorico ? "Nova Análise" : "Histórico"}
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">
        Envie uma foto do ambiente e a IA irá analisar, sugerir móveis e gerar uma simulação visual do projeto
      </p>

      {showHistorico ? (
        <HistoricoAnalises />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Coluna de Upload e Configurações */}
          <div className="space-y-4">
          <UploadFotoAmbiente
            imageUrl={imageUrl}
            referenciaUrl={referenciaUrl}
            uploading={uploading}
            uploadingReferencia={uploadingReferencia}
            onUploadAmbiente={(e) => handleFileUpload(e, "ambiente")}
            onUploadReferencia={(e) => handleFileUpload(e, "referencia")}
            onRemoveAmbiente={handleRemoveAmbiente}
            onRemoveReferencia={handleRemoveReferencia}
          />

          {/* Preferências */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="preferencias">Preferências do Cliente (opcional)</Label>
                <TemplatesPreferencias value={preferencias} onChange={setPreferencias} />
              </div>
              <Textarea
                id="preferencias"
                placeholder="Ex: Prefere cores claras, precisa de muito espaço de armazenamento, estilo moderno..."
                value={preferencias}
                onChange={(e) => setPreferencias(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Botão de Análise */}
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleAnalisar}
            disabled={!imageUrl || analisando}
          >
            {analisando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analisando e gerando simulação...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Análise e Simulação
              </>
            )}
          </Button>
        </div>

        {/* Coluna de Resultado */}
        <div className="space-y-4">
          {resultado ? (
            <Tabs value={visaoAtiva} onValueChange={(v) => setVisaoAtiva(v as "cliente" | "vendedor")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cliente" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Visão Cliente
                </TabsTrigger>
                <TabsTrigger value="vendedor" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Visão Interna
                </TabsTrigger>
              </TabsList>
              <TabsContent value="cliente" className="mt-4">
                <VisaoCliente
                  imagemSimuladaUrl={imagemSimuladaUrl}
                  valorTotalEstimado={resultado.valor_total_estimado || null}
                  gerandoImagem={false}
                  tipoAmbiente={resultado.analise_ambiente?.tipo_ambiente}
                />
              </TabsContent>
              <TabsContent value="vendedor" className="mt-4">
                <VisaoVendedor 
                  resultado={resultado} 
                  fotoAmbienteUrl={imageUrl || undefined}
                  imagemSimuladaUrl={imagemSimuladaUrl}
                  analiseId={analiseId || undefined}
                  nomeMarcenaria={profile?.nome_marcenaria}
                />
              </TabsContent>
            </Tabs>
          ) : analisando ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center">
                <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
                <p className="font-medium text-lg">Analisando ambiente...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  A IA está identificando dimensões, sugerindo móveis e gerando a simulação visual
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center text-muted-foreground">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Envie uma foto para começar</p>
                <p className="text-sm mt-2">
                  A análise incluirá sugestões de móveis e uma simulação visual do ambiente pronto
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
