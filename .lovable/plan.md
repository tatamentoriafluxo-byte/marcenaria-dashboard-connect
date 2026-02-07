
## Plano: Fase 3 - Melhorias Avançadas de Compartilhamento e Produtividade

### Resumo das 5 Funcionalidades

| # | Funcionalidade | Descrição |
|---|----------------|-----------|
| 1 | Compartilhamento WhatsApp | Enviar simulação + valor direto para o cliente |
| 2 | Exportar PDF Profissional | Relatório com imagens, móveis e preços |
| 3 | Comparação de Análises | Visualizar lado a lado diferentes simulações |
| 4 | Templates de Preferências | Salvar estilos/budgets para reutilizar |
| 5 | Link Compartilhável | Página pública para cliente ver análise |

---

### 1. Compartilhamento WhatsApp

**Objetivo:** Permitir enviar a simulação diretamente para o cliente via WhatsApp Web.

**Fluxo:**
```text
┌────────────────────────────────────────────┐
│  [📥 Baixar] [📤 Compartilhar] [💬 WhatsApp]│
└────────────────────────────────────────────┘
                     │
                     ▼
     ┌───────────────────────────────────┐
     │  Olá! Segue a simulação do seu   │
     │  ambiente:                        │
     │                                   │
     │  🏠 Tipo: Cozinha                 │
     │  💰 Valor estimado: R$ 15.500     │
     │                                   │
     │  🔗 [link da imagem]              │
     └───────────────────────────────────┘
```

**Mudanças Técnicas:**
- `VisaoCliente.tsx`: Adicionar botão WhatsApp que abre `https://wa.me/?text=...` com mensagem pré-formatada
- Incluir valor estimado e link da imagem simulada

---

### 2. Exportar PDF Profissional

**Objetivo:** Gerar um documento PDF bonito e profissional para apresentar ao cliente.

**Conteúdo do PDF:**
- Logo da marcenaria (opcional, se houver no profile)
- Foto original + simulação lado a lado
- Lista de móveis sugeridos com preços
- Valor total estimado
- Data da análise
- Observações

**Implementação:**
- Nova biblioteca: `@react-pdf/renderer` (ou `html2pdf.js` para simplicidade)
- Novo componente: `src/components/ia/ExportarPDF.tsx`
- Botão na `VisaoVendedor.tsx`: "Exportar PDF"

**Layout do PDF:**
```text
┌─────────────────────────────────────────────┐
│  MARCENARIA XYZ                             │
│  Proposta de Projeto #001                   │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐         │
│  │ Foto Original│  │  Simulação   │         │
│  └──────────────┘  └──────────────┘         │
├─────────────────────────────────────────────┤
│  MÓVEIS SUGERIDOS                           │
│  ─────────────────────────────────────────  │
│  • Armário Superior     R$ 1.200,00         │
│  • Bancada Ilha         R$ 3.500,00         │
│  • Painel TV            R$ 800,00           │
├─────────────────────────────────────────────┤
│  VALOR TOTAL: R$ 5.500,00                   │
├─────────────────────────────────────────────┤
│  Data: 07/02/2026                           │
└─────────────────────────────────────────────┘
```

---

### 3. Comparação de Análises

**Objetivo:** Quando o vendedor faz múltiplas análises do mesmo ambiente (ex: com diferentes referências), poder comparar lado a lado.

**Implementação:**
- Novo componente: `src/components/ia/ComparacaoAnalises.tsx`
- Usuário seleciona 2 análises do histórico
- Tela dividida mostrando:
  - Imagem simulada A vs B
  - Valor A vs B
  - Diferença de móveis

**UI:**
```text
┌─────────────────────────────────────────────────────┐
│  COMPARAÇÃO DE ANÁLISES                             │
├────────────────────────┬────────────────────────────┤
│  Análise 1 (05/02)     │  Análise 2 (07/02)         │
│  ┌──────────────────┐  │  ┌──────────────────────┐  │
│  │   Simulação A    │  │  │    Simulação B       │  │
│  └──────────────────┘  │  └──────────────────────┘  │
│                        │                            │
│  💰 R$ 12.000,00       │  💰 R$ 15.500,00           │
│  📦 5 móveis           │  📦 7 móveis               │
├────────────────────────┴────────────────────────────┤
│  Diferença: +R$ 3.500 | +2 móveis                   │
└─────────────────────────────────────────────────────┘
```

