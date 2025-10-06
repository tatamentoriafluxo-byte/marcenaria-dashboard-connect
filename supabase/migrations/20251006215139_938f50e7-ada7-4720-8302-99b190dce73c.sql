-- ============================================
-- CORREÇÃO: Adicionar RLS nas VIEWs
-- ============================================

-- Habilitar RLS nas views
ALTER VIEW public.resumo_projetos SET (security_invoker = on);
ALTER VIEW public.dashboard_vendas SET (security_invoker = on);