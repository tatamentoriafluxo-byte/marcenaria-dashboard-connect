-- Adicionar Foreign Keys para garantir integridade referencial

-- COMPRAS
ALTER TABLE public.compras 
  ADD CONSTRAINT fk_compras_fornecedor 
  FOREIGN KEY (fornecedor_id) 
  REFERENCES public.fornecedores(id) 
  ON DELETE RESTRICT;

-- ITENS_COMPRA
ALTER TABLE public.itens_compra 
  ADD CONSTRAINT fk_itens_compra_compra 
  FOREIGN KEY (compra_id) 
  REFERENCES public.compras(id) 
  ON DELETE CASCADE;

ALTER TABLE public.itens_compra 
  ADD CONSTRAINT fk_itens_compra_material 
  FOREIGN KEY (material_id) 
  REFERENCES public.materiais(id) 
  ON DELETE RESTRICT;

-- ESTOQUE
ALTER TABLE public.estoque 
  ADD CONSTRAINT fk_estoque_material 
  FOREIGN KEY (material_id) 
  REFERENCES public.materiais(id) 
  ON DELETE CASCADE;

ALTER TABLE public.estoque 
  ADD CONSTRAINT fk_estoque_fornecedor_principal 
  FOREIGN KEY (fornecedor_principal_id) 
  REFERENCES public.fornecedores(id) 
  ON DELETE SET NULL;

-- PROJECTS
ALTER TABLE public.projects 
  ADD CONSTRAINT fk_projects_cliente 
  FOREIGN KEY (cliente_id) 
  REFERENCES public.clientes(id) 
  ON DELETE SET NULL;

ALTER TABLE public.projects 
  ADD CONSTRAINT fk_projects_vendedor 
  FOREIGN KEY (vendedor_id) 
  REFERENCES public.vendedores(id) 
  ON DELETE SET NULL;

ALTER TABLE public.projects 
  ADD CONSTRAINT fk_projects_parceiro 
  FOREIGN KEY (parceiro_id) 
  REFERENCES public.parceiros(id) 
  ON DELETE SET NULL;

-- PRODUCAO
ALTER TABLE public.producao 
  ADD CONSTRAINT fk_producao_project 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE CASCADE;

ALTER TABLE public.producao 
  ADD CONSTRAINT fk_producao_marceneiro 
  FOREIGN KEY (marceneiro_id) 
  REFERENCES public.funcionarios(id) 
  ON DELETE SET NULL;

-- MONTAGEM
ALTER TABLE public.montagem 
  ADD CONSTRAINT fk_montagem_project 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE CASCADE;

ALTER TABLE public.montagem 
  ADD CONSTRAINT fk_montagem_montador 
  FOREIGN KEY (montador_id) 
  REFERENCES public.funcionarios(id) 
  ON DELETE SET NULL;

-- CONTAS
ALTER TABLE public.contas 
  ADD CONSTRAINT fk_contas_fornecedor 
  FOREIGN KEY (fornecedor_id) 
  REFERENCES public.fornecedores(id) 
  ON DELETE SET NULL;

ALTER TABLE public.contas 
  ADD CONSTRAINT fk_contas_cliente 
  FOREIGN KEY (cliente_id) 
  REFERENCES public.clientes(id) 
  ON DELETE SET NULL;

ALTER TABLE public.contas 
  ADD CONSTRAINT fk_contas_project 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE SET NULL;

ALTER TABLE public.contas 
  ADD CONSTRAINT fk_contas_compra 
  FOREIGN KEY (compra_id) 
  REFERENCES public.compras(id) 
  ON DELETE SET NULL;

-- PARCELAS
ALTER TABLE public.parcelas 
  ADD CONSTRAINT fk_parcelas_conta 
  FOREIGN KEY (conta_id) 
  REFERENCES public.contas(id) 
  ON DELETE CASCADE;

-- PAGAMENTOS
ALTER TABLE public.pagamentos 
  ADD CONSTRAINT fk_pagamentos_conta 
  FOREIGN KEY (conta_id) 
  REFERENCES public.contas(id) 
  ON DELETE CASCADE;

ALTER TABLE public.pagamentos 
  ADD CONSTRAINT fk_pagamentos_parcela 
  FOREIGN KEY (parcela_id) 
  REFERENCES public.parcelas(id) 
  ON DELETE SET NULL;

