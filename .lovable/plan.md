

## Plano: Melhorias na Análise de Foto com IA

### Resumo das Melhorias

1. **Valor Estimado Baseado no Catálogo** - Usar preços reais do catálogo do usuário
2. **Botão de Baixar Imagem** - Além de compartilhar, permitir download direto
3. **Adicionar Móveis ao Catálogo** - Botão para cadastrar automaticamente todos os móveis sugeridos
4. **Melhorias Extras** - Funcionalidades adicionais que agregariam valor

---

### 1. Valor Estimado Baseado no Catálogo

**Problema Atual:**
A IA estima preços de forma genérica, sem considerar os valores reais cadastrados no catálogo de cada marcenaria.

**Solução:**
Na Edge Function, quando houver correspondência entre um móvel sugerido e um item do catálogo, usar o `preco_base` real do catálogo. Quando não houver correspondência, manter estimativa da IA mas indicar que é "estimado".

```text
┌──────────────────────────────────────────────────┐
│ Armário Superior Cozinha                         │
│ Tipo: armário | MDF lacado branco                │
│                                                  │
│ ✅ Corresponde: "Armário Aéreo 60cm" do catálogo │
│                                                  │
│ 💲 R$ 1.200,00 (preço do catálogo)               │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Prateleira Decorativa                            │
│ Tipo: prateleira | MDP melamínico                │
│                                                  │
│ ⚠️ Sem correspondência no catálogo               │
│                                                  │
│ 💲 R$ 350,00 (estimativa IA)                     │
└──────────────────────────────────────────────────┘
```

**Mudanças Técnicas:**
- `analisar-foto-ambiente/index.ts`: Ao processar sugestões, verificar correspondências com catálogo e substituir `preco_estimado` pelo `preco_base` real quando houver match
- `VisaoVendedor.tsx`: Indicar visualmente se o preço é do catálogo ou estimativa

---

### 2. Botão de Baixar Imagem

**Solução:**
Adicionar botão "Baixar Imagem" ao lado do "Compartilhar Simulação" na Visão Cliente.

```text
┌────────────────────────────────────────┐
│  🖼️ [Imagem Simulada]                  │
│                                        │
│  ┌──────────────┐ ┌──────────────────┐ │
│  │ 📥 Baixar    │ │ 📤 Compartilhar  │ │
│  └──────────────┘ └──────────────────┘ │
└────────────────────────────────────────┘
```

**Mudanças Técnicas:**
- `VisaoCliente.tsx`: Adicionar função `handleBaixar` que faz fetch da imagem e força download com nome amigável (ex: `simulacao_cozinha_2026-02-07.png`)

---

### 3. Adicionar Todos ao Catálogo

**Problema:**
Após a análise, o vendedor precisa cadastrar cada móvel sugerido manualmente no catálogo.

**Solução:**
Botão "Adicionar Todos ao Catálogo" na Visão Vendedor que cadastra automaticamente todos os móveis sugeridos que ainda não existem no catálogo.

```text
┌─────────────────────────────────────────────────────┐
│ 📦 Móveis Sugeridos                                 │
│                                                     │
│ [Armário Superior] [Bancada Ilha] [Painel TV]       │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ➕ Adicionar Todos ao Catálogo (3 itens)        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Os itens que já existem no catálogo serão ignorados │
└─────────────────────────────────────────────────────┘
```

**Fluxo:**
1. Usuário clica no botão
2. Sistema filtra móveis que já têm correspondência no catálogo (não duplicar)
3. Insere os novos no `catalogo_itens` com categoria mapeada
4. Exibe toast de sucesso com quantidade de itens adicionados

**Mudanças Técnicas:**
- `VisaoVendedor.tsx`: Adicionar botão e lógica de inserção em batch
- Mapeamento de tipo do móvel para categoria do catálogo:
  - "armário" -> "ARMARIO"
  - "bancada" -> "BALCAO"
  - "painel" -> "OUTROS"
  - etc.

---

### 4. Melhorias Extras Identificadas

**4.1 Seleção Individual de Móveis**
Permitir ao usuário marcar/desmarcar quais móveis quer adicionar ao catálogo, ao invés de adicionar todos.

```text
☑️ Armário Superior - R$ 1.200,00
☑️ Bancada Ilha - R$ 3.500,00  
☐ Painel TV - R$ 800,00 (já existe)

[Adicionar Selecionados ao Catálogo]
```

**4.2 Gerar Orçamento a Partir da Análise**
Botão "Criar Orçamento" que redireciona para `/novo-orcamento` com os itens já pré-preenchidos.

```text
┌─────────────────────────────────────────┐
│ 💰 Valor Total: R$ 15.500,00            │
│                                         │
│ [📋 Criar Orçamento com Esses Itens]    │
└─────────────────────────────────────────┘
```

**4.3 Histórico de Análises**
Salvar cada análise em uma nova tabela `analises_ambiente` para consultar depois, incluindo:
- Foto original
- Foto de referência (se houver)
- Resultado JSON da análise
- Imagem simulada
- Data/hora

---

### Resumo de Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `analisar-foto-ambiente/index.ts` | Calcular valor com preços reais do catálogo |
| `VisaoCliente.tsx` | Adicionar botão de download da imagem |
| `VisaoVendedor.tsx` | Botão "Adicionar ao Catálogo" + checkboxes + indicador de preço (catálogo vs estimativa) |
| `AnaliseFotoAmbiente.tsx` | Passar `user_id` e refetch do catálogo após adição |

---

### Priorização Sugerida

**Fase 1 (Essencial):**
- Valor baseado no catálogo
- Botão baixar imagem
- Adicionar todos ao catálogo

**Fase 2 (Aprimoramentos):**
- Seleção individual de móveis
- Botão criar orçamento
- Histórico de análises

