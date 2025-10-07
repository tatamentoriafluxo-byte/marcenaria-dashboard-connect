-- ============================================
-- PARTE 1: CORREÇÃO DE FOREIGN KEYS DUPLICADAS
-- ============================================

-- 1.1 Remover constraints ambíguas da tabela 'contas'
ALTER TABLE public.contas DROP CONSTRAINT IF EXISTS contas_fornecedor_id_fkey;
ALTER TABLE public.contas DROP CONSTRAINT IF EXISTS contas_cliente_id_fkey;
ALTER TABLE public.contas DROP CONSTRAINT IF EXISTS contas_project_id_fkey;
ALTER TABLE public.contas DROP CONSTRAINT IF EXISTS contas_compra_id_fkey;

-- 1.2 Recriar com nomes explícitos
ALTER TABLE public.contas 
  ADD CONSTRAINT contas_fornecedor_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id) ON DELETE SET NULL;

ALTER TABLE public.contas 
  ADD CONSTRAINT contas_cliente_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL;

ALTER TABLE public.contas 
  ADD CONSTRAINT contas_project_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.contas 
  ADD CONSTRAINT contas_compra_fkey FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE SET NULL;

-- 1.3 Corrigir estoque
ALTER TABLE public.estoque DROP CONSTRAINT IF EXISTS estoque_material_id_fkey;
ALTER TABLE public.estoque DROP CONSTRAINT IF EXISTS estoque_fornecedor_principal_id_fkey;

ALTER TABLE public.estoque 
  ADD CONSTRAINT estoque_material_fkey FOREIGN KEY (material_id) REFERENCES public.materiais(id) ON DELETE CASCADE;

ALTER TABLE public.estoque 
  ADD CONSTRAINT estoque_fornecedor_fkey FOREIGN KEY (fornecedor_principal_id) REFERENCES public.fornecedores(id) ON DELETE SET NULL;

-- 1.4 Corrigir feedbacks
ALTER TABLE public.feedbacks DROP CONSTRAINT IF EXISTS feedbacks_project_id_fkey;

ALTER TABLE public.feedbacks 
  ADD CONSTRAINT feedbacks_project_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 1.5 Corrigir compras
ALTER TABLE public.compras DROP CONSTRAINT IF EXISTS compras_fornecedor_id_fkey;

ALTER TABLE public.compras 
  ADD CONSTRAINT compras_fornecedor_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id) ON DELETE CASCADE;

-- ============================================
-- PARTE 2: MÓDULO DE ORÇAMENTOS
-- ============================================

-- 2.1 CRIAR ENUMS
CREATE TYPE public.unidade_orcamento AS ENUM ('M2', 'ML', 'UNIDADE', 'M3', 'KG');
CREATE TYPE public.status_orcamento AS ENUM ('RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'EXPIRADO', 'CONVERTIDO');
CREATE TYPE public.categoria_item AS ENUM (
  'ARMARIO',
  'BALCAO',
  'PORTA',
  'GAVETA',
  'ACESSORIO',
  'ACABAMENTO',
  'FERRAGEM',
  'VIDRO',
  'ILUMINACAO',
  'OUTROS'
);

-- 2.2 TABELA: catalogo_itens (228 itens de preço)
CREATE TABLE public.catalogo_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo TEXT,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria categoria_item NOT NULL DEFAULT 'OUTROS',
  unidade_medida unidade_orcamento NOT NULL DEFAULT 'UNIDADE',
  preco_base NUMERIC NOT NULL CHECK (preco_base >= 0),
  custo_estimado NUMERIC DEFAULT 0 CHECK (custo_estimado >= 0),
  margem_lucro NUMERIC DEFAULT 30 CHECK (margem_lucro >= 0),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, codigo)
);

