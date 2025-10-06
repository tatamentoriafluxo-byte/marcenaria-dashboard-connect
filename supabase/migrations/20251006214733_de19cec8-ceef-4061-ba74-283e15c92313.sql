-- ============================================
-- ETAPA 1: TABELAS BASE DO SISTEMA
-- ============================================

-- Tabela de Vendedores
CREATE TABLE public.vendedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  meta_mensal DECIMAL(10, 2),
  comissao_percentual DECIMAL(5, 2) DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nome)
);

-- Tabela de Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  cpf_cnpj TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, telefone)
);

-- Tabela de Marceneiros/Montadores
CREATE TABLE public.funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('MARCENEIRO', 'MONTADOR', 'AMBOS')),
  telefone TEXT,
  salario DECIMAL(10, 2),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nome)
);

-- Tabela de Fornecedores
CREATE TABLE public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  tipo_material TEXT,
  prazo_entrega_medio INTEGER, -- em dias
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nome)
);

-- Tipos ENUM para Materiais
CREATE TYPE tipo_material AS ENUM (
  'MADEIRA',
  'FERRAGEM',
  'ACABAMENTO',
  'FERRAMENTA',
  'OUTROS'
);

CREATE TYPE unidade_medida AS ENUM (
  'UNIDADE',
  'METRO',
  'METRO_QUADRADO',
  'LITRO',
  'KILO',
  'PACOTE'
);

-- Tabela de Materiais (Catálogo)
CREATE TABLE public.materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo tipo_material NOT NULL,
  unidade unidade_medida NOT NULL DEFAULT 'UNIDADE',
  codigo TEXT,
  descricao TEXT,
  preco_medio DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nome)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Vendedores
CREATE POLICY "Usuários podem ver seus próprios vendedores"
  ON public.vendedores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios vendedores"
  ON public.vendedores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios vendedores"
  ON public.vendedores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios vendedores"
  ON public.vendedores FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para Clientes
CREATE POLICY "Usuários podem ver seus próprios clientes"
  ON public.clientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios clientes"
  ON public.clientes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios clientes"
  ON public.clientes FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para Funcionários
CREATE POLICY "Usuários podem ver seus próprios funcionários"
  ON public.funcionarios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios funcionários"
  ON public.funcionarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios funcionários"
  ON public.funcionarios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios funcionários"
  ON public.funcionarios FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para Fornecedores
CREATE POLICY "Usuários podem ver seus próprios fornecedores"
  ON public.fornecedores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios fornecedores"
  ON public.fornecedores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios fornecedores"
  ON public.fornecedores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios fornecedores"
  ON public.fornecedores FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para Materiais
CREATE POLICY "Usuários podem ver seus próprios materiais"
  ON public.materiais FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios materiais"
  ON public.materiais FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios materiais"
  ON public.materiais FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios materiais"
  ON public.materiais FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_vendedores_updated_at
  BEFORE UPDATE ON public.vendedores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funcionarios_updated_at
  BEFORE UPDATE ON public.funcionarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at
  BEFORE UPDATE ON public.fornecedores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materiais_updated_at
  BEFORE UPDATE ON public.materiais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();