-- =====================================================
-- FASE 1: SISTEMA DE CONTAS A PAGAR E CONTAS A RECEBER
-- =====================================================

-- 1.1 CRIAR ENUMS
CREATE TYPE public.tipo_conta AS ENUM ('PAGAR', 'RECEBER');
CREATE TYPE public.status_conta AS ENUM ('ABERTA', 'PAGA_PARCIAL', 'PAGA_TOTAL', 'VENCIDA', 'CANCELADA');
CREATE TYPE public.tipo_documento AS ENUM ('NOTA_FISCAL', 'BOLETO', 'CONTRATO', 'CHEQUE', 'RECIBO', 'OUTRO');
CREATE TYPE public.status_parcela AS ENUM ('PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA');
CREATE TYPE public.tipo_cheque AS ENUM ('RECEBIDO', 'EMITIDO');
CREATE TYPE public.status_cheque AS ENUM ('PENDENTE', 'COMPENSADO', 'DEVOLVIDO', 'REPASSADO');

-- 1.2 CRIAR TABELA CONTAS (Cabeçalho)
CREATE TABLE public.contas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo public.tipo_conta NOT NULL,
  numero_documento TEXT,
  tipo_documento public.tipo_documento NOT NULL DEFAULT 'OUTRO',
  descricao TEXT NOT NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  compra_id UUID REFERENCES public.compras(id) ON DELETE SET NULL,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  valor_pago NUMERIC NOT NULL DEFAULT 0,
  saldo_devedor NUMERIC GENERATED ALWAYS AS (valor_total - valor_pago) STORED,
  status public.status_conta NOT NULL DEFAULT 'ABERTA',
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 1.3 CRIAR TABELA PARCELAS
CREATE TABLE public.parcelas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conta_id UUID NOT NULL REFERENCES public.contas(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor_parcela NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor_pago NUMERIC NOT NULL DEFAULT 0,
  juros_multa NUMERIC NOT NULL DEFAULT 0,
  desconto NUMERIC NOT NULL DEFAULT 0,
  status public.status_parcela NOT NULL DEFAULT 'PENDENTE',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 1.4 CRIAR TABELA PAGAMENTOS
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conta_id UUID NOT NULL REFERENCES public.contas(id) ON DELETE CASCADE,
  parcela_id UUID REFERENCES public.parcelas(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  valor NUMERIC NOT NULL,
  forma_pagamento public.forma_pagamento NOT NULL,
  cheque_numero TEXT,
  cheque_banco TEXT,
  cheque_data_compensacao DATE,
  cheque_titular TEXT,
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 1.5 CRIAR TABELA CHEQUES
CREATE TABLE public.cheques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pagamento_id UUID REFERENCES public.pagamentos(id) ON DELETE SET NULL,
  tipo public.tipo_cheque NOT NULL,
  numero_cheque TEXT NOT NULL,
  banco TEXT NOT NULL,
  agencia TEXT,
  conta TEXT,
  titular TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_compensacao DATE NOT NULL,
  status public.status_cheque NOT NULL DEFAULT 'PENDENTE',
  repassado_para TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 1.6 HABILITAR RLS
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheques ENABLE ROW LEVEL SECURITY;

-- 1.7 CRIAR POLÍTICAS RLS PARA CONTAS
CREATE POLICY "Usuários podem gerenciar suas próprias contas"
  ON public.contas
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.8 CRIAR POLÍTICAS RLS PARA PARCELAS
CREATE POLICY "Usuários podem gerenciar parcelas de suas contas"
  ON public.parcelas
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.contas
      WHERE contas.id = parcelas.conta_id
      AND contas.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contas
      WHERE contas.id = parcelas.conta_id
      AND contas.user_id = auth.uid()
    )
  );

-- 1.9 CRIAR POLÍTICAS RLS PARA PAGAMENTOS
CREATE POLICY "Usuários podem gerenciar seus próprios pagamentos"
  ON public.pagamentos
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.10 CRIAR POLÍTICAS RLS PARA CHEQUES
CREATE POLICY "Usuários podem gerenciar seus próprios cheques"
  ON public.cheques
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 1.11 TRIGGER PARA ATUALIZAR updated_at
CREATE TRIGGER update_contas_updated_at
  BEFORE UPDATE ON public.contas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parcelas_updated_at
  BEFORE UPDATE ON public.parcelas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cheques_updated_at
  BEFORE UPDATE ON public.cheques
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 1.12 FUNÇÃO PARA ATUALIZAR SALDO DA CONTA
CREATE OR REPLACE FUNCTION public.atualizar_saldo_conta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalcular valor_pago da conta somando todos os pagamentos
  UPDATE public.contas
  SET valor_pago = (
    SELECT COALESCE(SUM(valor), 0)
    FROM public.pagamentos
    WHERE conta_id = NEW.conta_id
  )
  WHERE id = NEW.conta_id;
  
  RETURN NEW;