-- 2.3 TABELA: orcamentos
CREATE TABLE public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_orcamento TEXT UNIQUE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  telefone_cliente TEXT,
  email_cliente TEXT,
  data_orcamento DATE NOT NULL DEFAULT CURRENT_DATE,
  validade_dias INTEGER NOT NULL DEFAULT 30,
  data_validade DATE,
  status status_orcamento NOT NULL DEFAULT 'RASCUNHO',
  valor_subtotal NUMERIC NOT NULL DEFAULT 0,
  desconto_percentual NUMERIC DEFAULT 0 CHECK (desconto_percentual >= 0 AND desconto_percentual <= 100),
  desconto_valor NUMERIC DEFAULT 0 CHECK (desconto_valor >= 0),
  valor_total NUMERIC NOT NULL DEFAULT 0,
  observacoes TEXT,
  observacoes_internas TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.4 TABELA: orcamentos_itens
CREATE TABLE public.orcamentos_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  catalogo_item_id UUID REFERENCES public.catalogo_itens(id) ON DELETE SET NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  nome_item TEXT NOT NULL,
  descricao TEXT,
  quantidade NUMERIC NOT NULL CHECK (quantidade > 0),
  unidade_medida unidade_orcamento NOT NULL DEFAULT 'UNIDADE',
  preco_unitario NUMERIC NOT NULL CHECK (preco_unitario >= 0),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.5 ÍNDICES DE PERFORMANCE
CREATE INDEX idx_catalogo_itens_user ON public.catalogo_itens(user_id) WHERE ativo = true;
CREATE INDEX idx_catalogo_itens_categoria ON public.catalogo_itens(categoria);
CREATE INDEX idx_catalogo_itens_codigo ON public.catalogo_itens(codigo);

CREATE INDEX idx_orcamentos_user ON public.orcamentos(user_id);
CREATE INDEX idx_orcamentos_cliente ON public.orcamentos(cliente_id);
CREATE INDEX idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX idx_orcamentos_data ON public.orcamentos(data_orcamento DESC);
CREATE INDEX idx_orcamentos_numero ON public.orcamentos(numero_orcamento);

CREATE INDEX idx_orcamentos_itens_orcamento ON public.orcamentos_itens(orcamento_id);
CREATE INDEX idx_orcamentos_itens_ordem ON public.orcamentos_itens(orcamento_id, ordem);

-- 2.6 ROW LEVEL SECURITY
ALTER TABLE public.catalogo_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus próprios itens do catálogo"
  ON public.catalogo_itens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar seus próprios orçamentos"
  ON public.orcamentos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar itens de seus orçamentos"
  ON public.orcamentos_itens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orcamentos 
      WHERE orcamentos.id = orcamentos_itens.orcamento_id 
      AND orcamentos.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orcamentos 
      WHERE orcamentos.id = orcamentos_itens.orcamento_id 
      AND orcamentos.user_id = auth.uid()
    )
  );

-- 2.7 TRIGGERS AUTOMÁTICOS

-- Trigger 1: Calcular subtotal do item
CREATE OR REPLACE FUNCTION public.calcular_subtotal_item_orcamento()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subtotal := NEW.quantidade * NEW.preco_unitario;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_subtotal_item_orcamento
  BEFORE INSERT OR UPDATE ON public.orcamentos_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.calcular_subtotal_item_orcamento();

-- Trigger 2: Recalcular total do orçamento
CREATE OR REPLACE FUNCTION public.recalcular_total_orcamento()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_recalcular_total_orcamento_insert
  AFTER INSERT ON public.orcamentos_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.recalcular_total_orcamento();

CREATE TRIGGER trigger_recalcular_total_orcamento_update
  AFTER UPDATE ON public.orcamentos_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.recalcular_total_orcamento();

CREATE TRIGGER trigger_recalcular_total_orcamento_delete
  AFTER DELETE ON public.orcamentos_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.recalcular_total_orcamento();

-- Trigger 3: Gerar número do orçamento
CREATE OR REPLACE FUNCTION public.gerar_numero_orcamento()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gerar_numero_orcamento
  BEFORE INSERT ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.gerar_numero_orcamento();

-- Trigger 4: Update timestamp
CREATE TRIGGER trigger_update_catalogo_itens
  BEFORE UPDATE ON public.catalogo_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_orcamentos
  BEFORE UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();