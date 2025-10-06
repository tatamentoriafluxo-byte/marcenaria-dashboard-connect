-- ============================================
-- ETAPA 2: TABELAS TRANSACIONAIS
-- ============================================

-- Tabela de Estoque
CREATE TABLE public.estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materiais(id) ON DELETE CASCADE,
  quantidade_atual DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantidade_minima DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantidade_maxima DECIMAL(10, 2),
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- Tipos ENUM para Compras
CREATE TYPE status_compra AS ENUM (
  'PENDENTE',
  'CONFIRMADO',
  'EM_TRANSITO',
  'ENTREGUE',
  'CANCELADO'
);

-- Tabela de Compras (de fornecedores)
CREATE TABLE public.compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id),
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  data_entrega_prevista DATE,
  data_entrega_real DATE,
  status status_compra NOT NULL DEFAULT 'PENDENTE',
  valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens de Compra
CREATE TABLE public.itens_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID NOT NULL REFERENCES public.compras(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materiais(id),
  quantidade DECIMAL(10, 2) NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos ENUM para Produção
CREATE TYPE status_producao AS ENUM (
  'PLANEJADO',
  'EM_ANDAMENTO',
  'PAUSADO',
  'CONCLUIDO',
  'REJEITADO'
);

-- Tabela de Produção
CREATE TABLE public.producao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  marceneiro_id UUID REFERENCES public.funcionarios(id),
  data_inicio DATE,
  data_fim_prevista DATE,
  data_fim_real DATE,
  tempo_estimado INTEGER, -- em horas
  tempo_real INTEGER, -- em horas
  status status_producao NOT NULL DEFAULT 'PLANEJADO',
  valor_producao DECIMAL(10, 2),
  taxa_rejeicao DECIMAL(5, 2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos ENUM para Montagem
CREATE TYPE status_montagem AS ENUM (
  'AGENDADO',
  'EM_ANDAMENTO',
  'CONCLUIDO',
  'CANCELADO'
);

-- Tabela de Montagem
CREATE TABLE public.montagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  montador_id UUID REFERENCES public.funcionarios(id),
  data_montagem DATE,
  tempo_estimado INTEGER, -- em horas
  tempo_real INTEGER, -- em horas
  status status_montagem NOT NULL DEFAULT 'AGENDADO',
  valor_montagem DECIMAL(10, 2),
  desafios TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos ENUM para Feedback
CREATE TYPE avaliacao AS ENUM (
  'EXCELENTE',
  'BOM',
  'REGULAR',
  'RUIM'
);

-- Tabela de Feedbacks
CREATE TABLE public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  data_feedback DATE DEFAULT CURRENT_DATE,
  
  -- Avaliações específicas
  avaliacao_vendedor avaliacao,
  avaliacao_equipe_projetos avaliacao,
  avaliacao_fabricacao avaliacao,
  avaliacao_montagem avaliacao,
  avaliacao_atendimento_geral avaliacao,
  
  -- Recomendação
  recomendaria_servico BOOLEAN,
  
  -- Sugestões
  sugestoes_melhoria TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos ENUM para Fluxo de Caixa
CREATE TYPE tipo_transacao AS ENUM (
  'RECEITA',
  'DESPESA'
);

CREATE TYPE categoria_transacao AS ENUM (
  'VENDA',
  'SERVICO',
  'COMPRA_MATERIAL',
  'SALARIO',
  'ALUGUEL',
  'ENERGIA',
  'MARKETING',
  'MANUTENCAO',
  'OUTROS'
);

CREATE TYPE forma_pagamento AS ENUM (
  'DINHEIRO',
  'CARTAO_CREDITO',
  'CARTAO_DEBITO',
  'PIX',
  'BOLETO',
  'TRANSFERENCIA',
  'CREDITO_PARCELADO'
);

-- Tabela de Transações Financeiras (Fluxo de Caixa)
CREATE TABLE public.transacoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo tipo_transacao NOT NULL,
  categoria categoria_transacao NOT NULL,
  data_transacao DATE NOT NULL DEFAULT CURRENT_DATE,
  valor DECIMAL(10, 2) NOT NULL,
  forma_pagamento forma_pagamento,
  descricao TEXT,
  numero_nf TEXT,
  status_pagamento TEXT CHECK (status_pagamento IN ('PAGO', 'PENDENTE', 'ATRASADO', 'CANCELADO')) DEFAULT 'PAGO',
  project_id UUID REFERENCES public.projects(id),
  compra_id UUID REFERENCES public.compras(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Metas
CREATE TABLE public.metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES public.vendedores(id),
  mes_referencia DATE NOT NULL, -- primeiro dia do mês
  meta_faturamento DECIMAL(10, 2),
  meta_lucro DECIMAL(10, 2),
  meta_projetos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vendedor_id, mes_referencia)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.montagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- RLS Policies para Estoque
CREATE POLICY "Usuários podem gerenciar seu próprio estoque"
  ON public.estoque FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Compras
CREATE POLICY "Usuários podem gerenciar suas próprias compras"
  ON public.compras FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Itens de Compra
CREATE POLICY "Usuários podem gerenciar itens de suas compras"
  ON public.itens_compra FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.compras 
    WHERE compras.id = itens_compra.compra_id 
    AND compras.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.compras 
    WHERE compras.id = itens_compra.compra_id 
    AND compras.user_id = auth.uid()
  ));

-- RLS Policies para Produção
CREATE POLICY "Usuários podem gerenciar sua própria produção"
  ON public.producao FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Montagem
CREATE POLICY "Usuários podem gerenciar suas próprias montagens"
  ON public.montagem FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Feedbacks
CREATE POLICY "Usuários podem gerenciar seus próprios feedbacks"
  ON public.feedbacks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Transações Financeiras
CREATE POLICY "Usuários podem gerenciar suas próprias transações"
  ON public.transacoes_financeiras FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Metas
CREATE POLICY "Usuários podem gerenciar suas próprias metas"
  ON public.metas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_estoque_updated_at
  BEFORE UPDATE ON public.estoque
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compras_updated_at
  BEFORE UPDATE ON public.compras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_producao_updated_at
  BEFORE UPDATE ON public.producao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_montagem_updated_at
  BEFORE UPDATE ON public.montagem
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transacoes_financeiras_updated_at
  BEFORE UPDATE ON public.transacoes_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metas_updated_at
  BEFORE UPDATE ON public.metas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();