-- Criar ENUMs para Veículos
CREATE TYPE tipo_veiculo AS ENUM ('CARRO', 'CAMINHAO', 'KOMBI', 'VAN', 'UTILITARIO', 'OUTRO');
CREATE TYPE status_veiculo AS ENUM ('ATIVO', 'MANUTENCAO', 'INATIVO', 'VENDIDO');

-- Criar ENUMs para Fretistas
CREATE TYPE tipo_veiculo_fretista AS ENUM ('CARRO', 'CAMINHAO', 'VAN', 'BAU', 'UTILITARIO');
CREATE TYPE tipo_transporte AS ENUM ('VEICULO_PROPRIO', 'FRETISTA');

-- Criar ENUMs para Ferramentas
CREATE TYPE tipo_ferramenta AS ENUM ('ESTACIONARIA', 'MANUAL', 'ELETRICA', 'PNEUMATICA');
CREATE TYPE categoria_ferramenta AS ENUM ('CORTE', 'ACABAMENTO', 'MEDICAO', 'FIXACAO', 'LIXAMENTO', 'FURACAO', 'OUTRO');
CREATE TYPE status_ferramenta AS ENUM ('DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'QUEBRADA', 'VENDIDA');
CREATE TYPE localizacao_ferramenta AS ENUM ('MARCENARIA', 'OBRA', 'MANUTENCAO_EXTERNA');
CREATE TYPE tipo_manutencao AS ENUM ('PREVENTIVA', 'CORRETIVA', 'TROCA_PECA', 'CALIBRACAO');
CREATE TYPE tipo_movimentacao_ferramenta AS ENUM ('SAIDA_OBRA', 'RETORNO_MARCENARIA', 'EMPRESTIMO_FUNCIONARIO', 'DEVOLUCAO', 'MANUTENCAO');

-- Tabela de Veículos
CREATE TABLE public.veiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo tipo_veiculo NOT NULL,
  placa TEXT NOT NULL,
  modelo TEXT NOT NULL,
  marca TEXT,
  ano INTEGER,
  cor TEXT,
  status status_veiculo NOT NULL DEFAULT 'ATIVO',
  km_atual NUMERIC DEFAULT 0,
  data_aquisicao DATE,
  valor_aquisicao NUMERIC DEFAULT 0,
  custo_mensal_medio NUMERIC DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Abastecimentos
CREATE TABLE public.abastecimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  km_atual NUMERIC NOT NULL,
  litros NUMERIC NOT NULL,
  valor NUMERIC NOT NULL,
  posto TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Manutenções de Veículos
CREATE TABLE public.manutencoes_veiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo tipo_manutencao NOT NULL,
  km_atual NUMERIC,
  descricao TEXT,
  custo NUMERIC DEFAULT 0,
  oficina TEXT,
  proxima_manutencao_km NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Fretistas
CREATE TABLE public.fretistas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  telefone TEXT,
  email TEXT,
  tipo_veiculo tipo_veiculo_fretista,
  placa_veiculo TEXT,
  capacidade_carga NUMERIC,
  valor_km NUMERIC,
  valor_frete_fixo NUMERIC,
  avaliacao_media NUMERIC DEFAULT 0 CHECK (avaliacao_media >= 0 AND avaliacao_media <= 5),
  total_fretes INTEGER DEFAULT 0,
  total_pago NUMERIC DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Fretes
CREATE TABLE public.fretes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo_transporte tipo_transporte NOT NULL,
  veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE SET NULL,
  fretista_id UUID REFERENCES public.fretistas(id) ON DELETE SET NULL,
  montagem_id UUID REFERENCES public.montagem(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  data_frete DATE NOT NULL DEFAULT CURRENT_DATE,
  origem TEXT,
  destino TEXT,
  km_rodados NUMERIC,
  custo_frete NUMERIC DEFAULT 0,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  observacoes TEXT,
  status_pagamento TEXT DEFAULT 'PENDENTE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Ferramentas
CREATE TABLE public.ferramentas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  codigo_patrimonio TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo tipo_ferramenta NOT NULL,
  categoria categoria_ferramenta NOT NULL,
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  data_aquisicao DATE,
  valor_aquisicao NUMERIC DEFAULT 0,
  valor_atual NUMERIC DEFAULT 0,
  vida_util_anos INTEGER DEFAULT 10,
  taxa_depreciacao_anual NUMERIC DEFAULT 10.00,
  status status_ferramenta NOT NULL DEFAULT 'DISPONIVEL',
  localizacao localizacao_ferramenta NOT NULL DEFAULT 'MARCENARIA',
  ultima_manutencao DATE,
  proxima_manutencao DATE,
  qr_code TEXT,
  foto_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, codigo_patrimonio)
);

