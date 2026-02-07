

## Plano: Simulação Visual de Ambiente com IA

### O que vamos implementar

**1. Geração de Imagem Simulada**
A IA irá gerar uma imagem realista do ambiente com os móveis sugeridos aplicados, usando o modelo de geração de imagens do sistema.

**2. Foto de Referência Opcional** 
Novo campo para o cliente enviar uma imagem de inspiração/estilo que deseja (ex: foto de Pinterest, revista de decoração).

**3. Separação de Visões (Interno vs Cliente)**
- **Visão Interna (Vendedor)**: Análise técnica completa com dimensões, materiais, pontos de atenção, preços unitários
- **Visão Cliente**: Apenas a imagem gerada do ambiente pronto + valor total estimado

### Fluxo Atualizado

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     FORMULÁRIO DE ENTRADA                           │
├─────────────────────────────────────────────────────────────────────┤
│  📷 Foto do Ambiente (obrigatório)                                  │
│  🎨 Foto de Referência (opcional) - "estilo que o cliente gosta"   │
│  📝 Preferências do Cliente (opcional)                              │
│                                                                     │
│              [ 🔮 Gerar Análise e Simulação ]                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RESULTADO                                      │
├───────────────────────────────┬─────────────────────────────────────┤
│  👁️ VISÃO CLIENTE             │  🔧 VISÃO INTERNA (Vendedor)        │
│  (toggle para alternar)       │                                     │
├───────────────────────────────┼─────────────────────────────────────┤
│  🖼️ Imagem Gerada pela IA     │  📊 Análise Técnica Completa        │
│  do ambiente com móveis       │  - Tipo ambiente, dimensões         │
│                               │  - Pontos de atenção                │
│  💰 Valor Total: R$ XX.XXX    │  - Lista de móveis sugeridos        │
│                               │  - Preços unitários                 │
│  [ 📤 Compartilhar ]          │  - Materiais e acabamentos          │
│                               │  - Observações técnicas             │
└───────────────────────────────┴─────────────────────────────────────┘
```

### Mudanças Técnicas

**Edge Function (`analisar-foto-ambiente/index.ts`)**
1. Aceitar novo parâmetro `referencia_url` (foto de referência)
2. Após a análise textual, chamar o modelo de geração de imagem (`google/gemini-2.5-flash-image`)
3. Prompt de geração: descrever o ambiente com os móveis sugeridos, usando a referência de estilo se fornecida
4. Fazer upload da imagem gerada para o bucket e retornar a URL
5. Retornar tanto a `analise` (dados técnicos) quanto a `imagem_simulada_url`

**Componente Frontend (`AnaliseFotoAmbiente.tsx`)**
1. Adicionar campo de upload para foto de referência
2. Adicionar toggle/tabs para alternar entre "Visão Cliente" e "Visão Vendedor"
3. Na visão cliente: mostrar apenas imagem gerada + valor total + botão de compartilhar
4. Na visão vendedor: manter a análise técnica detalhada atual
5. Estado de loading específico para geração de imagem ("Gerando simulação...")

**Storage**
O bucket `fotos-ambientes` já existe e será reutilizado para armazenar as imagens geradas.

### Considerações

- A geração de imagem pode levar alguns segundos adicionais
- O modelo `google/gemini-2.5-flash-image` será usado para geração rápida; opcionalmente pode-se usar `google/gemini-3-pro-image-preview` para maior qualidade
- A imagem gerada é salva no storage para poder ser compartilhada via link público
- O botão "Compartilhar" poderá copiar o link ou abrir em nova aba (versão cliente-friendly)

