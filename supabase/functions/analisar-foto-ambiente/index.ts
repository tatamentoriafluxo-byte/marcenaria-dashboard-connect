import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { image_url, user_id, preferencias } = await req.json();

    if (!image_url || !user_id) {
      throw new Error("image_url e user_id são obrigatórios");
    }

    // Buscar catálogo do usuário para sugerir itens
    const { data: catalogoItens } = await supabase
      .from("catalogo_itens")
      .select("id, nome, categoria, preco_base, descricao")
      .eq("user_id", user_id)
      .eq("ativo", true)
      .limit(50);

    const catalogoTexto = catalogoItens && catalogoItens.length > 0
      ? catalogoItens.map(item => `- ${item.nome} (${item.categoria}): R$ ${item.preco_base}`).join("\n")
      : "Nenhum item no catálogo";

    const systemPrompt = `Você é um especialista em marcenaria e design de interiores. 
Analise a foto do ambiente enviada e forneça uma análise detalhada para ajudar o marceneiro a criar um orçamento.

CATÁLOGO DE MÓVEIS DISPONÍVEIS:
${catalogoTexto}

RESPONDA SEMPRE EM FORMATO JSON com a seguinte estrutura:
{
  "analise_ambiente": {
    "tipo_ambiente": "cozinha/quarto/sala/escritório/banheiro/área de serviço/outro",
    "dimensoes_estimadas": {
      "largura_metros": número estimado,
      "profundidade_metros": número estimado,
      "pe_direito_metros": número estimado
    },
    "caracteristicas": ["lista de características observadas"],
    "pontos_atencao": ["instalações elétricas", "janelas", "portas", etc]
  },
  "sugestoes_moveis": [
    {
      "nome": "nome do móvel sugerido",
      "tipo": "armário/bancada/painel/prateleira/etc",
      "dimensoes_sugeridas": {
        "largura": número em metros,
        "altura": número em metros,
        "profundidade": número em metros
      },
      "material_sugerido": "MDF/MDP/compensado/etc",
      "acabamento_sugerido": "lacado/laminado/etc",
      "item_catalogo_correspondente": "nome do item do catálogo se houver correspondência ou null",
      "preco_estimado": número estimado em reais
    }
  ],
  "layout_sugerido": "descrição textual do layout ideal",
  "valor_total_estimado": número em reais,
  "observacoes": "observações importantes para o marceneiro",
  "nivel_complexidade": "baixo/médio/alto"
}`;

    const userPrompt = preferencias 
      ? `Analise este ambiente considerando as seguintes preferências do cliente: ${preferencias}`
      : "Analise este ambiente e sugira móveis planejados adequados.";

    // Chamar Lovable AI com modelo de visão
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: image_url } }
            ]
          }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Erro na API de IA:", response.status, errorText);
      throw new Error(`Erro na análise: ${response.status}`);
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Resposta vazia da IA");
    }

    // Tentar parsear JSON da resposta
    let analise;
    try {
      // Remover possíveis markdown code blocks
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                       aiContent.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
      analise = JSON.parse(jsonString.trim());
    } catch {
      // Se não conseguir parsear, retornar texto bruto
      analise = {
        analise_texto: aiContent,
        erro_parse: true
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        analise,
        catalogo_usado: catalogoItens?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao analisar foto:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
