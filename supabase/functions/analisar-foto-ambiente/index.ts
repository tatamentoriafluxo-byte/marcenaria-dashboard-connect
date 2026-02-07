import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode as decodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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

    const { image_url, referencia_url, user_id, preferencias } = await req.json();

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
  "nivel_complexidade": "baixo/médio/alto",
  "descricao_visual_completa": "descrição detalhada do ambiente com os móveis instalados para geração de imagem, incluindo cores, materiais, iluminação e estilo"
}`;

    let userPromptContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    
    let textPrompt = preferencias 
      ? `Analise este ambiente considerando as seguintes preferências do cliente: ${preferencias}`
      : "Analise este ambiente e sugira móveis planejados adequados.";
    
    if (referencia_url) {
      textPrompt += "\n\nConsidere também a imagem de referência de estilo fornecida para inspirar as sugestões de design, cores e acabamentos.";
    }

    userPromptContent.push({ type: "text", text: textPrompt });
    userPromptContent.push({ type: "image_url", image_url: { url: image_url } });
    
    if (referencia_url) {
      userPromptContent.push({ type: "image_url", image_url: { url: referencia_url } });
    }

    // Chamar Lovable AI com modelo de visão para análise
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
          { role: "user", content: userPromptContent }
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

    // Gerar imagem simulada do ambiente com móveis usando edição de imagem
    let imagem_simulada_url: string | null = null;
    
    if (!analise.erro_parse) {
      try {
        // Construir descrição dos móveis para o prompt
        const moveisDescricao = analise.sugestoes_moveis?.map((m: { nome: string; tipo: string; material_sugerido?: string; acabamento_sugerido?: string; dimensoes_sugeridas?: { largura: number; altura: number; profundidade: number } }) => {
          let desc = `${m.nome} (${m.tipo})`;
          if (m.material_sugerido) desc += ` em ${m.material_sugerido}`;
          if (m.acabamento_sugerido) desc += ` com acabamento ${m.acabamento_sugerido}`;
          return desc;
        }).join(', ') || 'móveis planejados sob medida';

        const tipoAmbiente = analise.analise_ambiente?.tipo_ambiente || 'ambiente';
        
        // Usar o modelo de edição/geração de imagem com a foto original como base
        const imagePrompt = `Edite esta foto de ${tipoAmbiente} adicionando móveis planejados de marcenaria de alta qualidade.

MÓVEIS A ADICIONAR:
${moveisDescricao}

INSTRUÇÕES:
- Mantenha a estrutura e perspectiva original do ambiente
- Adicione os móveis de forma realista e proporcional ao espaço
- Use acabamentos modernos e clean
- Mantenha iluminação natural consistente
- O resultado deve parecer uma foto profissional de arquitetura de interiores
- Os móveis devem estar integrados harmoniosamente ao ambiente existente

${analise.descricao_visual_completa ? `DESCRIÇÃO ADICIONAL: ${analise.descricao_visual_completa}` : ''}`;

        // Chamar API com a imagem original para edição
        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              { 
                role: "user", 
                content: [
                  { type: "text", text: imagePrompt },
                  { type: "image_url", image_url: { url: image_url } }
                ]
              }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          console.log("Resposta da geração de imagem:", JSON.stringify(imageData).substring(0, 500));
          
          const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (generatedImage && generatedImage.startsWith("data:image/")) {
            // Extrair o base64 da imagem
            const base64Match = generatedImage.match(/^data:image\/(\w+);base64,(.+)$/);
            if (base64Match) {
              const imageFormat = base64Match[1];
              const base64Data = base64Match[2];
              const imageBytes = decodeBase64(base64Data);
              
              // Upload para o storage
              const fileName = `${user_id}/simulacao_${Date.now()}.${imageFormat}`;
              const { error: uploadError } = await supabase.storage
                .from("fotos-ambientes")
                .upload(fileName, imageBytes, {
                  contentType: `image/${imageFormat}`,
                  upsert: true
                });

              if (!uploadError) {
                const { data: urlData } = supabase.storage
                  .from("fotos-ambientes")
                  .getPublicUrl(fileName);
                
                imagem_simulada_url = urlData.publicUrl;
                console.log("Imagem simulada salva:", imagem_simulada_url);
              } else {
                console.error("Erro no upload da imagem:", uploadError);
              }
            }
          } else {
            console.log("Imagem não retornada no formato esperado");
          }
        } else {
          const errorText = await imageResponse.text();
          console.error("Erro na geração de imagem:", imageResponse.status, errorText);
        }
      } catch (imageError) {
        console.error("Erro ao gerar imagem simulada:", imageError);
        // Continua sem a imagem - não falha a operação principal
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analise,
        imagem_simulada_url,
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
