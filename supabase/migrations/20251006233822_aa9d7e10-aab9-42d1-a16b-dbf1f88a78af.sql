-- Criar ENUMs para o sistema de parceiros
CREATE TYPE categoria_parceiro AS ENUM (
  'ARQUITETO',
  'DESIGNER_INTERIORES',
  'CONSTRUTORA',
  'CORRETOR_IMOVEIS',
  'LOJA_MATERIAIS',
  'DECORADOR',
  'ENGENHEIRO',
  'OUTRO'
);

CREATE TYPE tipo_remuneracao AS ENUM (
  'PERCENTUAL',
  'VALOR_FIXO'
);

CREATE TYPE status_pagamento_comissao AS ENUM (
  'PENDENTE',
  'PAGO',
  'CANCELADO'
);

-- Criar tabela de parceiros
CREATE TABLE public.parceiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  categoria categoria_parceiro NOT NULL,
  cpf_cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  percentual_comissao NUMERIC DEFAULT 5.00,
  tipo_remuneracao tipo_remuneracao DEFAULT 'PERCENTUAL',
  total_indicacoes INTEGER DEFAULT 0,
  total_vendas_geradas NUMERIC DEFAULT 0,
  total_comissoes_pagas NUMERIC DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

-- RLS Policies para parceiros
CREATE POLICY "Usuários podem ver seus próprios parceiros"
  ON public.parceiros FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios parceiros"
  ON public.parceiros FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios parceiros"
  ON public.parceiros FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios parceiros"
  ON public.parceiros FOR DELETE
  USING (auth.uid() = user_id);

-- Adicionar campos na tabela projects
ALTER TABLE public.projects
ADD COLUMN parceiro_id UUID,
ADD COLUMN comissao_parceiro NUMERIC DEFAULT 0,
ADD COLUMN status_pagamento_parceiro status_pagamento_comissao DEFAULT 'PENDENTE';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_parceiros_updated_at
  BEFORE UPDATE ON public.parceiros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();