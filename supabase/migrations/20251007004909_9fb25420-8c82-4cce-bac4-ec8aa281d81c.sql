-- ============================================================================
-- PARTE 1: ÍNDICES DE PERFORMANCE
-- ============================================================================

-- Índices para PROJECTS (tabela mais consultada)
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_vendedor_id ON public.projects(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_projects_cliente_id ON public.projects(cliente_id);
CREATE INDEX IF NOT EXISTS idx_projects_data_venda ON public.projects(data_venda);
CREATE INDEX IF NOT EXISTS idx_projects_data_contato ON public.projects(data_contato);

-- Índices para COMPRAS
CREATE INDEX IF NOT EXISTS idx_compras_user_id ON public.compras(user_id);
CREATE INDEX IF NOT EXISTS idx_compras_status ON public.compras(status);
CREATE INDEX IF NOT EXISTS idx_compras_fornecedor_id ON public.compras(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_data_compra ON public.compras(data_compra);

-- Índices para ESTOQUE
CREATE INDEX IF NOT EXISTS idx_estoque_user_id ON public.estoque(user_id);
CREATE INDEX IF NOT EXISTS idx_estoque_material_id ON public.estoque(material_id);

-- Índices para CONTAS
CREATE INDEX IF NOT EXISTS idx_contas_user_id ON public.contas(user_id);
CREATE INDEX IF NOT EXISTS idx_contas_tipo ON public.contas(tipo);
CREATE INDEX IF NOT EXISTS idx_contas_status ON public.contas(status);
CREATE INDEX IF NOT EXISTS idx_contas_data_vencimento ON public.contas(data_vencimento);

-- Índices para PARCELAS
CREATE INDEX IF NOT EXISTS idx_parcelas_conta_id ON public.parcelas(conta_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON public.parcelas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_data_vencimento ON public.parcelas(data_vencimento);

-- Índices para PAGAMENTOS
CREATE INDEX IF NOT EXISTS idx_pagamentos_user_id ON public.pagamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_conta_id ON public.pagamentos(conta_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data_pagamento ON public.pagamentos(data_pagamento);

-- Índices para PRODUCAO
CREATE INDEX IF NOT EXISTS idx_producao_user_id ON public.producao(user_id);
CREATE INDEX IF NOT EXISTS idx_producao_status ON public.producao(status);
CREATE INDEX IF NOT EXISTS idx_producao_project_id ON public.producao(project_id);

-- Índices para MONTAGEM
CREATE INDEX IF NOT EXISTS idx_montagem_user_id ON public.montagem(user_id);
CREATE INDEX IF NOT EXISTS idx_montagem_status ON public.montagem(status);
CREATE INDEX IF NOT EXISTS idx_montagem_project_id ON public.montagem(project_id);

-- Índices para TRANSACOES_FINANCEIRAS
CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON public.transacoes_financeiras(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON public.transacoes_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON public.transacoes_financeiras(data_transacao);

-- ============================================================================
-- PARTE 2: VALIDAÇÕES DE DADOS (CHECK CONSTRAINTS)
-- ============================================================================

-- PROJECTS - Validações de valores
ALTER TABLE public.projects 
  ADD CONSTRAINT check_valor_venda_positivo 
  CHECK (valor_venda IS NULL OR valor_venda >= 0);

ALTER TABLE public.projects 
  ADD CONSTRAINT check_valor_orcamento_positivo 
  CHECK (valor_orcamento >= 0);

ALTER TABLE public.projects 
  ADD CONSTRAINT check_custos_positivos 
  CHECK (custo_materiais >= 0 AND custo_mao_obra >= 0 AND outros_custos >= 0);

-- COMPRAS - Validações
ALTER TABLE public.compras 
  ADD CONSTRAINT check_valor_total_positivo 
  CHECK (valor_total >= 0);

ALTER TABLE public.compras 
  ADD CONSTRAINT check_data_entrega_logica 
  CHECK (data_entrega_prevista IS NULL OR data_entrega_prevista >= data_compra);

-- ESTOQUE - Validações
ALTER TABLE public.estoque 
  ADD CONSTRAINT check_quantidades_positivas 
  CHECK (quantidade_atual >= 0 AND quantidade_minima >= 0);

ALTER TABLE public.estoque 
  ADD CONSTRAINT check_preco_medio_positivo 
  CHECK (preco_medio_compra IS NULL OR preco_medio_compra >= 0);

-- CONTAS - Validações
ALTER TABLE public.contas 
  ADD CONSTRAINT check_valores_contas_positivos 
  CHECK (valor_total >= 0 AND valor_pago >= 0);

ALTER TABLE public.contas 
  ADD CONSTRAINT check_valor_pago_nao_excede_total 
  CHECK (valor_pago <= valor_total);

-- PARCELAS - Validações
ALTER TABLE public.parcelas 
  ADD CONSTRAINT check_valores_parcelas_positivos 
  CHECK (valor_parcela > 0 AND valor_pago >= 0);

ALTER TABLE public.parcelas 
  ADD CONSTRAINT check_valor_pago_parcela_nao_excede 
  CHECK (valor_pago <= valor_parcela + juros_multa);

-- PAGAMENTOS - Validações
ALTER TABLE public.pagamentos 
  ADD CONSTRAINT check_valor_pagamento_positivo 
  CHECK (valor > 0);

-- VENDEDORES - Validações
ALTER TABLE public.vendedores 
  ADD CONSTRAINT check_comissao_valida 
  CHECK (comissao_percentual >= 0 AND comissao_percentual <= 100);

-- PARCEIROS - Validações
ALTER TABLE public.parceiros 
  ADD CONSTRAINT check_percentual_comissao_valido 
  CHECK (percentual_comissao >= 0 AND percentual_comissao <= 100);

-- PRODUCAO - Validações
ALTER TABLE public.producao 
  ADD CONSTRAINT check_consumos_positivos 
  CHECK (consumo_madeira >= 0 AND consumo_ferragem >= 0);

ALTER TABLE public.producao 
  ADD CONSTRAINT check_tempos_positivos 
  CHECK (tempo_estimado IS NULL OR tempo_estimado >= 0);

-- FERRAMENTAS - Validações
ALTER TABLE public.ferramentas 
  ADD CONSTRAINT check_valores_ferramenta_positivos 
  CHECK (valor_aquisicao >= 0 AND valor_atual >= 0);

ALTER TABLE public.ferramentas 
  ADD CONSTRAINT check_vida_util_positiva 
  CHECK (vida_util_anos > 0);

ALTER TABLE public.ferramentas 
  ADD CONSTRAINT check_taxa_depreciacao_valida 
  CHECK (taxa_depreciacao_anual >= 0 AND taxa_depreciacao_anual <= 100);

-- VEICULOS - Validações
ALTER TABLE public.veiculos 
  ADD CONSTRAINT check_valores_veiculo_positivos 
  CHECK (valor_aquisicao >= 0 AND km_atual >= 0);

-- ============================================================================
-- PARTE 3: TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE TOTAIS
-- ============================================================================

-- Trigger para atualizar saldo_devedor em contas
CREATE OR REPLACE FUNCTION public.atualizar_saldo_devedor_conta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contas
  SET saldo_devedor = valor_total - valor_pago
  WHERE id = NEW.conta_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_atualizar_saldo_devedor_apos_pagamento
AFTER INSERT OR UPDATE ON public.pagamentos
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_saldo_devedor_conta();

-- Trigger para recalcular valor_total de compras baseado em itens
CREATE OR REPLACE FUNCTION public.recalcular_valor_total_compra()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.compras
  SET valor_total = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM public.itens_compra
    WHERE compra_id = COALESCE(NEW.compra_id, OLD.compra_id)
  )
  WHERE id = COALESCE(NEW.compra_id, OLD.compra_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_recalcular_compra_apos_item
AFTER INSERT OR UPDATE OR DELETE ON public.itens_compra
FOR EACH ROW
EXECUTE FUNCTION public.recalcular_valor_total_compra();

-- Trigger para calcular automaticamente subtotal de itens_compra
CREATE OR REPLACE FUNCTION public.calcular_subtotal_item_compra()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.subtotal := NEW.quantidade * NEW.preco_unitario;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_calcular_subtotal_item
BEFORE INSERT OR UPDATE ON public.itens_compra
FOR EACH ROW
EXECUTE FUNCTION public.calcular_subtotal_item_compra();

-- Trigger para atualizar preco_medio do material no estoque
CREATE OR REPLACE FUNCTION public.atualizar_preco_medio_estoque()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_preco_medio NUMERIC;
BEGIN
  -- Calcular preço médio das últimas compras
  SELECT AVG(ic.preco_unitario)
  INTO v_preco_medio
  FROM public.itens_compra ic
  JOIN public.compras c ON c.id = ic.compra_id
  WHERE ic.material_id = NEW.material_id
    AND c.status = 'ENTREGUE'
    AND c.data_compra >= CURRENT_DATE - INTERVAL '6 months';
  
  -- Atualizar estoque
  UPDATE public.estoque
  SET preco_medio_compra = v_preco_medio
  WHERE material_id = NEW.material_id
    AND user_id = (SELECT user_id FROM public.compras WHERE id = NEW.compra_id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_atualizar_preco_medio
AFTER INSERT ON public.itens_compra
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_preco_medio_estoque();

-- Trigger para atualizar totais de fretistas
CREATE OR REPLACE FUNCTION public.atualizar_totais_fretista()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.fretistas
  SET 
    total_fretes = (
      SELECT COUNT(*) 
      FROM public.fretes 
      WHERE fretista_id = NEW.fretista_id
    ),
    total_pago = (
      SELECT COALESCE(SUM(custo_frete), 0)
      FROM public.fretes 
      WHERE fretista_id = NEW.fretista_id 
        AND status_pagamento = 'PAGO'
    ),
    avaliacao_media = (
      SELECT COALESCE(AVG(avaliacao), 0)
      FROM public.fretes 
      WHERE fretista_id = NEW.fretista_id 
        AND avaliacao IS NOT NULL
    )
  WHERE id = NEW.fretista_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_atualizar_fretista
AFTER INSERT OR UPDATE ON public.fretes
FOR EACH ROW
WHEN (NEW.fretista_id IS NOT NULL)
EXECUTE FUNCTION public.atualizar_totais_fretista();

-- Trigger para atualizar totais de parceiros
CREATE OR REPLACE FUNCTION public.atualizar_totais_parceiro()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.parceiros
  SET 
    total_indicacoes = (
      SELECT COUNT(*) 
      FROM public.projects 
      WHERE parceiro_id = NEW.parceiro_id
    ),
    total_vendas_geradas = (
      SELECT COALESCE(SUM(valor_venda), 0)
      FROM public.projects 
      WHERE parceiro_id = NEW.parceiro_id 
        AND valor_venda IS NOT NULL
    ),
    total_comissoes_pagas = (
      SELECT COALESCE(SUM(comissao_parceiro), 0)
      FROM public.projects 
      WHERE parceiro_id = NEW.parceiro_id 
        AND status_pagamento_parceiro = 'PAGO'
    )
  WHERE id = NEW.parceiro_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_atualizar_parceiro
AFTER INSERT OR UPDATE ON public.projects
FOR EACH ROW
WHEN (NEW.parceiro_id IS NOT NULL)
EXECUTE FUNCTION public.atualizar_totais_parceiro();

-- Comentários
COMMENT ON INDEX idx_projects_user_id IS 'Índice para acelerar queries filtradas por usuário';
COMMENT ON INDEX idx_contas_data_vencimento IS 'Índice para relatórios de contas a vencer';
COMMENT ON FUNCTION atualizar_saldo_devedor_conta() IS 'Recalcula saldo devedor automaticamente';
COMMENT ON FUNCTION recalcular_valor_total_compra() IS 'Mantém valor_total sincronizado com itens';