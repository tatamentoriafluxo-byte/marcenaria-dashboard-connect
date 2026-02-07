

## Plano de Testes Estratégico - Ordem de Execução

### Lógica da Ordem

Os testes seguem a ordem de **dependência de dados**: primeiro cadastramos os dados base, depois testamos as funcionalidades que dependem deles.

```text
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 1: DADOS BASE (sem dependências)                        │
│  Materiais → Fornecedores → Funcionários → Vendedores           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 2: ENTIDADES COMERCIAIS (dependem da Camada 1)          │
│  Clientes → Parceiros → Catálogo de Preços                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 3: OPERAÇÕES (dependem das Camadas 1 e 2)               │
│  Projetos → Orçamentos → Compras → Estoque                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 4: FINANCEIRO (depende das Camadas anteriores)          │
│  Contas a Pagar → Contas a Receber → Cheques → Fluxo de Caixa   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 5: EXECUÇÃO E CONTROLE                                  │
│  Produção → Montagem → Feedbacks → Metas                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 6: IA E COMPARTILHAMENTO (Fase 3 - Nova!)               │
│  Análise de Foto → Templates → PDF → WhatsApp → Link Público    │
└─────────────────────────────────────────────────────────────────┘
```

---

## ROTEIRO DE TESTES DETALHADO

### FASE 1: DADOS BASE (5-10 min)

| # | Teste | Rota | O que verificar |
|---|-------|------|-----------------|
| 1.1 | Criar Material | /materiais | Nome, tipo, unidade, preço médio |
| 1.2 | Criar Fornecedor | /fornecedores | Nome, CNPJ, telefone, tipo de material |
| 1.3 | Criar Funcionário | /funcionarios | Nome, tipo, salário |
| 1.4 | Criar Vendedor | /vendedores | Nome, comissão %, meta mensal |

**Validação:** Todos devem aparecer nas respectivas listagens.

---

### FASE 2: ENTIDADES COMERCIAIS (5 min)

| # | Teste | Rota | O que verificar |
|---|-------|------|-----------------|
| 2.1 | Criar Cliente | /clientes | Nome, telefone, email, endereço |
| 2.2 | Criar Parceiro | /parceiros | Nome, categoria, % comissão |
| 2.3 | Criar Item no Catálogo | /catalogo-precos | Nome, código, preço, categoria |

**Validação:** Todos devem aparecer nas listagens e nos dropdowns das próximas etapas.

---

### FASE 3: OPERAÇÕES - BUGS CORRIGIDOS (10 min)

| # | Teste | Rota | O que verificar | Bug Corrigido |
|---|-------|------|-----------------|---------------|
| 3.1 | **Criar Projeto** | /novo-projeto | Página carrega, formulário funciona, projeto salva | Bug #2 - Página em branco |
| 3.2 | Criar Orçamento | /orcamentos → Novo | Item do catálogo aparece, total calcula corretamente | Bug #1 - Total R$ 0,00 |
| 3.3 | **Criar Compra** | /compras → Nova | Dropdown de fornecedor mostra opções, compra salva | Bug #5 - Dropdown vazio |
| 3.4 | Verificar Estoque | /estoque | Material aparece vinculado à compra |

**Validação Crítica:**
- Projeto deve aparecer na listagem de /projetos
- Orçamento deve mostrar total correto na listagem
- Compra deve ter fornecedor vinculado

---

### FASE 4: FINANCEIRO - BUGS CORRIGIDOS (10 min)

| # | Teste | Rota | O que verificar | Bug Corrigido |
|---|-------|------|-----------------|---------------|
| 4.1 | **Criar Conta a Pagar** | /contas-pagar → Nova | Dropdown de fornecedor funciona, conta salva E aparece na listagem | Bug #3 - Não aparecia |
| 4.2 | **Criar Conta a Receber** | /contas-receber → Nova | Dialog abre corretamente, dropdown de projeto funciona | Bug #4 - Página em branco |
| 4.3 | Criar Cheque | /cheques | Cheque cadastrado aparece na listagem |
| 4.4 | Verificar Fluxo de Caixa | /fluxo-caixa | Saldo atualizado com entradas/saídas |

