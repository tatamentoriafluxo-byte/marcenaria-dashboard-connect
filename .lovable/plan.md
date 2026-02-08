
# PLANO DE TESTE COMPLETO - Sistema de Dashboards e Formulários

## Visão Geral
O sistema possui 4 áreas principais que precisam ser testadas em sequência lógica:
1. **Alertas de Dados Faltantes** (nova funcionalidade)
2. **Campos Corrigidos** (vendedor_responsavel como SELECT, metas com valor default)
3. **Dashboards com Gráficos** (9 abas principais)
4. **Fluxo de Dados End-to-End**

---

## FASE 1: TESTES DE ALERTAS E VALIDAÇÃO (Página Dashboard)

### Objetivo
Verificar que o sistema detecta e exibe alertas quando dados críticos estão faltando.

### O que Cadastrar
1. **Vendedor** (obrigatório) - vai na aba `/vendedores`
   - Nome: "João Silva"
   - Email: qualquer@email.com
   - Telefone: (11) 9999-9999
   - Comissão: 5%
   - Meta Mensal: (deixar em branco por enquanto)

### O que Testar - Alertas na Página Dashboard
- [ ] Acessar `/dashboard`
- [ ] **VERIFICAR**: Deve aparecer alert amarelo/vermelho "Nenhum vendedor cadastrado" → **não** deve aparecer (já cadastramos)
- [ ] **VERIFICAR**: Deve aparecer alert vermelho "Meta mensal não cadastrada para [mês atual]"
- [ ] **VERIFICAR**: Deve aparecer alert vermelho "Capacidade de produção não cadastrada para [mês atual]"
- [ ] **VERIFICAR**: Alert tem botão "Cadastrar" que leva para a página certa

### Esperado
Deve exibir 2 alertas vermelhos e 0 alertas azuis na parte superior do Dashboard.

---

## FASE 2: CADASTRO DE DADOS BASE (Ordem Recomendada)

### 1. Materiais (`/materiais`)
**O que cadastrar** (mínimo 3):
- Material 1:
  - Nome: "Madeira MDF 15mm"
  - Código: "MAD001"
  - Tipo: MADEIRA
  - Unidade: METRO_QUADRADO
  - Preço Médio: 120.00

- Material 2:
  - Nome: "Ferragem Dobradiça"
  - Tipo: FERRAGEM
  - Unidade: UNIDADE
  - Preço Médio: 25.50

- Material 3:
  - Nome: "Verniz Acabamento"
  - Tipo: ACABAMENTO
  - Unidade: LITRO
  - Preço Médio: 85.00

**O que testar**:
- [ ] Criar novo material com sucesso
- [ ] Listar materiais cadastrados
- [ ] Editar material existente
- [ ] Verificar que aparece na tabela

---

### 2. Fornecedores (`/fornecedores`)
**O que cadastrar** (mínimo 2):
- Fornecedor 1:
  - Nome: "Madeira Brasil LTDA"
  - CNPJ: 12.345.678/0001-90
  - Email: contato@madeira.com.br
  - Telefone: (11) 3333-3333
  - Tipo de Material: MADEIRA
  - Prazo Entrega: 7 dias

- Fornecedor 2:
  - Nome: "Ferragens ProMax"
  - CNPJ: 98.765.432/0001-10
  - Email: vendas@fermax.com.br
  - Telefone: (11) 4444-4444
  - Tipo de Material: FERRAGEM
  - Prazo Entrega: 5 dias

**O que testar**:
- [ ] Criar fornecedor com sucesso
- [ ] Listar fornecedores
- [ ] Verificar que permanecem ativos

---

### 3. Funcionários (`/funcionarios`)
**O que cadastrar** (mínimo 4):
- Marceneiro:
  - Nome: "Carlos Marceneiro"
  - Tipo: Marceneiro
  - Salário: 3500.00
  - Telefone: (11) 98888-8888

- Marceneiro 2:
  - Nome: "Pedro Madeira"
  - Tipo: Marceneiro
  - Salário: 3200.00

- Montador:
  - Nome: "Rafael Montador"
  - Tipo: Montador
  - Salário: 2800.00
  - Telefone: (11) 97777-7777

- Montador 2:
  - Nome: "Lucas Montagem"
  - Tipo: Montador
  - Salário: 2600.00

**O que testar**:
- [ ] Criar funcionários de diferentes tipos
- [ ] Verificar que aparecem na lista

---

### 4. Metas Mensais (`/metas`) - CORRIGE O ALERTA
**O que cadastrar**:
- Meta Geral (Mês Atual):
  - Mês: [mês atual, ex: 2026-02]
  - Vendedor: "Geral" (padrão)
  - Meta Faturamento: 50000.00
  - Meta Lucro: 15000.00
  - Meta Projetos: 5

