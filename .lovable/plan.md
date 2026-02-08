
# Plano de Replicacao do Dashboard Look Studio

## Analise Comparativa: O Que Ja Existe vs O Que Falta

### 1. RESUMO VENDAS

**Referencia Look Studio:**
- 4 KPIs: Total Vendas (com % meta e barra de progresso verde), Total Orcamento, Venda + Orcamento, Total Perdido
- Grafico "Crescimento de venda por mes" (linha)
- Grafico "Valor e Quantidade de venda por ambiente" (linha por ambiente: SALA, COZINHA, QUARTO CASAL)
- Tabela "Ranking por vendedor" com paginacao
- Tabela "Ranking por cliente" com paginacao
- Filtros: Selecionar periodo, Vendedor

**Status Atual:**
- KPIs: Faturamento Total, Ticket Medio, Total de Vendas, Meta Mensal (parcialmente OK)
- Grafico vendas por mes (OK)
- Grafico origem leads (pizza - diferente do esperado)
- Valor/Quantidade por ambiente (OK)
- Rankings por vendedor e cliente (OK, mas sem paginacao)

**Alteracoes Necessarias:**
- Adicionar barra de progresso verde no KPI "Total Vendas" com % meta
- Trocar KPI "Ticket Medio" por "Total Orcamento"
- Adicionar KPI "Venda + Orcamento" e "Total Perdido"
- Mudar grafico de origem leads para linha de crescimento por ambiente
- Implementar cores do Look Studio (azul escuro, laranja)
- Adicionar filtros de periodo e vendedor
- Adicionar paginacao nas tabelas

---

### 2. RESUMO LUCRO

**Referencia Look Studio:**
- 4 KPIs: Total Lucro, Meta, Lucro x Meta (negativo em vermelho), Atingimento meta (%)
- Grafico "Crescimento do lucro por mes" (linha)
- Grafico "Lucro e %Representatividade por ambiente" (linha multi-serie)
- Tabela "Ranking Lucro por Vendedor" com colunas: Vendedor, Telefone, Telefone (%), Valor da venda

**Status Atual:**
- KPIs: Lucro Total, Margem Media, Custo Total, Receita Total
- Grafico evolucao (OK, mas precisa ajustar)
- Tabela ranking lucro por vendedor (OK)
- Falta: KPIs de meta e atingimento

**Alteracoes Necessarias:**
- Adicionar KPI "Meta" (buscar da tabela metas)
- Adicionar KPI "Lucro x Meta" com valor negativo em vermelho
- Adicionar KPI "Atingimento meta" em %
- Adicionar coluna "Telefone (%)" na tabela ranking

---

### 3. RESUMO PROJETOS

**Referencia Look Studio:**
- 3 KPIs grandes: Total Projetos (com grafico barras), Total Visualizacao (com Valor orcamento), Total Conversao (com Custo materiais/mao obra)
- Tabela "Origem lead / Status / Qtd Proj"
- Tabela "Cod Projeto / Status / Visualizado?"
- Tabela "Ambiente / Origem lead / Conversao"
- Graficos: Tempo entre Venda e Contato, Tempo entre Venda e Entrega
- Filtros: Periodo, Ambiente, Origem lead

**Status Atual:**
- KPIs simples: Total, Em Andamento, Concluidos, Atrasados
- Grafico pizza por status
- Grafico barras por ambiente
- Taxa de conversao funil

**Alteracoes Necessarias:**
- Refatorar KPIs para layout do Look Studio (com graficos mini internos)
- Adicionar tabela Origem lead / Status / Qtd
- Adicionar tabela Cod Projeto / Status / Visualizado
- Adicionar tabela Ambiente / Origem lead / Conversao
- Adicionar graficos de tempo (Venda-Contato, Venda-Entrega)
- Adicionar filtros interativos

---

### 4. RESUMO FLUXO DE CAIXA

**Referencia Look Studio:**
- 3 KPIs: Receita (Total Entradas), Saidas, Saldo (Record Count com grafico linha)
- Tabela "Subcategoria / Valor"
- Tabela "Categoria / Valor" (Custo Variavel, Custo Fixo)
- Tabela "Data / Valor / Tipo movimentacao / Record Count"
- Grafico pizza "Forma de Pagamento (Entradas)"
- Tabela "Detalhe por NF"
- Grafico barras "Receita x Saidas"

**Status Atual:**
- KPIs: Saldo Atual, Total Entradas, Total Saidas, Saldo Mes
- Grafico linha Receita x Saidas (OK)
- Grafico barras por categoria (OK)
- Tabela subcategoria (OK)
- Pizza forma pagamento (OK)
- Tabela NF (OK)

**Alteracoes Necessarias:**
- Reorganizar layout para 3 colunas de KPIs com graficos mini
- Adicionar grafico linha no card "Saldo"
- Adicionar tabela de movimentacao detalhada

