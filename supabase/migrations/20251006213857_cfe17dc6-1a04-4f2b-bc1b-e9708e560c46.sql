-- Criação da tabela de perfis de usuário (marcenarias)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_marcenaria TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_marcenaria)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome_marcenaria', 'Marcenaria')
  );
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Criar tipo ENUM para status de projeto
CREATE TYPE status_projeto AS ENUM (
  'ORCAMENTO',
  'CONVERTIDO',
  'EM_PRODUCAO',
  'ENTREGUE',
  'CANCELADO'
);

-- Criar tipo ENUM para origem do lead
CREATE TYPE origem_lead AS ENUM (
  'LOJA',
  'INSTAGRAM',
  'FACEBOOK',
  'WHATSAPP',
  'INDICACAO',
  'GOOGLE',
  'OUTROS'
);

-- Tabela de projetos
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Informações básicas
  cod_projeto TEXT NOT NULL,
  data_contato DATE NOT NULL,
  vendedor_responsavel TEXT NOT NULL,
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  origem_lead origem_lead NOT NULL,
  ambiente TEXT NOT NULL,
  
  -- Valores financeiros
  valor_orcamento DECIMAL(10, 2) NOT NULL DEFAULT 0,
  custo_materiais DECIMAL(10, 2) NOT NULL DEFAULT 0,
  custo_mao_obra DECIMAL(10, 2) NOT NULL DEFAULT 0,
  outros_custos DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Informações de venda
  status status_projeto NOT NULL DEFAULT 'ORCAMENTO',
  data_venda DATE,
  valor_venda DECIMAL(10, 2),
  prazo_entrega INTEGER,
  data_entrega DATE,
  
  -- Outros campos
  visualizado_cliente BOOLEAN DEFAULT FALSE,
  preencheu_formulario BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint única por usuário
  UNIQUE(user_id, cod_projeto)
);

-- Habilitar RLS na tabela projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para projects
CREATE POLICY "Usuários podem ver seus próprios projetos"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios projetos"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios projetos"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios projetos"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();