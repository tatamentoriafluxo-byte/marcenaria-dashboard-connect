
# Visao Geral: Dados do Dashboard vs Formularios de Entrada

## Resumo Executivo

Apos analisar todos os 9 dashboards e suas fontes de dados, identifiquei que a maioria dos dados esta corretamente mapeada para formularios de entrada. Porem, existem alguns **GAPS** onde o dashboard puxa dados que o usuario pode nao ter percebido que precisa preencher.

---

## 1. DASHBOARD VENDAS

### Dados que o Dashboard Puxa:
| Dado | Tabela Origem | Formulario de Entrada |
|------|---------------|----------------------|
| Total Vendas | `projects.valor_venda` | Novo Projeto |
| Total Orcamentos | `orcamentos.valor_total` | Novo Orcamento |
| Meta Mensal | `metas.meta_faturamento` | Metas |
| Ranking Vendedores | `projects.vendedor_responsavel` | Novo Projeto |
| Ranking Clientes | `projects.nome_cliente` | Novo Projeto |
| Vendas por Ambiente | `projects.ambiente` | Novo Projeto |

### Status: OK - Todos os dados tem formulario

---

## 2. DASHBOARD LUCRO

### Dados que o Dashboard Puxa:
| Dado | Tabela Origem | Formulario de Entrada |
|------|---------------|----------------------|
| Total Lucro | `resumo_projetos.lucro` (view calculada) | Automatico |
| Meta Lucro | `metas.meta_lucro` | Metas |
| Lucro por Ambiente | `resumo_projetos.ambiente` | Novo Projeto |
| Lucro por Vendedor | `resumo_projetos.vendedor_nome` | Novo Projeto |

### Status: OK - Porem depende de:
- Usuario preencher custos no projeto (custo_materiais, custo_mao_obra, outros_custos)
- Usuario cadastrar metas de lucro

---

## 3. DASHBOARD PROJETOS

### Dados que o Dashboard Puxa:
| Dado | Tabela Origem | Formulario de Entrada |
|------|---------------|----------------------|
| Total Projetos | `resumo_projetos` | Novo Projeto |
| Visualizado pelo Cliente | `projects.visualizado_cliente` | Novo Projeto |
| Origem Lead | `projects.origem_lead` | Novo Projeto |
| Tempo Venda-Contato | `projects.data_contato`, `projects.data_venda` | Novo Projeto |
| Tempo Venda-Entrega | `projects.data_venda`, `projects.data_entrega` | Novo Projeto |

### Status: OK - Mas usuario precisa:
- Marcar o checkbox "Visualizado pelo cliente"
- Preencher Data da Venda e Data de Entrega para graficos de tempo

---

## 4. DASHBOARD FLUXO DE CAIXA

### Dados que o Dashboard Puxa:
| Dado | Tabela Origem | Formulario de Entrada |
|------|---------------|----------------------|
| Total Entradas | `transacoes_financeiras` (tipo=RECEITA) | Fluxo de Caixa |
| Total Saidas | `transacoes_financeiras` (tipo=DESPESA) | Fluxo de Caixa |
| Por Categoria | `transacoes_financeiras.categoria` | Fluxo de Caixa |
| Por Subcategoria | `transacoes_financeiras.subcategoria` | Fluxo de Caixa |
| Forma Pagamento | `transacoes_financeiras.forma_pagamento` | Fluxo de Caixa |
| Numero NF | `transacoes_financeiras.numero_nf` | Fluxo de Caixa |

### Status: OK - Todos os campos tem entrada

---

## 5. DASHBOARD PRODUCAO

### Dados que o Dashboard Puxa:
| Dado | Tabela Origem | Formulario de Entrada |
|------|---------------|----------------------|
| Total Producoes | `producao` | Producao |
| Por Marceneiro | `producao.marceneiro_id` + `funcionarios` | Producao + Funcionarios |
| Tempo Estimado | `producao.tempo_estimado` | Producao |
| Tempo Real | `producao.tempo_real` | Producao |
| Taxa Rejeicao | `producao.taxa_rejeicao` | Producao |
| Capacidade Producao | `capacidade_producao` | Capacidade Producao |