-- Tabela de Manutenções de Ferramentas
CREATE TABLE public.manutencoes_ferramentas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ferramenta_id UUID NOT NULL REFERENCES public.ferramentas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo tipo_manutencao NOT NULL,
  descricao TEXT,
  custo NUMERIC DEFAULT 0,
  responsavel TEXT,
  proxima_prevista DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Movimentações de Ferramentas
CREATE TABLE public.movimentacoes_ferramentas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ferramenta_id UUID NOT NULL REFERENCES public.ferramentas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tipo_movimentacao tipo_movimentacao_ferramenta NOT NULL,
  montagem_id UUID REFERENCES public.montagem(id) ON DELETE SET NULL,
  funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  data_saida TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_retorno_prevista DATE,
  data_retorno_real TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes_veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fretistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ferramentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes_ferramentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_ferramentas ENABLE ROW LEVEL SECURITY;

-- RLS Policies para Veículos
CREATE POLICY "Usuários podem gerenciar seus próprios veículos"
  ON public.veiculos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Abastecimentos
CREATE POLICY "Usuários podem gerenciar seus próprios abastecimentos"
  ON public.abastecimentos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Manutenções de Veículos
CREATE POLICY "Usuários podem gerenciar suas próprias manutenções de veículos"
  ON public.manutencoes_veiculos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Fretistas
CREATE POLICY "Usuários podem gerenciar seus próprios fretistas"
  ON public.fretistas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Fretes
CREATE POLICY "Usuários podem gerenciar seus próprios fretes"
  ON public.fretes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Ferramentas
CREATE POLICY "Usuários podem gerenciar suas próprias ferramentas"
  ON public.ferramentas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Manutenções de Ferramentas
CREATE POLICY "Usuários podem gerenciar suas próprias manutenções de ferramentas"
  ON public.manutencoes_ferramentas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies para Movimentações de Ferramentas
CREATE POLICY "Usuários podem gerenciar suas próprias movimentações de ferramentas"
  ON public.movimentacoes_ferramentas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_veiculos_updated_at
  BEFORE UPDATE ON public.veiculos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fretistas_updated_at
  BEFORE UPDATE ON public.fretistas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ferramentas_updated_at
  BEFORE UPDATE ON public.ferramentas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular depreciação de ferramentas
CREATE OR REPLACE FUNCTION public.calcular_depreciacao_ferramenta(ferramenta_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valor_original NUMERIC;
  anos_decorridos NUMERIC;
  taxa_anual NUMERIC;
  vida_util INTEGER;
  data_compra DATE;
  depreciacao NUMERIC;
BEGIN
  SELECT 
    valor_aquisicao,
    taxa_depreciacao_anual,
    vida_util_anos,
    data_aquisicao
  INTO 
    valor_original,
    taxa_anual,
    vida_util,
    data_compra
  FROM public.ferramentas
  WHERE id = ferramenta_id;
  
  IF data_compra IS NULL THEN
    RETURN valor_original;
  END IF;
  
  anos_decorridos := EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_compra)) + 
                     (EXTRACT(MONTH FROM AGE(CURRENT_DATE, data_compra)) / 12.0);
  
  IF anos_decorridos >= vida_util THEN
    RETURN 0;
  END IF;
  
  depreciacao := valor_original * (taxa_anual / 100) * anos_decorridos;
  
  RETURN GREATEST(valor_original - depreciacao, 0);
END;
$$;