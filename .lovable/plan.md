

# Plano de Correção - 3 Bugs Identificados

## Diagnóstico Técnico

Após análise do código e dos dados no banco, identifiquei as seguintes causas raiz:

---

## BUG 1: Alertas de Meta/Capacidade Não Desaparecem

### Causa Raiz
O hook `useMissingDataAlerts.ts` usa uma query incorreta para verificar se existe meta/capacidade no mês atual:

```typescript
// Código atual (ERRADO)
const currentMonth = new Date().toISOString().slice(0, 7); // "2026-02"
.gte('mes_referencia', `${currentMonth}-01`)   // "2026-02-01"
.lt('mes_referencia', `${currentMonth}-32`)    // "2026-02-32" (data inválida!)
```

O problema é que `2026-02-32` é uma data inválida e causa comportamento inconsistente no Supabase.

### Dados no Banco
- Meta existe: `mes_referencia = 2026-02-01`
- Capacidade existe: `mes_referencia = 2026-02-01`

### Solução
Usar comparação exata com `.eq()` em vez de range:

```typescript
const mesAtual = new Date().toISOString().slice(0, 7) + '-01'; // "2026-02-01"
.eq('mes_referencia', mesAtual)
```

---

## BUG 2: Vendas Mostram R$ 0 em vez de R$ 5.500

### Causa Raiz
O `DashboardVendas.tsx` filtra vendas apenas com status `CONVERTIDO` ou `ENTREGUE`:

```typescript
// Linha 128-130
const vendasConcluidas = projectsData.filter(
  (p) => (p.status === "CONVERTIDO" || p.status === "ENTREGUE") && p.valor_venda
);
```

### Dados no Banco
- PRJ001: `status = "ORCAMENTO"`, `valor_venda = 5500.00`
- PRJ002: `status = "ORCAMENTO"`, `valor_venda = null`

Os projetos estão com status `ORCAMENTO`, não `CONVERTIDO`/`ENTREGUE`.

### Solução
Adicionar lógica para considerar projetos com `valor_venda` preenchido OU projetos com status convertido/entregue. Alternativamente, melhorar a documentação para o usuário entender que precisa mudar o status.

**Opção A (Recomendada)**: Incluir projetos que tenham `valor_venda` preenchido, independente do status:
```typescript
const vendasConcluidas = projectsData.filter(
  (p) => p.valor_venda && p.valor_venda > 0
);
```

**Opção B**: Manter a lógica atual mas orientar usuário a mudar status para CONVERTIDO.

---

## BUG 3: Taxa de Conversão Mostra 0%

### Causa Raiz
O `DashboardProjetos.tsx` calcula conversão baseado apenas em `status === "ENTREGUE"`:

```typescript
// Linha 146
const totalConvertido = data.filter((p: any) => p.status === "ENTREGUE").length;
```

### Dados no Banco
- Todos os projetos estão com `status = "ORCAMENTO"`, nenhum com `ENTREGUE`.

### Solução
Incluir `CONVERTIDO` no cálculo de conversão (além de `ENTREGUE`):

```typescript
const totalConvertido = data.filter(
  (p: any) => p.status === "ENTREGUE" || p.status === "CONVERTIDO"
).length;
```

---

## Problema Adicional: data_venda = null

### Observação
Os projetos PRJ001 e PRJ002 têm `data_venda = null`, o que impede que apareçam nos gráficos de vendas (que filtram por data_venda).

O campo `data_venda` deveria ter sido preenchido durante o cadastro.

### Solução
1. Atualizar os projetos existentes com data_venda
2. Tornar o campo obrigatório quando status mudar para CONVERTIDO

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/hooks/useMissingDataAlerts.ts` | Corrigir query de `.gte/.lt` para `.eq` |
| `src/components/dashboard/DashboardVendas.tsx` | Incluir projetos com valor_venda > 0 |
| `src/components/dashboard/DashboardProjetos.tsx` | Incluir CONVERTIDO no cálculo de conversão |

---

## Implementação

### Etapa 1: Corrigir useMissingDataAlerts.ts
- Linhas 29-35: Trocar query de metas
- Linhas 48-54: Trocar query de capacidade

### Etapa 2: Corrigir DashboardVendas.tsx
- Linha 128-130: Alterar filtro de vendasConcluidas

### Etapa 3: Corrigir DashboardProjetos.tsx
- Linha 146: Adicionar || p.status === "CONVERTIDO"

---

## Resultado Esperado Após Correções

| Métrica | Antes | Depois |
|---------|-------|--------|
| Alerta Meta | Aparece | Desaparece |
| Alerta Capacidade | Aparece | Desaparece |
| Total Vendas | R$ 0 | R$ 5.500 |
| Taxa Conversão | 0% | Calculada corretamente |

