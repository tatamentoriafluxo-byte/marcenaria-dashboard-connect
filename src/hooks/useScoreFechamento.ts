import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type OrcamentoComScore = {
  id: string;
  nome_cliente: string;
  telefone_cliente: string | null;
  email_cliente: string | null;
  valor_total: number;
  status: string;
  data_orcamento: string;
  score_fechamento: number | null;
  sugestoes_ia: string[] | null;
  score_calculado_em: string | null;
  vendedor_id: string | null;
  numero_orcamento: string | null;
};

export type NivelScore = "ALTO" | "MEDIO" | "BAIXO";

export function useScoreFechamento() {
  const { user } = useAuth();
  const [orcamentos, setOrcamentos] = useState<OrcamentoComScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrcamentos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("orcamentos")
        .select("id, nome_cliente, telefone_cliente, email_cliente, valor_total, status, data_orcamento, score_fechamento, sugestoes_ia, score_calculado_em, vendedor_id, numero_orcamento")
        .eq("user_id", user.id)
        .in("status", ["RASCUNHO", "ENVIADO"])
        .order("score_fechamento", { ascending: false, nullsFirst: false });

      if (fetchError) throw fetchError;
      setOrcamentos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  };

  const calcularScores = async (orcamentoId?: string) => {
    if (!user) return;

    try {
      setCalculando(true);
      setError(null);

      const response = await supabase.functions.invoke("calcular-score-fechamento", {
        body: { user_id: user.id, orcamento_id: orcamentoId },
      });

      if (response.error) throw response.error;

      // Recarregar orçamentos após cálculo
      await fetchOrcamentos();
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao calcular scores");
      throw err;
    } finally {
      setCalculando(false);
    }
  };

  const getNivelScore = (score: number | null): NivelScore => {
    if (score === null) return "BAIXO";
    if (score >= 70) return "ALTO";
    if (score >= 40) return "MEDIO";
    return "BAIXO";
  };

  const getCorScore = (nivel: NivelScore): string => {
    switch (nivel) {
      case "ALTO":
        return "bg-green-500";
      case "MEDIO":
        return "bg-yellow-500";
      case "BAIXO":
        return "bg-red-500";
    }
  };

  const getOrcamentosPorNivel = () => {
    return {
      alto: orcamentos.filter((o) => getNivelScore(o.score_fechamento) === "ALTO"),
      medio: orcamentos.filter((o) => getNivelScore(o.score_fechamento) === "MEDIO"),
      baixo: orcamentos.filter((o) => getNivelScore(o.score_fechamento) === "BAIXO"),
    };
  };

  useEffect(() => {
    fetchOrcamentos();
  }, [user]);

  return {
    orcamentos,
    loading,
    calculando,
    error,
    calcularScores,
    getNivelScore,
    getCorScore,
    getOrcamentosPorNivel,
    refetch: fetchOrcamentos,
  };
}
