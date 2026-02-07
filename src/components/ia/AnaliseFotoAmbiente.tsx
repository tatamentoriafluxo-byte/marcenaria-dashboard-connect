import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Camera, Sparkles, Home, Ruler, Package, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
};

export function AnaliseFotoAmbiente() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [preferencias, setPreferencias] = useState("");
  const [resultado, setResultado] = useState<AnaliseResultado | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB");
      return;
    }

    try {
      setUploading(true);
      setResultado(null);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("fotos-ambientes")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("fotos-ambientes")
        .getPublicUrl(fileName);

      setImageUrl(urlData.publicUrl);
      toast.success("Foto carregada! Clique em 'Analisar' para continuar.");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao carregar foto");
    } finally {
      setUploading(false);
    }
  }, [user]);

  const handleAnalisar = async () => {
    if (!imageUrl || !user) return;

    try {
      setAnalisando(true);
      setResultado(null);

      const response = await supabase.functions.invoke("analisar-foto-ambiente", {
        body: {
          image_url: imageUrl,
          user_id: user.id,
          preferencias: preferencias || undefined,
        },
      });

      if (response.error) throw response.error;

      if (response.data?.analise) {
        setResultado(response.data.analise);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getComplexidadeBadge = (nivel?: string) => {
    switch (nivel?.toLowerCase()) {
      case "baixo":
        return <Badge className="bg-green-100 text-green-800">Baixa Complexidade</Badge>;
      case "médio":
      case "medio":
        return <Badge className="bg-yellow-100 text-yellow-800">Média Complexidade</Badge>;
      case "alto":
        return <Badge className="bg-red-100 text-red-800">Alta Complexidade</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Camera className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Análise de Foto com IA</h2>
      </div>
      <p className="text-muted-foreground">
        Envie uma foto do ambiente e a IA irá analisar e sugerir móveis planejados
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coluna de Upload */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Enviar Foto do Ambiente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {imageUrl ? (
                  <div className="space-y-4">
                    <img
                      src={imageUrl}
                      alt="Foto do ambiente"
                      className="max-h-64 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImageUrl(null);
                        setResultado(null);
                      }}
                    >
                      Trocar Foto
                    </Button>
                  </div>
                ) : (
                  <Label className="cursor-pointer block">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <div className="space-y-2">
                      {uploading ? (
                        <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
                      ) : (
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground">
                        {uploading ? "Carregando..." : "Clique para selecionar uma foto"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG ou WEBP - Máx. 10MB
                      </p>
                    </div>
                  </Label>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferencias">Preferências do Cliente (opcional)</Label>
                <Textarea
                  id="preferencias"
                  placeholder="Ex: Prefere cores claras, precisa de muito espaço de armazenamento, estilo moderno..."
                  value={preferencias}
                  onChange={(e) => setPreferencias(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleAnalisar}
                disabled={!imageUrl || analisando}
              >
                {analisando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analisar Ambiente
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna de Resultado */}
        <div className="space-y-4">
          {resultado && (
            <>
              {resultado.erro_parse && resultado.analise_texto ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Análise do Ambiente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm">{resultado.analise_texto}</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Card do Ambiente */}
                  {resultado.analise_ambiente && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          Análise do Ambiente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">
                            {resultado.analise_ambiente.tipo_ambiente}
                          </span>
                          {getComplexidadeBadge(resultado.nivel_complexidade)}
                        </div>

                        {resultado.analise_ambiente.dimensoes_estimadas && (
                          <div className="flex items-center gap-2 text-sm">
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {resultado.analise_ambiente.dimensoes_estimadas.largura_metros}m x{" "}
                              {resultado.analise_ambiente.dimensoes_estimadas.profundidade_metros}m
                              (pé-direito: {resultado.analise_ambiente.dimensoes_estimadas.pe_direito_metros}m)
                            </span>
                          </div>
                        )}

                        {resultado.analise_ambiente.caracteristicas?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Características:</p>
                            <div className="flex flex-wrap gap-2">
                              {resultado.analise_ambiente.caracteristicas.map((c, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {resultado.analise_ambiente.pontos_atencao?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              Pontos de Atenção:
                            </p>
                            <ul className="text-sm space-y-1">
                              {resultado.analise_ambiente.pontos_atencao.map((p, i) => (
                                <li key={i} className="text-muted-foreground">• {p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Card de Sugestões */}
                  {resultado.sugestoes_moveis && resultado.sugestoes_moveis.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Móveis Sugeridos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {resultado.sugestoes_moveis.map((movel, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{movel.nome}</h4>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {movel.tipo}
                                </p>
                              </div>
                              {movel.preco_estimado && (
                                <span className="font-bold text-primary">
                                  {formatCurrency(movel.preco_estimado)}
                                </span>
                              )}
                            </div>

                            {movel.dimensoes_sugeridas && (
                              <p className="text-xs text-muted-foreground">
                                Dimensões: {movel.dimensoes_sugeridas.largura}m x{" "}
                                {movel.dimensoes_sugeridas.altura}m x{" "}
                                {movel.dimensoes_sugeridas.profundidade}m
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {movel.material_sugerido && (
                                <Badge variant="outline" className="text-xs">
                                  {movel.material_sugerido}
                                </Badge>
                              )}
                              {movel.acabamento_sugerido && (
                                <Badge variant="outline" className="text-xs">
                                  {movel.acabamento_sugerido}
                                </Badge>
                              )}
                            </div>

                            {movel.item_catalogo_correspondente && (
                              <p className="text-xs flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Corresponde ao item: {movel.item_catalogo_correspondente}
                              </p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Card de Valor Total */}
                  {resultado.valor_total_estimado && (
                    <Card className="border-primary">
                      <CardContent className="py-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-6 w-6 text-primary" />
                            <span className="font-medium">Valor Total Estimado</span>
                          </div>
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(resultado.valor_total_estimado)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Layout Sugerido */}
                  {resultado.layout_sugerido && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Layout Sugerido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {resultado.layout_sugerido}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Observações */}
                  {resultado.observacoes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Observações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {resultado.observacoes}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {!resultado && !analisando && (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Envie uma foto para ver a análise aqui</p>
              </CardContent>
            </Card>
          )}

          {analisando && (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="font-medium">Analisando ambiente...</p>
                <p className="text-sm text-muted-foreground">
                  A IA está identificando dimensões e sugerindo móveis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
