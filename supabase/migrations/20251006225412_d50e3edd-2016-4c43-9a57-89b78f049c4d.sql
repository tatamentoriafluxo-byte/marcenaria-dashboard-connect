-- Adicionar campos faltantes em PRODUÇÃO
ALTER TABLE public.producao
ADD COLUMN IF NOT EXISTS nome_movel TEXT,
ADD COLUMN IF NOT EXISTS ambiente TEXT,
ADD COLUMN IF NOT EXISTS consumo_madeira NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS consumo_ferragem NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_mao_obra NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_liberacao DATE;

-- Adicionar campos faltantes em ESTOQUE
ALTER TABLE public.estoque
ADD COLUMN IF NOT EXISTS data_ultima_compra DATE,
ADD COLUMN IF NOT EXISTS quantidade_ultima_compra NUMERIC,
ADD COLUMN IF NOT EXISTS fornecedor_principal_id UUID REFERENCES public.fornecedores(id),
ADD COLUMN IF NOT EXISTS preco_medio_compra NUMERIC;

-- Adicionar campos faltantes em COMPRAS
ALTER TABLE public.compras
ADD COLUMN IF NOT EXISTS ordem_compra TEXT;

-- Adicionar campos faltantes em MONTAGEM
ALTER TABLE public.montagem
ADD COLUMN IF NOT EXISTS nome_movel TEXT,
ADD COLUMN IF NOT EXISTS ambiente TEXT,
ADD COLUMN IF NOT EXISTS feedback_cliente TEXT;

-- Adicionar campos faltantes em TRANSAÇÕES FINANCEIRAS (Fluxo de Caixa)
ALTER TABLE public.transacoes_financeiras
ADD COLUMN IF NOT EXISTS subcategoria TEXT,
ADD COLUMN IF NOT EXISTS documento_associado TEXT;

-- Criar tabela CAPACIDADE DE PRODUÇÃO
CREATE TABLE IF NOT EXISTS public.capacidade_producao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mes_referencia DATE NOT NULL,
  capacidade_mensal_projetos INTEGER DEFAULT 0,
  capacidade_mensal_horas NUMERIC DEFAULT 0,
  projetos_realizados INTEGER DEFAULT 0,
  horas_utilizadas NUMERIC DEFAULT 0,
  taxa_ocupacao NUMERIC DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS na tabela capacidade_producao
ALTER TABLE public.capacidade_producao ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para capacidade_producao
CREATE POLICY "Usuários podem gerenciar sua própria capacidade de produção"
ON public.capacidade_producao
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at em capacidade_producao
CREATE TRIGGER update_capacidade_producao_updated_at
BEFORE UPDATE ON public.capacidade_producao
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();