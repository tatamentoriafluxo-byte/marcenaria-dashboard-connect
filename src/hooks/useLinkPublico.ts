import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLinkPublico() {
  const [gerando, setGerando] = useState(false);

  const gerarLink = async (analiseId: string): Promise<string | null> => {
    try {
      setGerando(true);

      // Gerar UUID único
      const linkPublico = crypto.randomUUID();

      // Atualizar análise com o link
      const { error } = await supabase
        .from("analises_ambiente")
        .update({ link_publico: linkPublico })
        .eq("id", analiseId);

      if (error) throw error;

      // Construir URL completa
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/analise-publica/${linkPublico}`;

      // Copiar para clipboard
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");

      return url;
    } catch (error) {
      console.error("Erro ao gerar link:", error);
      toast.error("Erro ao gerar link compartilhável");
      return null;
    } finally {
      setGerando(false);
    }
  };

  return { gerarLink, gerando };
}
