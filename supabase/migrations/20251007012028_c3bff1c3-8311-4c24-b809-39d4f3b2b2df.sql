-- Corrigir search_path para a função de recalcular total
DROP FUNCTION IF EXISTS public.recalcular_total_orcamento() CASCADE;

CREATE OR REPLACE FUNCTION public.recalcular_total_orcamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_orcamento_id UUID;
  v_subtotal NUMERIC;
  v_desconto_valor NUMERIC;
  v_desconto_percentual NUMERIC;
  v_total NUMERIC;
BEGIN
  v_orcamento_id := COALESCE(NEW.orcamento_id, OLD.orcamento_id);
  
  -- Calcular subtotal
  SELECT COALESCE(SUM(subtotal), 0) INTO v_subtotal
  FROM public.orcamentos_itens
  WHERE orcamento_id = v_orcamento_id;
  
  -- Buscar descontos
  SELECT desconto_valor, desconto_percentual INTO v_desconto_valor, v_desconto_percentual
  FROM public.orcamentos
  WHERE id = v_orcamento_id;
  
  -- Calcular total
  v_total := v_subtotal - v_desconto_valor - (v_subtotal * v_desconto_percentual / 100);
  v_total := GREATEST(v_total, 0);
  
  -- Atualizar orçamento
  UPDATE public.orcamentos
  SET 
    valor_subtotal = v_subtotal,
    valor_total = v_total,
    updated_at = now()
  WHERE id = v_orcamento_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;