-- FEEDBACKS
ALTER TABLE public.feedbacks 
  ADD CONSTRAINT fk_feedbacks_project 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE CASCADE;

-- METAS
ALTER TABLE public.metas 
  ADD CONSTRAINT fk_metas_vendedor 
  FOREIGN KEY (vendedor_id) 
  REFERENCES public.vendedores(id) 
  ON DELETE CASCADE;

-- TRANSACOES_FINANCEIRAS
ALTER TABLE public.transacoes_financeiras 
  ADD CONSTRAINT fk_transacoes_project 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE SET NULL;

ALTER TABLE public.transacoes_financeiras 
  ADD CONSTRAINT fk_transacoes_compra 
  FOREIGN KEY (compra_id) 
  REFERENCES public.compras(id) 
  ON DELETE SET NULL;

-- FRETES
ALTER TABLE public.fretes 
  ADD CONSTRAINT fk_fretes_project 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE SET NULL;

ALTER TABLE public.fretes 
  ADD CONSTRAINT fk_fretes_montagem 
  FOREIGN KEY (montagem_id) 
  REFERENCES public.montagem(id) 
  ON DELETE SET NULL;

ALTER TABLE public.fretes 
  ADD CONSTRAINT fk_fretes_fretista 
  FOREIGN KEY (fretista_id) 
  REFERENCES public.fretistas(id) 
  ON DELETE SET NULL;

ALTER TABLE public.fretes 
  ADD CONSTRAINT fk_fretes_veiculo 
  FOREIGN KEY (veiculo_id) 
  REFERENCES public.veiculos(id) 
  ON DELETE SET NULL;

-- ABASTECIMENTOS
ALTER TABLE public.abastecimentos 
  ADD CONSTRAINT fk_abastecimentos_veiculo 
  FOREIGN KEY (veiculo_id) 
  REFERENCES public.veiculos(id) 
  ON DELETE CASCADE;

-- MANUTENCOES_VEICULOS
ALTER TABLE public.manutencoes_veiculos 
  ADD CONSTRAINT fk_manutencoes_veiculos_veiculo 
  FOREIGN KEY (veiculo_id) 
  REFERENCES public.veiculos(id) 
  ON DELETE CASCADE;

-- MANUTENCOES_FERRAMENTAS
ALTER TABLE public.manutencoes_ferramentas 
  ADD CONSTRAINT fk_manutencoes_ferramentas_ferramenta 
  FOREIGN KEY (ferramenta_id) 
  REFERENCES public.ferramentas(id) 
  ON DELETE CASCADE;

-- MOVIMENTACOES_FERRAMENTAS
ALTER TABLE public.movimentacoes_ferramentas 
  ADD CONSTRAINT fk_movimentacoes_ferramentas_ferramenta 
  FOREIGN KEY (ferramenta_id) 
  REFERENCES public.ferramentas(id) 
  ON DELETE CASCADE;

ALTER TABLE public.movimentacoes_ferramentas 
  ADD CONSTRAINT fk_movimentacoes_ferramentas_funcionario 
  FOREIGN KEY (funcionario_id) 
  REFERENCES public.funcionarios(id) 
  ON DELETE SET NULL;

ALTER TABLE public.movimentacoes_ferramentas 
  ADD CONSTRAINT fk_movimentacoes_ferramentas_montagem 
  FOREIGN KEY (montagem_id) 
  REFERENCES public.montagem(id) 
  ON DELETE SET NULL;

-- CHEQUES
ALTER TABLE public.cheques 
  ADD CONSTRAINT fk_cheques_pagamento 
  FOREIGN KEY (pagamento_id) 
  REFERENCES public.pagamentos(id) 
  ON DELETE SET NULL;

-- Comentários explicativos
COMMENT ON CONSTRAINT fk_compras_fornecedor ON public.compras IS 
  'RESTRICT: Impede deletar fornecedor com compras vinculadas';

COMMENT ON CONSTRAINT fk_itens_compra_compra ON public.itens_compra IS 
  'CASCADE: Ao deletar compra, deleta todos os itens da compra';

COMMENT ON CONSTRAINT fk_producao_project ON public.producao IS 
  'CASCADE: Ao deletar projeto, deleta produção relacionada';

COMMENT ON CONSTRAINT fk_montagem_project ON public.montagem IS 
  'CASCADE: Ao deletar projeto, deleta montagem relacionada';