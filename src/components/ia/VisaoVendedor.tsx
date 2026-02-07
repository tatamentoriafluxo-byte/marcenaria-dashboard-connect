import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Ruler, Package, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

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

interface VisaoVendedorProps {
  resultado: AnaliseResultado;
}

export function VisaoVendedor({ resultado }: VisaoVendedorProps) {
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
    </div>
  );
}