**Validação Crítica:**
- Conta a pagar DEVE aparecer na listagem após cadastro
- Conta a receber DEVE salvar e aparecer na listagem
- Dropdown de projeto deve mostrar "Nenhum" como opção válida

---

### FASE 5: EXECUÇÃO E CONTROLE (5 min)

| # | Teste | Rota | O que verificar |
|---|-------|------|-----------------|
| 5.1 | Criar Produção | /producao | Vincular ao projeto criado |
| 5.2 | Criar Montagem | /montagem | Vincular ao projeto criado |
| 5.3 | Criar Feedback | /feedbacks | Projeto aparece no dropdown |
| 5.4 | Definir Meta | /metas | Meta mensal cadastrada |

---

### FASE 6: IA E COMPARTILHAMENTO - FASE 3 NOVA (15 min)

| # | Teste | Rota | O que verificar |
|---|-------|------|-----------------|
| 6.1 | Upload de Foto | /analise-foto | Foto carrega corretamente |
| 6.2 | Analisar Ambiente | /analise-foto | IA retorna móveis sugeridos com preços do catálogo |
| 6.3 | **Usar Template** | /analise-foto | Criar template de preferências, aplicar em nova análise |
| 6.4 | **Baixar Imagem** | /analise-foto | Botão de download funciona |
| 6.5 | **Compartilhar WhatsApp** | /analise-foto | Abre WhatsApp Web com mensagem pré-formatada |
| 6.6 | **Exportar PDF** | /analise-foto | PDF gerado com imagens e valores |
| 6.7 | **Gerar Link Público** | /analise-foto | Link copiado para área de transferência |
| 6.8 | **Abrir Link Público** | /analise-publica/:id | Página pública carrega sem login |
| 6.9 | Histórico de Análises | /analise-foto | Análises anteriores aparecem |
| 6.10 | **Comparar Análises** | /analise-foto | Selecionar 2 análises e comparar lado a lado |
| 6.11 | Adicionar ao Catálogo | /analise-foto → Visão Vendedor | Móvel sugerido vira item do catálogo |
| 6.12 | Criar Orçamento da IA | /analise-foto → Visão Vendedor | Orçamento criado com itens da análise |

---

## CHECKLIST DE VALIDAÇÃO FINAL

### Bugs Corrigidos
- [ ] /novo-projeto carrega e salva projetos
- [ ] Orçamentos mostram total correto na listagem
- [ ] Conta a pagar aparece na listagem após cadastro
- [ ] Conta a receber - dialog abre corretamente
- [ ] Dropdown de fornecedor funciona em Compras

### Funcionalidades Fase 3
- [ ] Templates de preferências funcionam
- [ ] Download de imagem funciona
- [ ] Compartilhamento WhatsApp abre link correto
- [ ] PDF exportado contém imagens e valores
- [ ] Link público gerado e copiado
- [ ] Página pública acessível sem login
- [ ] Comparação de análises lado a lado funciona

---

## DICA DE TESTE RÁPIDO

Se quiser testar apenas os **bugs corrigidos**, siga esta ordem mínima:

1. /novo-projeto → Criar projeto (Bug #2)
2. /compras → Nova compra com fornecedor (Bug #5)
3. /contas-pagar → Nova conta (Bug #3)
4. /contas-receber → Nova conta via Dialog (Bug #4)
5. /orcamentos → Verificar total na listagem (Bug #1)

Tempo estimado: 10-15 minutos

---

## DICA PARA FASE 3 (IA)

Para testar a Fase 3 completa:

1. Vá para /analise-foto
2. Faça upload de uma foto de ambiente (cozinha, sala, etc.)
3. Clique em "Analisar Ambiente"
4. Após análise, teste:
   - Na aba "Para o Cliente": WhatsApp, Download
   - Na aba "Para o Vendedor": PDF, Link Público, Adicionar ao Catálogo
5. Faça outra análise e teste "Comparar" no histórico

