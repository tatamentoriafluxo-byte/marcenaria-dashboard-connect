

# Plano de Funcionalidades Revolucionarias - Sistema de Marcenaria Imbativel

## Visao Geral

Com base na analise completa do sistema atual, proponho um conjunto de funcionalidades que transformariam este ERP de marcenaria em algo unico no mundo. Vou organizar por prioridade de impacto.

---

## FASE 1: Sistema de Semaforo Inteligente (Alto Impacto Imediato)

### 1.1 Painel de Alertas Visuais (Verde/Amarelo/Vermelho)

**O que faz:**
Um dashboard principal que mostra TODAS as obras/projetos com cores indicando urgencia:

- **VERDE**: Tudo dentro do prazo, sem problemas
- **AMARELO**: Atencao necessaria (50% do prazo ja passou, ou se aproximando de algum limite)
- **VERMELHO**: Critico (atrasado, problemas reportados, acao imediata necessaria)

**Onde aparece:**
- Dashboard principal (primeira coisa que o usuario ve)
- Pagina de Producao
- Pagina de Montagem
- Pagina de Vendas

**Logica de calculo automatico:**
```text
+------------------+-------------------+-------------------+
|     VERDE        |     AMARELO       |    VERMELHO       |
+------------------+-------------------+-------------------+
| Dentro do prazo  | 70% do prazo      | Prazo estourado   |
| Sem problemas    | Sem retorno 3d    | Cliente reclamou  |
| Cliente ok       | Material faltando | Producao pausada  |
| Producao fluindo | Taxa rejeicao >5% | Taxa rejeicao >15%|
+------------------+-------------------+-------------------+
```

### 1.2 Aba de Suportes Emergenciais

**O que faz:**
Projetos que geraram problemas pos-montagem sao automaticamente movidos para uma aba especial de "Suporte Critico". Prioridade maxima.

**Gatilhos automaticos:**
- Feedback negativo do cliente registrado
- Montagem com desafios criticos
- Taxa de rejeicao alta na producao
- Reclamacao formal registrada

---

## FASE 2: IA para Priorizacao de Vendas (Medio Prazo)

### 2.1 Score de Probabilidade de Fechamento

**O que faz:**
A IA analisa os dados historicos de vendas e atribui um SCORE de 0-100 para cada orcamento, indicando a probabilidade de fechar.

**Fatores analisados automaticamente:**
- Origem do lead (qual origem converte mais?)
- Valor do orcamento vs ticket medio
- Tempo desde o primeiro contato
- Se cliente ja visualizou orcamento
- Se cliente ja preencheu formulario
- Historico do vendedor com esse perfil de cliente
- Ambiente solicitado (quais ambientes fecham mais?)

**Visualizacao:**
Cards de orcamentos ordenados por probabilidade de fechamento, com cores:
- Alto (70-100%): Verde
- Medio (40-69%): Amarelo  
- Baixo (0-39%): Vermelho

### 2.2 Sugestoes Inteligentes para Vendedor

**O que faz:**
A IA sugere acoes especificas para cada orcamento:
- "Ligar para cliente - nao respondeu ha 5 dias"
- "Oferecer desconto - cliente sensivel a preco"
- "Enviar fotos de projeto similar - cliente visual"

---

## FASE 3: IA para Geracao de Projetos (Longo Prazo)

### 3.1 Foto para Projeto 2D

**O que faz:**
Usuario tira foto do ambiente do cliente e a IA:
1. Identifica as dimensoes aproximadas
2. Sugere layouts de moveis
3. Gera croqui 2D inicial

**Tecnologia:**
Lovable AI com modelo de visao (google/gemini-2.5-pro) para:
- Analise de imagem do ambiente
- Medicoes aproximadas
- Sugestao de layouts baseado no catalogo

### 3.2 Orcamento Automatico por IA