### Status: OK - Porem:
- Usuario precisa cadastrar funcionarios do tipo "Marceneiro" primeiro
- Usuario precisa cadastrar Capacidade de Producao mensalmente

### DEPENDENCIAS:
1. **Funcionarios** (tipo=Marceneiro) devem existir para aparecer no dropdown
2. **Capacidade Producao** deve ser preenchida mensalmente para o grafico funcionar

---

## 6. DASHBOARD ESTOQUE

### Dados que o Dashboard Puxa:
| Dado | Tabela Origem | Formulario de Entrada |
|------|---------------|----------------------|
| Quantidade Atual | `estoque.quantidade_atual` | Estoque |
| Quantidade Minima | `estoque.quantidade_minima` | Estoque |
| Quantidade Maxima | `estoque.quantidade_maxima` | Estoque |
| Preco Medio | `estoque.preco_medio_compra` | Estoque |
| Data Ultima Compra | `estoque.data_ultima_compra` | Estoque |
| Por Tipo Material | `materiais.tipo` | Materiais |
| Por Fornecedor | `fornecedores` | Estoque (fornecedor_principal) |

### Status: OK - Porem DEPENDENCIAS:
1. **Materiais** devem ser cadastrados primeiro
2. **Fornecedores** devem ser cadastrados primeiro

---

## 7. DASHBOARD MONTAGEM

### Dados que o Dashboard Puxa:
| Dado | Tabela Origem | Formulario de Entrada |
|------|---------------|----------------------|
| Total Montagens | `montagem` | Montagem |
| Por Montador | `montagem.montador_id` + `funcionarios` | Montagem + Funcionarios |
| Por Ambiente | `montagem.ambiente` | Montagem |
| Tempo Estimado vs Real | `montagem.tempo_estimado`, `tempo_real` | Montagem |
| Feedback Cliente | `montagem.feedback_cliente` | Montagem |
| Desafios | `montagem.desafios` | Montagem |

### Status: OK - Porem DEPENDENCIAS:
1. **Funcionarios** (tipo=Montador) devem existir
2. **Projetos** devem existir para vincular montagem

---

## 8. DASHBOARD FEEDBACK

### Dados que o Dashboard Puxa:
| Dado | Tabela Origem | Formulario de Entrada |
|------|---------------|----------------------|
| Avaliacao Vendedor | `feedbacks.avaliacao_vendedor` | Feedbacks |
| Avaliacao Equipe Projetos | `feedbacks.avaliacao_equipe_projetos` | Feedbacks |
| Avaliacao Fabricacao | `feedbacks.avaliacao_fabricacao` | Feedbacks |
| Avaliacao Montagem | `feedbacks.avaliacao_montagem` | Feedbacks |
| Avaliacao Atendimento | `feedbacks.avaliacao_atendimento_geral` | Feedbacks |
| Recomendaria Servico | `feedbacks.recomendaria_servico` | Feedbacks |
| Sugestoes Melhoria | `feedbacks.sugestoes_melhoria` | Feedbacks |

### Status: OK - Porem DEPENDENCIA:
1. **Projetos** devem existir para vincular feedback

---

## 9. DASHBOARD FORNECEDOR

### Dados que o Dashboard Puxa:
| Dado | Tabela Origem | Formulario de Entrada |
|------|---------------|----------------------|
| Total Fornecedores | `fornecedores` | Fornecedores |
| Ranking Fornecedores | `compras` vinculado a fornecedor | Compras |
| Tipo Material | `fornecedores.tipo_material` | Fornecedores |
| Prazo Medio Entrega | `fornecedores.prazo_entrega_medio` | Fornecedores |
| Evolucao Compras | `compras.valor_total` | Compras |
| Material por Fornecedor | `compras.itens_compra` + `materiais` | Compras |

### Status: OK - Porem DEPENDENCIAS:
1. **Fornecedores** devem ser cadastrados primeiro
2. **Materiais** devem existir para adicionar itens nas compras

---

## RESUMO DE DEPENDENCIAS (Ordem de Cadastro Recomendada)

Para que todos os dashboards funcionem corretamente, o usuario deve seguir esta ordem:

```text
ETAPA 1 - CADASTROS BASE (obrigatorios primeiro)
+--------------------------------------------------+
|  1. Materiais                                    |
|  2. Fornecedores                                 |
|  3. Funcionarios (Marceneiros + Montadores)      |
|  4. Vendedores                                   |
+--------------------------------------------------+

ETAPA 2 - OPERACOES COMERCIAIS
+--------------------------------------------------+
|  5. Clientes                                     |
|  6. Projetos (Novo Projeto)                      |
|  7. Orcamentos                                   |
+--------------------------------------------------+

ETAPA 3 - OPERACOES INTERNAS
+--------------------------------------------------+
|  8. Compras (depende de Fornecedores + Materiais)|
|  9. Estoque (depende de Materiais + Fornecedores)|
| 10. Producao (depende de Projetos + Marceneiros) |
| 11. Montagem (depende de Projetos + Montadores)  |
| 12. Feedbacks (depende de Projetos)              |
+--------------------------------------------------+

ETAPA 4 - FINANCEIRO E METAS
+--------------------------------------------------+
| 13. Fluxo de Caixa (transacoes)                  |
| 14. Metas (mensal)                               |
| 15. Capacidade Producao (mensal)                 |
+--------------------------------------------------+
```

---

## GAPS IDENTIFICADOS - DADOS SEM FORMULARIO OBVIO

### 1. Campo `vendedor_responsavel` no Projeto
- **Problema**: E um campo de texto livre, nao vinculado a tabela `vendedores`
- **Impacto**: Ranking de vendedores pode ter nomes inconsistentes
- **Sugestao**: Mudar para SELECT vinculado a tabela vendedores

### 2. Capacidade de Producao
- **Problema**: Muitos usuarios podem nao saber que precisam preencher isso mensalmente
- **Impacto**: Grafico de capacidade fica vazio no Dashboard Producao
- **Sugestao**: Adicionar alerta visual quando nao ha capacidade cadastrada

### 3. Metas Mensais
- **Problema**: O dashboard mostra % de meta atingida, mas se nao houver meta cadastrada, mostra valores incorretos
- **Impacto**: KPIs de "Meta Lucro" e "Meta Faturamento" ficam zerados
- **Sugestao**: Adicionar alerta quando nao ha meta do mes atual

### 4. Visualizacao pelo Cliente (Projeto)
- **Problema**: Campo pouco visivel no formulario de projeto
- **Impacto**: Dashboard Projetos mostra "Total Visualizacao = 0" mesmo com projetos
- **Sugestao**: Destacar esse campo ou tornar automatico baseado em acoes

---

## FORMULARIOS EXISTENTES vs PAGINAS

| Pagina | Tabela | Tem Formulario Completo |
|--------|--------|-------------------------|
| `/materiais` | materiais | SIM |
| `/fornecedores` | fornecedores | SIM |
| `/funcionarios` | funcionarios | SIM |
| `/vendedores` | vendedores | SIM |
| `/clientes` | clientes | SIM |
| `/novo-projeto` | projects | SIM |
| `/orcamentos` | orcamentos | SIM |
| `/compras` | compras + itens_compra | SIM |
| `/estoque` | estoque | SIM |
| `/producao` | producao | SIM |
| `/montagem` | montagem | SIM |
| `/feedbacks` | feedbacks | SIM |
| `/fluxo-caixa` | transacoes_financeiras | SIM |
| `/metas` | metas | SIM |
| `/capacidade-producao` | capacidade_producao | SIM |

---

## CONCLUSAO

O sistema esta **bem estruturado** com todos os dados do dashboard tendo formularios correspondentes. Os principais pontos de atencao sao:

1. **Ordem de preenchimento**: Usuario precisa seguir a sequencia logica de cadastros
2. **Metas e Capacidade**: Precisam ser preenchidos mensalmente
3. **Vinculos com Vendedores**: O campo `vendedor_responsavel` no projeto e texto livre, podendo gerar inconsistencias

### Proximos Passos Recomendados:
- Adicionar um "assistente de onboarding" que guie o usuario pela ordem correta
- Criar alertas quando dados essenciais estao faltando
- Converter campo `vendedor_responsavel` para SELECT vinculado