**O que testar**:
- [ ] Criar meta para mês atual com sucesso
- [ ] **VERIFICAR**: Voltar ao Dashboard → alerta de "Meta mensal" desaparece
- [ ] Campo "Mês" funciona corretamente
- [ ] Campo "Vendedor" agora é um SELECT dropdown

---

### 5. Capacidade de Produção (`/capacidade-producao`) - CORRIGE O ALERTA
**O que cadastrar**:
- Capacidade Mês Atual:
  - Mês: [mês atual]
  - Capacidade Mensal (Projetos): 10
  - Capacidade Mensal (Horas): 200
  - Observações: "Capacidade normal do mês"

**O que testar**:
- [ ] Criar capacidade com sucesso
- [ ] **VERIFICAR**: Voltar ao Dashboard → alerta de "Capacidade de produção" desaparece
- [ ] Ambos os alertas foram corrigidos

---

## FASE 3: CADASTRO DE DADOS COMERCIAIS

### 1. Novo Projeto (`/novo-projeto`) - TESTE DO CAMPO VENDEDOR CORRIGIDO
**O que cadastrar** (2 projetos):

**Projeto 1**:
- Código: "PRJ001"
- Data Contato: [hoje]
- **Vendedor Responsável**: "João Silva" (SELECT dropdown - VERIFICAR que é dropdown)
- Nome Cliente: "Cliente Teste 1"
- Telefone: (11) 91111-1111
- Origem Lead: LOJA
- Ambiente: SALA
- Valor Orçamento: 5000.00
- Custo Materiais: 1500.00
- Custo Mão de Obra: 800.00
- Outros Custos: 200.00
- Status: ORCAMENTO
- Data Venda: [hoje]
- Valor Venda: 5500.00
- Prazo Entrega: 30 dias
- Data Entrega: [+30 dias]
- **Visualizado pelo Cliente**: SIM (checkbox)
- **Preencheu Formulário**: SIM (checkbox)

**Projeto 2**:
- Código: "PRJ002"
- Data Contato: [5 dias atrás]
- Vendedor Responsável: "João Silva"
- Nome Cliente: "Cliente Teste 2"
- Telefone: (11) 92222-2222
- Origem Lead: INDICACAO
- Ambiente: QUARTO
- Valor Orçamento: 8000.00
- Custo Materiais: 2500.00
- Custo Mão de Obra: 1500.00
- Outros Custos: 300.00
- Status: ORCAMENTO
- Visualizado pelo Cliente: NÃO
- Preencheu Formulário: NÃO

**O que testar**:
- [ ] Campo "Vendedor Responsável" é um SELECT dropdown (não input texto)
- [ ] Dropdown mostra "João Silva" como opção
- [ ] Criar projeto 1 com sucesso
- [ ] Criar projeto 2 com sucesso
- [ ] Campos de data funcionam corretamente
- [ ] Checkboxes "Visualizado" e "Preencheu Formulário" estão bem visíveis
- [ ] Valores são salvos corretamente

---

### 2. Estoque (`/estoque`)
**O que cadastrar** (2 itens):
- Item 1:
  - Material: "Madeira MDF 15mm"
  - Quantidade Atual: 100
  - Quantidade Mínima: 20
  - Quantidade Máxima: 200
  - Fornecedor Principal: "Madeira Brasil LTDA"
  - Preço Médio Compra: 120.00

- Item 2:
  - Material: "Ferragem Dobradiça"
  - Quantidade Atual: 50
  - Quantidade Mínima: 10
  - Quantidade Máxima: 100
  - Fornecedor Principal: "Ferragens ProMax"
  - Preço Médio Compra: 25.50

**O que testar**:
- [ ] Criar estoque com sucesso
- [ ] Verificar que material e fornecedor aparecem nos dropdowns

---

## FASE 4: TESTES DOS DASHBOARDS (9 Abas)

Depois de cadastrar todos os dados acima, acessar `/dashboard` e testar cada aba:

### 1. Aba "Alertas"
- [ ] **Teste**: Deve estar VAZIO (nenhum alerta) após preencher metas e capacidade
- [ ] Se aparecer algum alerta, clicar no botão e corrigir

### 2. Aba "Score IA"
- [ ] Carrega sem erros
- [ ] Se houver dados, mostra score dos projetos

### 3. Aba "Orçamentos"
- [ ] Carrega gráfico de orçamentos
- [ ] Se houver orcamentos, mostra dados

