-- ============================================
-- ETAPA 3: EXPANDIR PROJECTS (CORRIGIDO)
-- ============================================

-- Verificar se cliente_id já existe, se não, adicionar
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'cliente_id'
  ) THEN
    ALTER TABLE public.projects 
      ADD COLUMN cliente_id UUID REFERENCES public.clientes(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'vendedor_id'
  ) THEN
    ALTER TABLE public.projects 
      ADD COLUMN vendedor_id UUID REFERENCES public.vendedores(id);
  END IF;
END $$;

-- Criar índices (com IF NOT EXISTS implícito - DROP e recria se necessário)
DROP INDEX IF EXISTS idx_projects_vendedor;
DROP INDEX IF EXISTS idx_projects_cliente;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_data_contato;
DROP INDEX IF EXISTS idx_projects_origem_lead;

CREATE INDEX idx_projects_vendedor ON public.projects(vendedor_id);
CREATE INDEX idx_projects_cliente ON public.projects(cliente_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_data_contato ON public.projects(data_contato);
CREATE INDEX idx_projects_origem_lead ON public.projects(origem_lead);

-- Índices das outras tabelas
CREATE INDEX IF NOT EXISTS idx_producao_project ON public.producao(project_id);
CREATE INDEX IF NOT EXISTS idx_producao_marceneiro ON public.producao(marceneiro_id);
CREATE INDEX IF NOT EXISTS idx_montagem_project ON public.montagem(project_id);
CREATE INDEX IF NOT EXISTS idx_montagem_montador ON public.montagem(montador_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_project ON public.feedbacks(project_id);

CREATE INDEX IF NOT EXISTS idx_transacoes_data ON public.transacoes_financeiras(data_transacao);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON public.transacoes_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON public.transacoes_financeiras(categoria);

CREATE INDEX IF NOT EXISTS idx_compras_fornecedor ON public.compras(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_data ON public.compras(data_compra);
CREATE INDEX IF NOT EXISTS idx_itens_compra_material ON public.itens_compra(material_id);
CREATE INDEX IF NOT EXISTS idx_estoque_material ON public.estoque(material_id);

-- Criar função para calcular lucro do projeto
CREATE OR REPLACE FUNCTION public.calcular_lucro_projeto(project_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lucro DECIMAL;
BEGIN
  SELECT 
    COALESCE(valor_venda, 0) - 
    COALESCE(custo_materiais, 0) - 
    COALESCE(custo_mao_obra, 0) - 
    COALESCE(outros_custos, 0)
  INTO lucro
  FROM public.projects
  WHERE id = project_id;
  
  RETURN COALESCE(lucro, 0);
END;
$$;

-- Criar função para atualizar estoque após compra
CREATE OR REPLACE FUNCTION public.atualizar_estoque_pos_compra()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar estoque quando status da compra mudar para ENTREGUE
  IF NEW.status = 'ENTREGUE' AND (OLD.status IS NULL OR OLD.status != 'ENTREGUE') THEN
    UPDATE public.estoque e
    SET 
      quantidade_atual = quantidade_atual + ic.quantidade,
      ultima_atualizacao = NOW()
    FROM public.itens_compra ic
    WHERE ic.compra_id = NEW.id
    AND e.material_id = ic.material_id
    AND e.user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para atualizar estoque
DROP TRIGGER IF EXISTS trigger_atualizar_estoque_pos_compra ON public.compras;
CREATE TRIGGER trigger_atualizar_estoque_pos_compra
  AFTER UPDATE ON public.compras
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_estoque_pos_compra();

-- Criar VIEW para resumo de projetos
CREATE OR REPLACE VIEW public.resumo_projetos AS
SELECT 
  p.id,
  p.user_id,
  p.cod_projeto,
  p.nome_cliente,
  c.nome as cliente_nome,
  c.telefone as cliente_telefone,
  p.vendedor_responsavel,
  v.nome as vendedor_nome,
  p.ambiente,
  p.origem_lead,
  p.status,
  p.data_contato,
  p.data_venda,
  p.valor_orcamento,
  p.valor_venda,
  p.custo_materiais,
  p.custo_mao_obra,
  p.outros_custos,
  (COALESCE(p.valor_venda, 0) - COALESCE(p.custo_materiais, 0) - COALESCE(p.custo_mao_obra, 0) - COALESCE(p.outros_custos, 0)) as lucro,
  p.visualizado_cliente,
  p.preencheu_formulario,
  p.created_at
FROM public.projects p
LEFT JOIN public.clientes c ON p.cliente_id = c.id
LEFT JOIN public.vendedores v ON p.vendedor_id = v.id;

-- Criar VIEW para dashboard de vendas
CREATE OR REPLACE VIEW public.dashboard_vendas AS
SELECT 
  p.user_id,
  DATE_TRUNC('month', p.data_venda) as mes,
  p.vendedor_responsavel,
  v.nome as vendedor_nome,
  COUNT(*) as total_vendas,
  SUM(p.valor_venda) as faturamento_total,
  SUM(COALESCE(p.valor_venda, 0) - COALESCE(p.custo_materiais, 0) - COALESCE(p.custo_mao_obra, 0) - COALESCE(p.outros_custos, 0)) as lucro_total,
  AVG(p.valor_venda) as ticket_medio
FROM public.projects p
LEFT JOIN public.vendedores v ON p.vendedor_id = v.id
WHERE p.status = 'CONVERTIDO' AND p.data_venda IS NOT NULL
GROUP BY p.user_id, DATE_TRUNC('month', p.data_venda), p.vendedor_responsavel, v.nome;

-- Comentários nas tabelas para documentação
COMMENT ON TABLE public.vendedores IS 'Cadastro de vendedores da marcenaria';
COMMENT ON TABLE public.clientes IS 'Cadastro de clientes';
COMMENT ON TABLE public.funcionarios IS 'Marceneiros e montadores';
COMMENT ON TABLE public.fornecedores IS 'Fornecedores de materiais';
COMMENT ON TABLE public.materiais IS 'Catálogo de materiais';
COMMENT ON TABLE public.estoque IS 'Controle de estoque de materiais';
COMMENT ON TABLE public.compras IS 'Compras de materiais de fornecedores';
COMMENT ON TABLE public.producao IS 'Controle de produção dos projetos';
COMMENT ON TABLE public.montagem IS 'Controle de montagem dos projetos';
COMMENT ON TABLE public.feedbacks IS 'Avaliações de clientes';
COMMENT ON TABLE public.transacoes_financeiras IS 'Fluxo de caixa - receitas e despesas';
COMMENT ON TABLE public.metas IS 'Metas de faturamento e lucro';