import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface HistoricoVendas {
  origemConversao: Record<string, { total: number; convertidos: number }>;
  ticketMedio: number;
  ambienteConversao: Record<string, { total: number; convertidos: number }>;
  tempoMedioFechamento: number;
}

interface OrcamentoAnalise {
  id: string;
  nome_cliente: string;
  valor_total: number;
  origem_lead?: string;
  ambiente?: string;
  data_orcamento: string;
  status: string;
  visualizado_cliente?: boolean;
  preencheu_formulario?: boolean;
  vendedor_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { orcamento_id, user_id } = await req.json();

    if (!user_id) {
      throw new Error("user_id é obrigatório");
    }

    // Buscar histórico de projetos para análise
    const { data: projetos } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user_id);

    // Calcular estatísticas históricas
    const historico: HistoricoVendas = {
      origemConversao: {},
      ticketMedio: 0,
      ambienteConversao: {},
      tempoMedioFechamento: 0,
    };

    if (projetos && projetos.length > 0) {
      let totalValor = 0;
      let countVendas = 0;
      let tempoTotal = 0;
      let countTempo = 0;

      projetos.forEach((p) => {
        const origem = p.origem_lead || "OUTROS";
        const ambiente = p.ambiente || "OUTROS";

        // Origem conversão
        if (!historico.origemConversao[origem]) {
          historico.origemConversao[origem] = { total: 0, convertidos: 0 };
        }
        historico.origemConversao[origem].total++;
        if (p.status === "VENDIDO" || p.status === "ENTREGUE") {
          historico.origemConversao[origem].convertidos++;
          totalValor += p.valor_venda || 0;
          countVendas++;

          if (p.data_venda && p.data_contato) {
            const dias = Math.floor(
              (new Date(p.data_venda).getTime() - new Date(p.data_contato).getTime()) / 
              (1000 * 60 * 60 * 24)
            );
            tempoTotal += dias;
            countTempo++;
          }
        }

        // Ambiente conversão
        if (!historico.ambienteConversao[ambiente]) {
          historico.ambienteConversao[ambiente] = { total: 0, convertidos: 0 };
        }
        historico.ambienteConversao[ambiente].total++;
        if (p.status === "VENDIDO" || p.status === "ENTREGUE") {
          historico.ambienteConversao[ambiente].convertidos++;
        }
      });

      historico.ticketMedio = countVendas > 0 ? totalValor / countVendas : 0;
      historico.tempoMedioFechamento = countTempo > 0 ? tempoTotal / countTempo : 30;
    }

    // Buscar orçamentos para análise
    let orcamentosQuery = supabase
      .from("orcamentos")
      .select("*")
      .eq("user_id", user_id)
      .in("status", ["RASCUNHO", "ENVIADO"]);

    if (orcamento_id) {
      orcamentosQuery = orcamentosQuery.eq("id", orcamento_id);
    }

    const { data: orcamentos } = await orcamentosQuery;

    if (!orcamentos || orcamentos.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum orçamento encontrado para análise" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resultados = [];

    for (const orc of orcamentos) {
      // Calcular score baseado em fatores
      let score = 50; // Base
      const fatores: string[] = [];

      // 1. Origem do lead (peso: 15 pontos)
      const origem = orc.origem_lead || "OUTROS";
      if (historico.origemConversao[origem]) {
        const taxaOrigem = historico.origemConversao[origem].convertidos / 
                          historico.origemConversao[origem].total;
        score += Math.round(taxaOrigem * 15);
        if (taxaOrigem > 0.5) {
          fatores.push(`Origem "${origem}" tem boa taxa de conversão (${Math.round(taxaOrigem * 100)}%)`);
        }
      }

      // 2. Valor vs Ticket Médio (peso: 10 pontos)
      if (historico.ticketMedio > 0) {
        const razao = orc.valor_total / historico.ticketMedio;
        if (razao >= 0.8 && razao <= 1.5) {
          score += 10;
          fatores.push("Valor dentro da faixa ideal de conversão");
        } else if (razao > 1.5) {
          score -= 5;
          fatores.push("Valor acima do ticket médio - pode exigir mais negociação");
        }
      }

      // 3. Tempo desde o orçamento (peso: 15 pontos)
      const diasDesdeOrcamento = Math.floor(
        (new Date().getTime() - new Date(orc.data_orcamento).getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      if (diasDesdeOrcamento <= 3) {
        score += 15;
        fatores.push("Orçamento recente - momento ideal para follow-up");
      } else if (diasDesdeOrcamento <= 7) {
        score += 10;
      } else if (diasDesdeOrcamento <= 14) {
        score += 5;
        fatores.push("Orçamento com mais de 1 semana - priorizar contato");
      } else {
        score -= 5;
        fatores.push("Orçamento antigo - reativar com oferta especial");
      }

      // 4. Status do orçamento (peso: 10 pontos)
      if (orc.status === "ENVIADO") {
        score += 10;
        fatores.push("Orçamento já enviado ao cliente");
      }

      // Limitar score entre 0 e 100
      score = Math.max(0, Math.min(100, score));

      // Gerar sugestões baseadas no score e fatores
      const sugestoes: string[] = [];

      if (diasDesdeOrcamento > 3 && diasDesdeOrcamento <= 7) {
        sugestoes.push("📞 Ligar para o cliente - orçamento enviado há " + diasDesdeOrcamento + " dias");
      }
      if (diasDesdeOrcamento > 7) {
        sugestoes.push("🔥 Urgente: Reativar contato com oferta ou condição especial");
      }
      if (orc.valor_total > historico.ticketMedio * 1.5) {
        sugestoes.push("💰 Considerar parcelamento ou desconto para facilitar fechamento");
      }
      if (score >= 70) {
        sugestoes.push("✅ Alta probabilidade - priorizar atendimento");
      }
      if (score < 40) {
        sugestoes.push("⚠️ Baixa probabilidade - verificar objeções do cliente");
      }

      // Atualizar orçamento com score e sugestões
      await supabase
        .from("orcamentos")
        .update({
          score_fechamento: score,
          sugestoes_ia: sugestoes,
          score_calculado_em: new Date().toISOString(),
        })
        .eq("id", orc.id);

      resultados.push({
        id: orc.id,
        nome_cliente: orc.nome_cliente,
        score,
        sugestoes,
        fatores,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        resultados,
        historico_usado: {
          ticket_medio: historico.ticketMedio,
          tempo_medio_fechamento: historico.tempoMedioFechamento,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao calcular score:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
