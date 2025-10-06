-- ============================================
-- CORREÇÃO: Recriar VIEWs sem SECURITY DEFINER
-- ============================================

DROP VIEW IF EXISTS public.resumo_projetos;
DROP VIEW IF EXISTS public.dashboard_vendas;

-- Recriar VIEW resumo_projetos sem security definer
CREATE VIEW public.resumo_projetos AS
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

-- Recriar VIEW dashboard_vendas sem security definer
CREATE VIEW public.dashboard_vendas AS
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