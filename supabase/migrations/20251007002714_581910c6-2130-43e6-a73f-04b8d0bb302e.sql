-- Adicionar campo de moeda e melhorias na tabela ferramentas

-- 1. Criar ENUM para moedas
CREATE TYPE public.moeda AS ENUM ('BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD');

-- 2. Adicionar coluna moeda à tabela ferramentas (padrão BRL)
ALTER TABLE public.ferramentas
ADD COLUMN moeda public.moeda NOT NULL DEFAULT 'BRL';

-- 3. Tornar codigo_patrimonio não obrigatório (já que pode ser gerado automaticamente)
ALTER TABLE public.ferramentas
ALTER COLUMN codigo_patrimonio DROP NOT NULL;

-- 4. Adicionar campos customizados de tipo e categoria (para permitir valores personalizados)
ALTER TABLE public.ferramentas
ADD COLUMN tipo_customizado TEXT,
ADD COLUMN categoria_customizada TEXT;

-- 5. Criar comentários explicativos
COMMENT ON COLUMN public.ferramentas.codigo_patrimonio IS 'Código de identificação do patrimônio (opcional, pode ser gerado automaticamente)';
COMMENT ON COLUMN public.ferramentas.moeda IS 'Moeda do valor de aquisição';
COMMENT ON COLUMN public.ferramentas.tipo_customizado IS 'Tipo personalizado quando tipo=OUTRO';
COMMENT ON COLUMN public.ferramentas.categoria_customizada IS 'Categoria personalizada quando categoria=OUTRO';