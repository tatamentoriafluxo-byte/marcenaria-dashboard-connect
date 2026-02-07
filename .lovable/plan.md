
## Plano: Correção dos 5 Bugs Identificados no Teste

### Diagnóstico Completo

| # | Problema | Causa Raiz | Severidade |
|---|----------|------------|------------|
| 1 | Total do Orçamento R$ 0,00 na listagem | O `valor_total` está correto no DB (R$ 450), mas na listagem exibe 0. **Investigação adicional necessária** - pode ser cache ou timing | Media |
| 2 | Página /novo-projeto em branco | Componente NovoProjeto.tsx existe e está completo. O problema pode ser erro de rota ou TypeScript | Alta |
| 3 | Conta a pagar não aparece na listagem | A query retornou vazia do DB. O INSERT pode estar falhando silenciosamente ou há problema de RLS | Media |
| 4 | Página de nova conta a receber em branco | O componente está dentro do mesmo arquivo ContasReceber.tsx via Dialog. Se não abre, pode ser erro de renderização | Alta |
| 5 | Dropdown de fornecedor vazio em Compras | Os fornecedores existem no DB (2 ativos), mas a query está filtrando por `ativo = true`. Verificar se o filtro está correto | Baixa |

---

### Correção 1: Total do Orçamento na Listagem

**Análise:**
- O banco de dados mostra `valor_total: 450` corretamente
- A listagem em `Orcamentos.tsx` (linha 213-217) exibe `orc.valor_total` diretamente
- O problema pode ser:
  1. Cache de react-query mostrando dados antigos
  2. O valor não estava sendo salvo corretamente antes (mas agora está)

**Verificação:**
- A query SELECT parece correta: `.select("*")` pega `valor_total`
- NovoOrcamento.tsx (linhas 194-195) agora calcula e salva os totais corretamente

**Ação:**
- Adicionar log para debug ou invalidar cache
- Verificar se o problema persiste após refresh da página

---

### Correção 2: Página /novo-projeto em Branco

**Análise:**
- O arquivo `NovoProjeto.tsx` está completo com 413 linhas
- Inclui Header, formulário, todos os campos
- O problema pode ser:
  1. Erro de importação não capturado
  2. O SelectItem com `value=""` (linha 353) pode causar erro no Radix

**Problema identificado (linha 352-353):**
```tsx
<SelectItem value="">Sem parceiro</SelectItem>
```

O `SelectItem` do Radix UI **não aceita `value=""`** - isso causa erro silencioso e quebra a renderização!

**Correção:**
```tsx
<SelectItem value="none">Sem parceiro</SelectItem>
```
E ajustar a lógica para tratar "none" como null.

---

### Correção 3: Conta a Pagar não Aparece na Listagem

**Análise:**
- A query do banco retornou array vazio `[]`
- O INSERT em `ContasPagar.tsx` (linhas 160-175) usa `fornecedor_id` como obrigatório
- **Problema:** O campo `fornecedor_id` não pode ser NULL na inserção, mas o formulário pode não estar enviando corretamente

**Verificação da FK:**
- A tabela `contas` tem `fornecedor_id` como nullable
- O JOIN na query (linha 119) usa `.eq("tipo", "PAGAR")` - está correto

**Possível causa:**
- O fornecedor selecionado no dropdown não está sendo capturado (mesmo problema do bug 5)

**Correção:**
- Garantir que o valor do Select está sendo capturado
- Adicionar tratamento de erro mais detalhado no INSERT

---

### Correção 4: Página de Nova Conta a Receber em Branco

**Análise:**
- ContasReceber.tsx tem 661 linhas
- Usa Dialog para abrir formulário de nova conta
- O Dialog está nas linhas 333-468

**Problema potencial:**
- O componente pode ter erro silencioso de renderização
- Verificar se todos os dados estão carregando (clientes, projetos)

**Possível causa:**
- Se `clientes` ou `projetos` retornarem erro, pode quebrar a renderização

**Correção:**
- Adicionar tratamento de erro na query
- Verificar se há erro de tipagem

---

### Correção 5: Dropdown de Fornecedor Vazio em Compras

**Análise:**
- Os fornecedores existem: Ferragens Brasil e Madeireira Silva & Cia (ambos `ativo: true`)
- A query em `Compras.tsx` (linhas 76-80) filtra `.eq('ativo', true)` - está correto
- O problema pode estar no componente Select ou no mapeamento

**Verificação da query:**
```tsx
supabase.from('fornecedores')
  .select('*')
  .eq('user_id', user.id)
  .eq('ativo', true)
```

**Problema identificado:**
- O `user.id` pode ser undefined no momento da query se a autenticação ainda não carregou
- A query depende de `[user]` no useEffect, que pode não re-executar

**Correção:**
- Adicionar verificação `if (!user?.id) return;` antes de cada query
- Adicionar loading state ou verificação

---

### Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `NovoProjeto.tsx` | Modificar | Corrigir SelectItem value="" para value="none" |
| `Compras.tsx` | Modificar | Adicionar verificação de user antes das queries |
| `ContasPagar.tsx` | Modificar | Adicionar validação de fornecedor_id antes do INSERT |
| `ContasReceber.tsx` | Modificar | Adicionar try-catch e loading states |
| `Orcamentos.tsx` | Verificar | Confirmar se o cache está atualizado |

---

### Detalhes Técnicos das Correções

#### NovoProjeto.tsx - Linha 352-361

**Antes:**
```tsx
<SelectItem value="">Sem parceiro</SelectItem>
{parceiros.map(p => (
  <SelectItem key={p.id} value={p.id}>
    {p.nome} ({p.percentual_comissao}%)
  </SelectItem>
))}
```

**Depois:**
```tsx
<SelectItem value="none">Sem parceiro</SelectItem>
{parceiros.map(p => (
  <SelectItem key={p.id} value={p.id}>
    {p.nome} ({p.percentual_comissao}%)
  </SelectItem>
))}
```

E ajustar a lógica de submit (linha 92):
```tsx
parceiro_id: formData.parceiro_id && formData.parceiro_id !== 'none' ? formData.parceiro_id : null,
```

#### Compras.tsx - Adicionar guards

```tsx
const loadData = async () => {
  if (!user?.id) return;  // Guard clause
  // ... resto do código
};
```

#### ContasPagar.tsx - Validação antes do INSERT

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validar fornecedor
  if (!formData.fornecedor_id) {
    toast({ title: "Selecione um fornecedor", variant: "destructive" });
    return;
  }
  // ... resto
};
```

---

### Ordem de Implementação

1. **NovoProjeto.tsx** - Corrigir SelectItem (causa erro fatal)
2. **Compras.tsx** - Adicionar guards de user
3. **ContasPagar.tsx** - Adicionar validação de fornecedor
4. **ContasReceber.tsx** - Melhorar tratamento de erros
5. **Verificar cache** - Testar Orcamentos após fixes

---

### Testes Recomendados Após Correções

1. Criar novo projeto em /novo-projeto
2. Criar nova compra selecionando fornecedor
3. Criar nova conta a pagar e verificar na listagem
4. Criar nova conta a receber via Dialog
5. Criar novo orçamento e verificar total na listagem