---

### 4. Templates de Preferências

**Objetivo:** Salvar configurações de estilo frequentes para reutilizar em análises futuras.

**Exemplos de templates:**
- "Moderno Clean" - Cores claras, linhas retas, MDF lacado
- "Rústico" - Madeira natural, tons terrosos
- "Alto Padrão" - Materiais premium, detalhes em vidro

**Implementação:**
- Nova tabela: `templates_preferencias` (id, user_id, nome, preferencias_texto, created_at)
- Novo componente: `src/components/ia/TemplatesPreferencias.tsx`
- No campo de preferências, dropdown para "Usar template" ou "Salvar como template"

**UI:**
```text
┌───────────────────────────────────────────────┐
│  Preferências do Cliente                      │
│  ┌─────────────────────────────────────────┐  │
│  │ [▼ Selecionar Template]                 │  │
│  │ ─────────────────────────────────────── │  │
│  │ • Moderno Clean                         │  │
│  │ • Rústico                               │  │
│  │ • Alto Padrão                           │  │
│  │ + Criar novo template...                │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │ Prefere cores claras, linhas retas...  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  [💾 Salvar como Template]                    │
└───────────────────────────────────────────────┘
```

---

### 5. Link Compartilhável (Página Pública)

**Objetivo:** Gerar um link único que o cliente pode abrir para ver a simulação, mesmo sem ter conta no sistema.

**Implementação:**
- Adicionar coluna `link_publico` (UUID único) na tabela `analises_ambiente`
- Nova rota: `/analise-publica/:linkId`
- Nova página: `src/pages/AnalisePublica.tsx`
- RLS policy especial para permitir leitura anônima baseada no `link_publico`

**Fluxo:**
```text
Vendedor clica "Gerar Link"
         │
         ▼
Sistema gera UUID único
         │
         ▼
Link: lovable.app/analise-publica/abc123
         │
         ▼
Cliente abre e vê:
  ┌───────────────────────────────────────┐
  │  SIMULAÇÃO DO SEU AMBIENTE            │
  │  ┌─────────────────────────────────┐  │
  │  │      [Imagem Simulada]          │  │
  │  └─────────────────────────────────┘  │
  │                                       │
  │  💰 Valor Estimado: R$ 15.500,00      │
  │                                       │
  │  📦 7 móveis sugeridos                │
  │                                       │
  │  [💬 Falar com o Vendedor]            │
  └───────────────────────────────────────┘
```

---

### Ordem de Implementação Sugerida

| Prioridade | Funcionalidade | Complexidade | Dependências |
|------------|----------------|--------------|--------------|
| 1 | WhatsApp | Baixa | Nenhuma |
| 2 | Exportar PDF | Média | Nova biblioteca |
| 3 | Link Compartilhável | Média | Migration + nova página |
| 4 | Templates | Média | Migration + novo componente |
| 5 | Comparação | Média | Depende do histórico |

---

### Resumo de Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `VisaoCliente.tsx` | Modificar | Adicionar botão WhatsApp |
| `VisaoVendedor.tsx` | Modificar | Adicionar botão Exportar PDF + Gerar Link |
| `ExportarPDF.tsx` | Criar | Componente de geração de PDF |
| `ComparacaoAnalises.tsx` | Criar | Tela de comparação lado a lado |
| `TemplatesPreferencias.tsx` | Criar | Gerenciador de templates |
| `AnalisePublica.tsx` | Criar | Página pública para clientes |
| `AnaliseFotoAmbiente.tsx` | Modificar | Integrar seletor de templates |
| `HistoricoAnalises.tsx` | Modificar | Adicionar checkbox para comparação |
| `App.tsx` | Modificar | Nova rota /analise-publica/:id |
| Migration SQL | Criar | templates_preferencias + coluna link_publico |

---

### Quer que eu implemente todas as 5 funcionalidades de uma vez, ou prefere fazer em partes?

Posso começar com as 3 primeiras (WhatsApp, PDF, Link Compartilhável) que são as mais impactantes para o dia a dia do vendedor, e depois seguir com Templates e Comparação.