---

### 5. RESUMO PRODUCAO

**Referencia Look Studio:**
- 3 KPIs: Producao Marceneiro, Total Producao Fabrica (grafico barras horizontal), Capacidade Producao (grafico barras)
- Tabela "Nome Marceneiro / Valor Prod"
- Tabela "Data Real Inicio / Valor Producao / Cod Projeto"
- Tabela "Data planejada / Data real inicio / Cod Projeto"
- Grafico barras "Variacao Tempo Estimado x Real" (comparativo)
- Tabela "Em andamento" (Ambiente / Valor Producao / Cod Projeto)
- Card "Rejeicao" com Taxa e grafico

**Status Atual:**
- KPIs basicos OK
- Producoes por mes (OK)
- Tabela marceneiro (OK, mas sem Data Real Inicio)
- Capacidade producao (OK)
- Variacao tempo (tabela, precisa virar grafico)
- Indicadores qualidade (OK)

**Alteracoes Necessarias:**
- Converter variacao tempo de tabela para grafico de barras comparativo
- Adicionar tabela "Em andamento"
- Adicionar mini graficos nos KPIs
- Adicionar grafico barras horizontal no "Total Producao Fabrica"

---

### 6. RESUMO ESTOQUE

**Referencia Look Studio:**
- 2 Tabelas principais: "Resumo estoque" (Material/Tipo/Qtd atual/min/max), "Estoque e necessidade compra"
- Tabela "Data ultima compra" (Tipo/Ultima compra/Qtd Ult Compra)
- Grafico pizza "Estoque por Fornecedores"
- Grafico barras empilhadas "Tipo de Material"
- Destaque amarelo para itens abaixo do minimo

**Status Atual:**
- KPIs estatisticos (OK)
- Grafico barras por tipo (OK)
- Grafico valor por tipo (OK)
- Lista itens criticos (OK, mas precisa virar tabela completa)

**Alteracoes Necessarias:**
- Criar tabela "Resumo estoque" com todas colunas
- Criar tabela "Estoque e necessidade compra" com precos
- Criar tabela "Data ultima compra"
- Criar pizza "Estoque por Fornecedores"
- Criar grafico barras empilhadas "Tipo de Material"
- Adicionar destaque amarelo para itens criticos

---

### 7. RESUMO MONTAGEM

**Referencia Look Studio:**
- 3 graficos topo: Montadores (barras), Montagem por ambiente (barras empilhadas), Montagem por Projeto
- Tabelas: Montador/Status/Valor/Qtd Projeto, Ambiente/Valor/Qtd Projeto, Projeto/Movel/Valor/Qtd
- Grafico horizontal "Tempo estimado vs real"
- Pizza "Feedback cliente" (Excelente/Bom)
- Tabela "Desafios montagem" (Montador/Movel/Desafios)

**Status Atual:**
- Montagens por mes (OK)
- Montagens por ambiente (OK)
- Tabela montadores (OK)
- Feedback cliente pizza (OK)
- Tempo estimado barra progresso (precisa virar grafico horizontal)
- Tabela desafios (precisa adicionar colunas Montador/Movel)

**Alteracoes Necessarias:**
- Mudar "Tempo estimado" para grafico barras horizontais
- Adicionar grafico "Montagem por Projeto"
- Expandir tabela desafios com mais colunas

---

### 8. RESUMO FEEDBACK

**Referencia Look Studio:**
- KPI: Record Count
- 6 graficos pizza: Avaliacao vendedor, Equipe projetos, Fabricacao moveis, Montagem, Atendimento geral, Recomendacao servico
- Barra "Sugestao de melhoria"
- Tabela "Resumo respostas"

**Status Atual:**
- 4 KPIs estatisticos
- 6 graficos pizza (OK)
- Tabela resumo respostas (OK)
- Falta: Barra de sugestao de melhoria

**Alteracoes Necessarias:**
- Adicionar componente "Sugestao de melhoria" (barra visual)
- Ajustar layout para 3 colunas por linha nas pizzas
- Simplificar KPIs para apenas "Record Count"

---

### 9. RESUMO FORNECEDOR

**Referencia Look Studio:**
- Grafico barras empilhadas "Detalhes fornecedor" por mes
- Grafico linha multi-serie "Evolucao total compra"
- Tabela "Nome Fornecedor / Total compra / Quantidade / %Total" com total geral
- Tabela "Nome Fornecedor / Material / Custo medio por unid"
- Card "Prazos" (Record Count, Quantidade Adquirida) com tabela
- Card "Status" com pizza 100% Entregue e tabela

**Status Atual:**
- Pizza fornecedores por tipo (diferente)
- Linha evolucao compra (OK)
- Ranking fornecedores (OK)
- Material por fornecedor (OK)
- Detalhes fornecedor (OK)
- Falta: Prazos card, Status card com pizza