### 4. Aba "Vendas"
- [ ] **Gráfico "Total Vendas"**: Deve aparecer valor 5500 (projeto 1) + 8000 (projeto 2) = 13500
- [ ] **KPI "Meta Mensal"**: Deve mostrar 50000
- [ ] **KPI "% Atingido"**: Deve mostrar 27% (13500/50000)
- [ ] **Ranking Vendedores**: Deve aparecer "João Silva" com valor
- [ ] **Ranking Clientes**: Deve listar os 2 clientes
- [ ] **Vendas por Ambiente**: Deve separar SALA e QUARTO
- [ ] Todos os gráficos renderizam sem erros

### 5. Aba "Lucro"
- [ ] **Total Lucro**: Deve calcular (5500-1500-800-200) + (8000-2500-1500-300) = 6400
- [ ] **Meta Lucro**: Deve mostrar 15000
- [ ] **% Atingido**: Deve mostrar ~43% (6400/15000)
- [ ] **Lucro por Ambiente**: Gráfico renderiza
- [ ] **Lucro por Vendedor**: Mostra "João Silva"

### 6. Aba "Projetos"
- [ ] **Total Projetos**: 2
- [ ] **Total Visualizações**: 1 (apenas projeto 1 foi visualizado)
- [ ] **Taxa Conversão**: 100% (2 de 2 tiveram data_venda)
- [ ] **Origem Lead / Status**: Mostra 1 LOJA, 1 INDICACAO
- [ ] **Tempo Venda-Contato**: Gráfico mostra dias entre contato e venda
- [ ] **Tempo Venda-Entrega**: Gráfico mostra dias entre venda e entrega

### 7. Aba "Estoque"
- [ ] **Total Valor**: Mostra valor total do estoque
- [ ] **Itens em Estoque**: Mostra 2 itens
- [ ] **Gráfico Quantidade**: Mostra barras para cada material
- [ ] **Itens Críticos**: Se quantidade < mínima, aparece em destaque (atualmente ambos OK)

### 8. Aba "Produção"
- [ ] Carrega sem erros (pode estar vazio se não houver producao cadastrada)

### 9. Aba "Montagem"
- [ ] Carrega sem erros (pode estar vazio se não houver montagem)

---

## FASE 5: TESTE DO FLUXO COMPLETO (Relacionamento)

### Objetivo
Verificar que mudanças em um formulário refletem nos dashboards corretamente.

### Teste 1: Adicionar Novo Projeto
1. Ir para `/novo-projeto`
2. Criar Projeto 3 com valor_venda = 10000, vendedor = "João Silva"
3. **Verificar**: Aba "Vendas" atualiza o total para 23500 (13500 + 10000)
4. **Verificar**: Aba "Projetos" mostra "Total Projetos: 3"

### Teste 2: Atualizar Meta
1. Ir para `/metas`
2. Editar a meta geral para 60000
3. **Verificar**: Aba "Vendas" atualiza o KPI "Meta Mensal" para 60000
4. **Verificar**: % Atingido muda para ~39% (23500/60000)

### Teste 3: Criar Novo Vendedor
1. Ir para `/vendedores`
2. Criar "Maria Vendedora"
3. Ir para `/novo-projeto`
4. **Verificar**: "Maria Vendedora" aparece no dropdown de Vendedor Responsável

---

## RESUMO DO QUE TESTAR

| Item | Tipo | Status Esperado |
|------|------|-----------------|
| Dashboard Alertas | Carregamento | Sem alertas após dados preenchidos |
| Dropdown Vendedor em Projeto | UI/UX | Deve ser SELECT, não INPUT |
| Metas Campo Vendedor | UI/UX | Deve ser SELECT com opção "Geral" |
| Gráfico Total Vendas | Cálculo | 23500+ após 3 projetos |
| Gráfico Meta % | Cálculo | % correto baseado em meta |
| Gráfico Lucro | Cálculo | Subtração custos correta |
| Ranking Vendedores | Listagem | Mostra "João Silva" |
| Tempo entre datas | Gráfico | Calcula corretamente dias |
| Estoque Crítico | Destaque | Mostra itens < mín |
| Navegação Alertas | Botão | Leva para página correta |

---

## Informações Técnicas para Debug

Se algum teste falhar, procure por:

1. **Dados não aparecem no dashboard?**
   - Verificar console (F12) para erros
   - Verificar se user_id está sendo salvo corretamente
   - Verificar se RLS policies estão permitindo SELECT

2. **Gráficos vazios?**
   - Pode ser limite de 1000 registros
   - Verificar se dados passam no filtro de período

3. **Dropdown não funciona?**
   - Verificar se dados estão carregando na aba Vendedores
   - Verificar se estão marcados como "ativo: true"

4. **Alertas não desaparecem?**
   - Fazer refresh na página (F5)
   - Verificar data do mes_referencia (YYYY-MM-01 format)

