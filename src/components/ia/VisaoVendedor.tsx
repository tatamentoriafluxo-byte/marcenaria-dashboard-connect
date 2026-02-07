import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, Ruler, Package, DollarSign, AlertCircle, CheckCircle, Plus, Loader2, Tag, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type SugestaoMovel = {
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
  catalogo_item_id?: string;
  preco_estimado?: number;
  preco_catalogo?: number;
  preco_origem?: "catalogo" | "estimativa";
};

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
  sugestoes_moveis?: SugestaoMovel[];
  layout_sugerido?: string;
  valor_total_estimado?: number;
  observacoes?: string;
  nivel_complexidade?: string;
  analise_texto?: string;
  erro_parse?: boolean;
};

interface VisaoVendedorProps {
  resultado: AnaliseResultado;
}

// Mapeamento de tipo de móvel para categoria do catálogo
const mapearCategoria = (tipo: string): "ACABAMENTO" | "ACESSORIO" | "ARMARIO" | "BALCAO" | "FERRAGEM" | "GAVETA" | "ILUMINACAO" | "OUTROS" | "PORTA" | "VIDRO" => {
  const tipoLower = tipo?.toLowerCase() || "";
  
  if (tipoLower.includes("armário") || tipoLower.includes("armario") || tipoLower.includes("guarda")) {
    return "ARMARIO";
  }
  if (tipoLower.includes("bancada") || tipoLower.includes("balcão") || tipoLower.includes("balcao") || tipoLower.includes("mesa")) {
    return "BALCAO";
  }
  if (tipoLower.includes("porta")) {
    return "PORTA";
  }
  if (tipoLower.includes("gaveta")) {
    return "GAVETA";
  }
  if (tipoLower.includes("vidro") || tipoLower.includes("espelho")) {
    return "VIDRO";
  }
  if (tipoLower.includes("ferragem") || tipoLower.includes("dobradiça") || tipoLower.includes("puxador")) {
    return "FERRAGEM";
  }
  if (tipoLower.includes("luz") || tipoLower.includes("led") || tipoLower.includes("luminária")) {
    return "ILUMINACAO";
  }
  return "OUTROS";
};