**Alteracoes Necessarias:**
- Converter pizza para barras empilhadas por mes
- Adicionar card "Prazos" com Record Count
- Adicionar card "Status" com pizza de status

---

## Componentes de UI Compartilhados a Criar

### 1. DashboardKPICard (Novo)
```
- Titulo
- Valor principal grande
- Valor secundario (percentual, meta)
- Barra de progresso (opcional)
- Mini grafico (opcional)
- Cor de destaque (verde positivo, vermelho negativo)
```

### 2. DashboardTable (Novo)
```
- Headers com ordenacao
- Paginacao (1-X/Y)
- Navegacao < >
- Destaque de linha (amarelo para alerta)
- Total geral no footer
```

### 3. DashboardFilter (Novo)
```
- Dropdown "Selecionar periodo"
- Dropdown dinamico (Vendedor, Ambiente, etc)
- Filtros sincronizados entre componentes
```

### 4. DashboardHeader (Novo)
```
- Titulo da aba com estilo Look Studio
- Area de filtros
```

---

## Paleta de Cores a Aplicar

```
Header tabelas: #1e3a5f (azul escuro marinho)
Fundo cards: #ffffff (branco)
Positivo/Meta atingida: #22c55e (verde)
Negativo/Alerta: #ef4444 (vermelho)
Destaque linha: #fef08a (amarelo claro)
Barras graficos: #f97316 (laranja), #1e3a5f (azul escuro)
Texto header tabela: #ffffff (branco)
```

---

## Ordem de Implementacao (Por Complexidade)

### Fase 1: Componentes Base (1-2 horas)
1. Criar componente DashboardKPICard
2. Criar componente DashboardTable com paginacao
3. Criar componente DashboardFilter
4. Aplicar paleta de cores globalmente

### Fase 2: Dashboards Simples (2-3 horas)
5. Atualizar DashboardFeedbacks (mais proximo do atual)
6. Atualizar DashboardFornecedores
7. Atualizar DashboardMontagem

### Fase 3: Dashboards Medios (3-4 horas)
8. Atualizar DashboardFluxoCaixa
9. Atualizar DashboardEstoque
10. Atualizar DashboardProducao

### Fase 4: Dashboards Complexos (4-5 horas)
11. Atualizar DashboardVendas (principal)
12. Atualizar DashboardLucro
13. Atualizar DashboardProjetos (mais complexo)

### Fase 5: Integracao e Polimento (1-2 horas)
14. Testar filtros funcionando entre componentes
15. Ajustar responsividade
16. Validar calculos e dados

---

## Secao Tecnica - Detalhes de Implementacao

### Estrutura de Pastas
```
src/components/dashboard/
  ui/
    DashboardKPICard.tsx
    DashboardTable.tsx
    DashboardFilter.tsx
    DashboardHeader.tsx
  DashboardVendas.tsx (atualizado)
  DashboardLucro.tsx (atualizado)
  ... (demais atualizados)
```

### Estado de Filtros (Context ou Props)
```typescript
interface DashboardFilters {
  periodo: { inicio: Date; fim: Date } | null;
  vendedor: string | null;
  ambiente: string | null;
  origemLead: string | null;
}
```

### Query com Filtros
```typescript
let query = supabase
  .from("projects")
  .select("*")
  .eq("user_id", userId);

if (filters.periodo) {
  query = query
    .gte("data_venda", filters.periodo.inicio.toISOString())
    .lte("data_venda", filters.periodo.fim.toISOString());
}
if (filters.vendedor) {
  query = query.eq("vendedor_responsavel", filters.vendedor);
}
```

### Paginacao de Tabelas
```typescript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;
const paginatedData = data.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

### Estilizacao Look Studio
```css
/* Headers de tabela */
.table-header-look {
  background-color: #1e3a5f;
  color: white;
}

/* Linha de alerta */
.row-alert {
  background-color: #fef08a;
}

/* KPI positivo */
.kpi-positive {
  color: #22c55e;
}

/* KPI negativo */
.kpi-negative {
  color: #ef4444;
}
```

---

## Resumo do Esforco

| Dashboard | Status Atual | Trabalho Necessario | Prioridade |
|-----------|-------------|---------------------|------------|
| Vendas | 60% | Alto | 1 |
| Lucro | 50% | Medio | 2 |
| Projetos | 40% | Alto | 3 |
| Fluxo Caixa | 70% | Medio | 4 |
| Producao | 60% | Medio | 5 |
| Estoque | 50% | Alto | 6 |
| Montagem | 65% | Medio | 7 |
| Feedback | 80% | Baixo | 8 |
| Fornecedor | 60% | Medio | 9 |

**Tempo Total Estimado: 12-16 horas de desenvolvimento**
