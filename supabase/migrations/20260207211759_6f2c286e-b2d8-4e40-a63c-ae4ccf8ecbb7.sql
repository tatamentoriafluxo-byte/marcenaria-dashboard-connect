-- Criar tabela de histórico de análises
CREATE TABLE public.analises_ambiente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Fotos
  foto_ambiente_url TEXT NOT NULL,
  foto_referencia_url TEXT,
  
  -- Resultado da análise
  analise_json JSONB NOT NULL,
  imagem_simulada_url TEXT,
  
  -- Metadata
  preferencias_cliente TEXT,
  tipo_ambiente TEXT,
  data_analise TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_analises_user_id ON public.analises_ambiente(user_id);
CREATE INDEX idx_analises_data ON public.analises_ambiente(data_analise DESC);
CREATE INDEX idx_analises_tipo ON public.analises_ambiente(tipo_ambiente);

-- Enable RLS
ALTER TABLE public.analises_ambiente ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Usuários podem ver suas próprias análises"
  ON public.analises_ambiente
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias análises"
  ON public.analises_ambiente
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias análises"
  ON public.analises_ambiente
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias análises"
  ON public.analises_ambiente
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_analises_ambiente_updated_at
  BEFORE UPDATE ON public.analises_ambiente
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();