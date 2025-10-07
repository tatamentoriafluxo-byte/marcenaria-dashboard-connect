-- Corrigir funções sem search_path definido

-- 1. Corrigir calcular_subtotal_item_orcamento
CREATE OR REPLACE FUNCTION public.calcular_subtotal_item_orcamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.subtotal := NEW.quantidade * NEW.preco_unitario;
  RETURN NEW;
END;
$$;

-- 2. Corrigir gerar_numero_orcamento
CREATE OR REPLACE FUNCTION public.gerar_numero_orcamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ano TEXT;
  v_numero INTEGER;
  v_numero_formatado TEXT;
BEGIN
  IF NEW.numero_orcamento IS NULL THEN
    v_ano := TO_CHAR(NEW.data_orcamento, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_orcamento FROM 'ORC-' || v_ano || '-(.*)') AS INTEGER)), 0) + 1
    INTO v_numero
    FROM public.orcamentos
    WHERE user_id = NEW.user_id
    AND numero_orcamento LIKE 'ORC-' || v_ano || '-%';
    
    v_numero_formatado := LPAD(v_numero::TEXT, 4, '0');
    NEW.numero_orcamento := 'ORC-' || v_ano || '-' || v_numero_formatado;
  END IF;
  
  -- Calcular data de validade
  NEW.data_validade := NEW.data_orcamento + (NEW.validade_dias || ' days')::INTERVAL;
  
  RETURN NEW;
END;
$$;