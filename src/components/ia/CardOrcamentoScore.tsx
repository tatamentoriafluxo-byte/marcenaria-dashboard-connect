import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar, TrendingUp, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OrcamentoComScore, NivelScore } from "@/hooks/useScoreFechamento";

type CardOrcamentoScoreProps = {
  orcamento: OrcamentoComScore;
  nivel: NivelScore;
};

export function CardOrcamentoScore({ orcamento, nivel }: CardOrcamentoScoreProps) {
  const getBorderColor = () => {
    switch (nivel) {
      case "ALTO":
        return "border-l-4 border-l-green-500";
      case "MEDIO":
        return "border-l-4 border-l-yellow-500";
      case "BAIXO":
        return "border-l-4 border-l-red-500";
    }
  };

  const getScoreBadge = () => {
    const score = orcamento.score_fechamento ?? 0;
    const bgColor = nivel === "ALTO" ? "bg-green-100 text-green-800" : 
                   nivel === "MEDIO" ? "bg-yellow-100 text-yellow-800" : 
                   "bg-red-100 text-red-800";
    return (
      <Badge className={`${bgColor} font-bold text-sm`}>
        {score}%
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className={`${getBorderColor()} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {orcamento.nome_cliente}
            </CardTitle>
            {orcamento.numero_orcamento && (
              <p className="text-xs text-muted-foreground mt-1">
                {orcamento.numero_orcamento}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            {getScoreBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-lg">
            {formatCurrency(orcamento.valor_total)}
          </span>
          <Badge variant="outline" className="text-xs">
            {orcamento.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {orcamento.telefone_cliente && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{orcamento.telefone_cliente}</span>
            </div>
          )}
          {orcamento.email_cliente && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>{orcamento.email_cliente}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(orcamento.data_orcamento), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>

        {orcamento.sugestoes_ia && orcamento.sugestoes_ia.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
              <Lightbulb className="h-3 w-3" />
              <span>Sugestões IA</span>
            </div>
            <ul className="space-y-1">
              {orcamento.sugestoes_ia.map((sugestao, index) => (
                <li key={index} className="text-xs text-foreground">
                  {sugestao}
                </li>
              ))}
            </ul>
          </div>
        )}

        {orcamento.score_calculado_em && (
          <p className="text-[10px] text-muted-foreground text-right">
            Análise: {format(new Date(orcamento.score_calculado_em), "dd/MM HH:mm", { locale: ptBR })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
