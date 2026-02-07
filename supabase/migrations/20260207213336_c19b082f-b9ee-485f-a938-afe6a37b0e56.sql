-- Tabela para templates de preferências
CREATE TABLE public.templates_preferencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  preferencias_texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.templates_preferencias ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Usuários podem ver seus próprios templates"
  ON public.templates_preferencias FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios templates"
  ON public.templates_preferencias FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios templates"
  ON public.templates_preferencias FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios templates"
  ON public.templates_preferencias FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_templates_preferencias_updated_at
  BEFORE UPDATE ON public.templates_preferencias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar coluna link_publico na tabela analises_ambiente
ALTER TABLE public.analises_ambiente 
ADD COLUMN link_publico UUID UNIQUE DEFAULT NULL;

-- Policy especial para leitura anônima via link_publico
CREATE POLICY "Acesso público via link compartilhável"
  ON public.analises_ambiente FOR SELECT
  USING (link_publico IS NOT NULL AND link_publico = link_publico);