END;
$$;

-- 1.13 TRIGGER PARA ATUALIZAR SALDO APÓS PAGAMENTO
CREATE TRIGGER trigger_atualizar_saldo_conta
  AFTER INSERT OR UPDATE OR DELETE ON public.pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_saldo_conta();

-- 1.14 FUNÇÃO PARA ATUALIZAR STATUS DA PARCELA
CREATE OR REPLACE FUNCTION public.atualizar_status_parcela()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalcular valor_pago da parcela somando pagamentos vinculados
  NEW.valor_pago := (
    SELECT COALESCE(SUM(valor), 0)
    FROM public.pagamentos
    WHERE parcela_id = NEW.id
  );
  
  -- Atualizar status baseado no valor pago
  IF NEW.valor_pago >= NEW.valor_parcela THEN
    NEW.status := 'PAGA';
    NEW.data_pagamento := CURRENT_DATE;
  ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.valor_pago < NEW.valor_parcela THEN
    NEW.status := 'ATRASADA';
  ELSE
    NEW.status := 'PENDENTE';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 1.15 TRIGGER PARA ATUALIZAR STATUS PARCELA
CREATE TRIGGER trigger_atualizar_status_parcela
  BEFORE UPDATE ON public.parcelas
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_status_parcela();

-- 1.16 FUNÇÃO PARA ATUALIZAR STATUS DA CONTA
CREATE OR REPLACE FUNCTION public.atualizar_status_conta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_parcelas INTEGER;
  parcelas_pagas INTEGER;
  conta_vencida BOOLEAN;
BEGIN
  -- Contar parcelas
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'PAGA')
  INTO total_parcelas, parcelas_pagas
  FROM public.parcelas
  WHERE conta_id = NEW.id;
  
  -- Verificar se tem parcelas vencidas
  SELECT EXISTS (
    SELECT 1 FROM public.parcelas
    WHERE conta_id = NEW.id
    AND data_vencimento < CURRENT_DATE
    AND status != 'PAGA'
  ) INTO conta_vencida;
  
  -- Atualizar status
  IF NEW.valor_pago >= NEW.valor_total THEN
    NEW.status := 'PAGA_TOTAL';
  ELSIF NEW.valor_pago > 0 THEN
    NEW.status := 'PAGA_PARCIAL';
  ELSIF conta_vencida THEN
    NEW.status := 'VENCIDA';
  ELSE
    NEW.status := 'ABERTA';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 1.17 TRIGGER PARA ATUALIZAR STATUS CONTA
CREATE TRIGGER trigger_atualizar_status_conta
  BEFORE UPDATE ON public.contas
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_status_conta();

-- 1.18 FUNÇÃO PARA CALCULAR PROJEÇÃO DE FLUXO
CREATE OR REPLACE FUNCTION public.calcular_projecao_fluxo(
  _user_id UUID,
  _data_inicio DATE,
  _data_fim DATE
)
RETURNS TABLE (
  data DATE,
  entradas_previstas NUMERIC,
  saidas_previstas NUMERIC,
  saldo_projetado NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  saldo_atual NUMERIC;
BEGIN
  -- Calcular saldo atual (já pago)
  SELECT 
    COALESCE(SUM(CASE WHEN tipo = 'RECEBER' THEN valor_pago ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN tipo = 'PAGAR' THEN valor_pago ELSE 0 END), 0)
  INTO saldo_atual
  FROM public.contas
  WHERE user_id = _user_id;
  
  -- Retornar projeção por data
  RETURN QUERY
  WITH datas AS (
    SELECT generate_series(_data_inicio, _data_fim, '1 day'::interval)::DATE AS data
  ),
  movimentacoes AS (
    SELECT 
      p.data_vencimento AS data,
      SUM(CASE WHEN c.tipo = 'RECEBER' THEN p.valor_parcela - p.valor_pago ELSE 0 END) AS entradas,
      SUM(CASE WHEN c.tipo = 'PAGAR' THEN p.valor_parcela - p.valor_pago ELSE 0 END) AS saidas
    FROM public.parcelas p
    JOIN public.contas c ON c.id = p.conta_id
    WHERE c.user_id = _user_id
    AND p.data_vencimento BETWEEN _data_inicio AND _data_fim
    AND p.status != 'PAGA'
    GROUP BY p.data_vencimento
  )
  SELECT 
    d.data,
    COALESCE(m.entradas, 0) AS entradas_previstas,
    COALESCE(m.saidas, 0) AS saidas_previstas,
    saldo_atual + SUM(COALESCE(m.entradas, 0) - COALESCE(m.saidas, 0)) 
      OVER (ORDER BY d.data) AS saldo_projetado
  FROM datas d
  LEFT JOIN movimentacoes m ON m.data = d.data
  ORDER BY d.data;
END;
$$;