**O que faz:**
A partir da analise da foto e preferencias do cliente:
1. Sugere itens do catalogo
2. Estima quantidades
3. Gera orcamento preliminar automatico

---

## FASE 4: Prospecao Inteligente de Clientes

### 4.1 Busca de Leads Qualificados

**O que faz:**
Sistema sugere potenciais clientes baseado em:
- Condominios de alto padrao na regiao
- Arquitetos/designers parceiros
- Construtoras com entregas recentes
- Imobiliarias com vendas de imoveis novos

**Integracao:**
- API de busca web para encontrar condominios
- Registro de arquitetos parceiros
- Historico de indicacoes que deram certo

---

## ARQUITETURA TECNICA

### Novos Componentes:

```text
src/
  components/
    alertas/
      PainelSemaforo.tsx          <- Dashboard visual verde/amarelo/vermelho
      CardProjetoAlerta.tsx       <- Card individual com cor
      SuportesEmergenciais.tsx    <- Aba de suportes criticos
    ia/
      ScoreFechamento.tsx         <- Score de probabilidade
      SugestoesVendedor.tsx       <- Sugestoes IA
      AnaliseFotoAmbiente.tsx     <- Upload e analise de foto
  hooks/
    useAlertasProjetos.ts         <- Logica de calculo de alertas
    useScoreFechamento.ts         <- Logica de score IA
  pages/
    CentralAlertas.tsx            <- Pagina principal de alertas
    ProspecaoLeads.tsx            <- Pagina de prospecao
```

### Mudancas no Banco:

```sql
-- Nova tabela para alertas
CREATE TABLE alertas_projetos (
  id uuid PRIMARY KEY,
  project_id uuid REFERENCES projects(id),
  tipo_alerta text, -- 'VERDE', 'AMARELO', 'VERMELHO'
  motivo text,
  resolvido boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Nova tabela para suportes emergenciais
CREATE TABLE suportes_emergenciais (
  id uuid PRIMARY KEY,
  project_id uuid REFERENCES projects(id),
  descricao text,
  prioridade text, -- 'CRITICO', 'ALTO', 'MEDIO'
  status text, -- 'ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO'
  created_at timestamp DEFAULT now()
);

-- Coluna de score nos orcamentos
ALTER TABLE orcamentos ADD COLUMN score_fechamento numeric;
ALTER TABLE orcamentos ADD COLUMN sugestoes_ia text[];
```

### Edge Functions para IA:

```text
supabase/functions/
  calcular-score-fechamento/     <- Calcula probabilidade
  analisar-foto-ambiente/        <- Analise de imagem
  gerar-sugestoes-vendedor/      <- Sugestoes personalizadas
```

---

## CRONOGRAMA SUGERIDO

| Semana | Funcionalidade                          |
|--------|----------------------------------------|
| 1      | Painel Semaforo (Verde/Amarelo/Vermelho) |
| 1      | Cards visuais de alerta                |
| 2      | Aba Suportes Emergenciais              |
| 2      | Gatilhos automaticos de alerta         |
| 3      | Score de Fechamento com IA             |
| 3      | Ranking de orcamentos por probabilidade|
| 4      | Sugestoes Inteligentes para Vendedor   |
| 5+     | Analise de Foto (fase avancada)        |

---

## DIFERENCIAIS COMPETITIVOS

1. **Nenhum outro ERP de marcenaria** tem sistema de semaforo visual automatico
2. **IA para priorizacao de vendas** nao existe no mercado brasileiro
3. **Analise de foto para orcamento** seria revolucionario
4. **Integracao completa** producao-montagem-vendas-suporte em um so lugar

---

## PROXIMO PASSO

Gostaria de aprovar este plano para comecarmos pela **Fase 1 - Sistema de Semaforo**? 

Seria a mudanca de maior impacto imediato, pois:
- Facil de implementar (dados ja existem)
- Visual e intuitivo
- Resolve problema real do dia-a-dia
- Diferencial competitivo instantaneo

