-- Adicionar campos para orçamento por metro quadrado e vinculação
ALTER TABLE public.orcamentos
ADD COLUMN IF NOT EXISTS projetista TEXT,
ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
ADD COLUMN IF NOT EXISTS entrada_percentual NUMERIC DEFAULT 50,
ADD COLUMN IF NOT EXISTS num_parcelas INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS prazo_entrega_dias INTEGER;

-- Adicionar campos dimensionais aos itens do orçamento
ALTER TABLE public.orcamentos_itens
ADD COLUMN IF NOT EXISTS quantidade_pecas NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS largura_metros NUMERIC,
ADD COLUMN IF NOT EXISTS altura_metros NUMERIC,
ADD COLUMN IF NOT EXISTS area_m2 NUMERIC GENERATED ALWAYS AS (quantidade_pecas * COALESCE(largura_metros, 0) * COALESCE(altura_metros, 0)) STORED,
ADD COLUMN IF NOT EXISTS tipo_calculo TEXT DEFAULT 'UNITARIO' CHECK (tipo_calculo IN ('UNITARIO', 'METRO_QUADRADO'));

-- Atualizar campo vendedor_id na tabela orcamentos
ALTER TABLE public.orcamentos
ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES public.vendedores(id) ON DELETE SET NULL;

-- Atualizar função de cálculo de subtotal para considerar tipo de cálculo
CREATE OR REPLACE FUNCTION public.calcular_subtotal_item_orcamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se for cálculo por metro quadrado, usar área
  IF NEW.tipo_calculo = 'METRO_QUADRADO' AND NEW.largura_metros IS NOT NULL AND NEW.altura_metros IS NOT NULL THEN
    NEW.subtotal := (NEW.quantidade_pecas * NEW.largura_metros * NEW.altura_metros) * NEW.preco_unitario;
  ELSE
    -- Cálculo unitário padrão
    NEW.subtotal := NEW.quantidade * NEW.preco_unitario;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Comentários para documentação
COMMENT ON COLUMN public.orcamentos_itens.tipo_calculo IS 'UNITARIO: quantidade x preço | METRO_QUADRADO: (qtd_peças x largura x altura) x preço/m²';
COMMENT ON COLUMN public.orcamentos_itens.area_m2 IS 'Área calculada automaticamente: quantidade_pecas * largura * altura';
COMMENT ON COLUMN public.orcamentos.projetista IS 'Nome do projetista responsável';
COMMENT ON COLUMN public.orcamentos.forma_pagamento IS 'Descrição da forma de pagamento';