import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, XCircle, Brain } from "lucide-react";
import { useScoreFechamento } from "@/hooks/useScoreFechamento";
import { CardOrcamentoScore } from "./CardOrcamentoScore";
import { toast } from "sonner";

type PainelScoreFechamentoProps = {
  showTitle?: boolean;
};

export function PainelScoreFechamento({ showTitle = true }: PainelScoreFechamentoProps) {
  const { 
    orcamentos, 
    loading, 
    calculando, 
    calcularScores, 
    getNivelScore,
    getOrcamentosPorNivel,
  } = useScoreFechamento();

  const handleCalcularScores = async () => {
    try {
      await calcularScores();
      toast.success("Scores calculados com sucesso!");
    } catch {
      toast.error("Erro ao calcular scores");
    }
  };

  const { alto, medio, baixo } = getOrcamentosPorNivel();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Score de Fechamento IA
            </h2>
            <p className="text-muted-foreground">
              Análise inteligente de probabilidade de conversão
            </p>
          </div>
          <Button 
            onClick={handleCalcularScores} 
            disabled={calculando}
            className="gap-2"
          >
            {calculando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {calculando ? "Calculando..." : "Recalcular Scores"}
          </Button>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orcamentos.length}</div>
            <p className="text-xs text-muted-foreground">orçamentos ativos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alta Probabilidade</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alto.length}</div>
            <p className="text-xs text-muted-foreground">70-100% de chance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média Probabilidade</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{medio.length}</div>
            <p className="text-xs text-muted-foreground">40-69% de chance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Baixa Probabilidade</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{baixo.length}</div>
            <p className="text-xs text-muted-foreground">0-39% de chance</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas por nível */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="todos" className="gap-2">
            Todos ({orcamentos.length})
          </TabsTrigger>
          <TabsTrigger value="alto" className="gap-2 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Alto ({alto.length})
          </TabsTrigger>
          <TabsTrigger value="medio" className="gap-2 text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            Médio ({medio.length})
          </TabsTrigger>
          <TabsTrigger value="baixo" className="gap-2 text-red-600">
            <XCircle className="h-3 w-3" />
            Baixo ({baixo.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          {orcamentos.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum orçamento em aberto para análise
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orcamentos.map((orc) => (
                <CardOrcamentoScore 
                  key={orc.id} 
                  orcamento={orc} 
                  nivel={getNivelScore(orc.score_fechamento)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alto">
          {alto.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum orçamento com alta probabilidade
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alto.map((orc) => (
                <CardOrcamentoScore key={orc.id} orcamento={orc} nivel="ALTO" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="medio">
          {medio.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum orçamento com probabilidade média
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {medio.map((orc) => (
                <CardOrcamentoScore key={orc.id} orcamento={orc} nivel="MEDIO" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="baixo">
          {baixo.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum orçamento com baixa probabilidade
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {baixo.map((orc) => (
                <CardOrcamentoScore key={orc.id} orcamento={orc} nivel="BAIXO" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!showTitle && (
        <div className="flex justify-end">
          <Button 
            onClick={handleCalcularScores} 
            disabled={calculando}
            variant="outline"
            className="gap-2"
          >
            {calculando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {calculando ? "Analisando..." : "Analisar com IA"}
          </Button>
        </div>
      )}
    </div>
  );
}