export function VisaoVendedor({ resultado }: VisaoVendedorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [adicionando, setAdicionando] = useState(false);
  const [criandoOrcamento, setCriandoOrcamento] = useState(false);

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

  // Móveis que NÃO têm correspondência no catálogo (podem ser adicionados)
  const moveisNovos = resultado.sugestoes_moveis?.filter(
    (m) => !m.catalogo_item_id && m.preco_origem !== "catalogo"
  ) || [];

  const toggleSelecionado = (index: number) => {
    const newSet = new Set(selecionados);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelecionados(newSet);
  };

  const toggleTodos = () => {
    if (selecionados.size === moveisNovos.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(moveisNovos.map((_, i) => i)));
    }
  };

  const handleAdicionarAoCatalogo = async () => {
    if (!user || selecionados.size === 0) return;

    try {
      setAdicionando(true);

      const itensParaAdicionar = moveisNovos
        .filter((_, i) => selecionados.has(i))
        .map((movel) => ({
          user_id: user.id,
          nome: movel.nome,
          categoria: mapearCategoria(movel.tipo),
          preco_base: movel.preco_estimado || 0,
          descricao: [
            movel.tipo && `Tipo: ${movel.tipo}`,
            movel.material_sugerido && `Material: ${movel.material_sugerido}`,
            movel.acabamento_sugerido && `Acabamento: ${movel.acabamento_sugerido}`,
            movel.dimensoes_sugeridas && `Dimensões: ${movel.dimensoes_sugeridas.largura}m x ${movel.dimensoes_sugeridas.altura}m x ${movel.dimensoes_sugeridas.profundidade}m`,
          ].filter(Boolean).join(" | "),
          ativo: true,
        }));

      const { error } = await supabase
        .from("catalogo_itens")
        .insert(itensParaAdicionar);

      if (error) throw error;

      toast.success(`${itensParaAdicionar.length} item(ns) adicionado(s) ao catálogo!`);
      setSelecionados(new Set());
    } catch (error) {
      console.error("Erro ao adicionar ao catálogo:", error);
      toast.error("Erro ao adicionar itens ao catálogo");
    } finally {
      setAdicionando(false);
    }
  };

  const handleCriarOrcamento = async () => {
    if (!user || !resultado.sugestoes_moveis || resultado.sugestoes_moveis.length === 0) return;

    try {
      setCriandoOrcamento(true);

      // Criar orçamento vazio primeiro
      const { data: orcamento, error: orcError } = await supabase
        .from("orcamentos")
        .insert({
          user_id: user.id,
          nome_cliente: "Cliente da Análise IA",
          status: "RASCUNHO",
          observacoes: `Orçamento gerado a partir de análise de foto com IA.\nTipo de ambiente: ${resultado.analise_ambiente?.tipo_ambiente || "N/A"}\n${resultado.observacoes || ""}`,
        })
        .select("id")
        .single();

      if (orcError) throw orcError;

      // Adicionar itens
      const itensParaInserir = resultado.sugestoes_moveis.map((movel, index) => ({
        orcamento_id: orcamento.id,
        catalogo_item_id: movel.catalogo_item_id || null,
        nome_item: movel.nome,
        descricao: [
          movel.tipo && `Tipo: ${movel.tipo}`,
          movel.material_sugerido && `Material: ${movel.material_sugerido}`,
          movel.acabamento_sugerido && `Acabamento: ${movel.acabamento_sugerido}`,
          movel.dimensoes_sugeridas && `Dimensões: ${movel.dimensoes_sugeridas.largura}m x ${movel.dimensoes_sugeridas.altura}m x ${movel.dimensoes_sugeridas.profundidade}m`,
        ].filter(Boolean).join(" | "),
        quantidade: 1,
        unidade_medida: "UNIDADE" as const,
        preco_unitario: movel.preco_estimado || 0,
        ordem: index,
        tipo_calculo: "UNITARIO" as const,
      }));

      const { error: itensError } = await supabase
        .from("orcamentos_itens")
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      toast.success("Orçamento criado! Redirecionando...");
      navigate(`/novo-orcamento/${orcamento.id}`);
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast.error("Erro ao criar orçamento");
    } finally {
      setCriandoOrcamento(false);
    }
  };

  // Se houver erro de parse, mostrar texto bruto
  if (resultado.erro_parse && resultado.analise_texto) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise do Ambiente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{resultado.analise_texto}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
            {resultado.sugestoes_moveis.map((movel, index) => {
              const isNovo = !movel.catalogo_item_id && movel.preco_origem !== "catalogo";
              const novoIndex = isNovo ? moveisNovos.findIndex(m => m.nome === movel.nome) : -1;
              
              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      {isNovo && novoIndex !== -1 && (
                        <Checkbox
                          checked={selecionados.has(novoIndex)}
                          onCheckedChange={() => toggleSelecionado(novoIndex)}
                          className="mt-1"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{movel.nome}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {movel.tipo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {movel.preco_estimado && (
                        <span className="font-bold text-primary">
                          {formatCurrency(movel.preco_estimado)}
                        </span>
                      )}
                      {movel.preco_origem === "catalogo" ? (
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                          <Tag className="h-3 w-3" />
                          <span>Preço do catálogo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Estimativa IA</span>
                        </div>
                      )}
                    </div>
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

                  {movel.item_catalogo_correspondente && movel.preco_origem === "catalogo" && (
                    <p className="text-xs flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Corresponde ao item: {movel.item_catalogo_correspondente}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Botão para adicionar ao catálogo */}
            {moveisNovos.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTodos}
                    className="text-xs"
                  >
                    {selecionados.size === moveisNovos.length ? "Desmarcar todos" : "Selecionar todos"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selecionados.size} de {moveisNovos.length} selecionado(s)
                  </span>
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={handleAdicionarAoCatalogo}
                  disabled={selecionados.size === 0 || adicionando}
                >
                  {adicionando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Adicionar Selecionados ao Catálogo ({selecionados.size})
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Itens já existentes no catálogo não serão duplicados
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card de Valor Total + Criar Orçamento */}
      {resultado.valor_total_estimado && (
        <Card className="border-primary">
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="font-medium">Valor Total Estimado</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(resultado.valor_total_estimado)}
              </span>
            </div>
            
            {/* Botão Criar Orçamento */}
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleCriarOrcamento}
              disabled={criandoOrcamento || !resultado.sugestoes_moveis?.length}
            >
              {criandoOrcamento ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando orçamento...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Criar Orçamento com Esses Itens
                </>
              )}
            </Button>
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
    </div>
  );
}
