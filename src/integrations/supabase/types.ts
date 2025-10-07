export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abastecimentos: {
        Row: {
          created_at: string | null
          data: string
          id: string
          km_atual: number
          litros: number
          observacoes: string | null
          posto: string | null
          user_id: string
          valor: number
          veiculo_id: string
        }
        Insert: {
          created_at?: string | null
          data?: string
          id?: string
          km_atual: number
          litros: number
          observacoes?: string | null
          posto?: string | null
          user_id: string
          valor: number
          veiculo_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          km_atual?: number
          litros?: number
          observacoes?: string | null
          posto?: string | null
          user_id?: string
          valor?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "abastecimentos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_abastecimentos_veiculo"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      capacidade_producao: {
        Row: {
          capacidade_mensal_horas: number | null
          capacidade_mensal_projetos: number | null
          created_at: string | null
          horas_utilizadas: number | null
          id: string
          mes_referencia: string
          observacoes: string | null
          projetos_realizados: number | null
          taxa_ocupacao: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capacidade_mensal_horas?: number | null
          capacidade_mensal_projetos?: number | null
          created_at?: string | null
          horas_utilizadas?: number | null
          id?: string
          mes_referencia: string
          observacoes?: string | null
          projetos_realizados?: number | null
          taxa_ocupacao?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capacidade_mensal_horas?: number | null
          capacidade_mensal_projetos?: number | null
          created_at?: string | null
          horas_utilizadas?: number | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          projetos_realizados?: number | null
          taxa_ocupacao?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      catalogo_itens: {
        Row: {
          ativo: boolean | null
          categoria: Database["public"]["Enums"]["categoria_item"]
          codigo: string | null
          created_at: string | null
          custo_estimado: number | null
          descricao: string | null
          id: string
          margem_lucro: number | null
          nome: string
          preco_base: number
          unidade_medida: Database["public"]["Enums"]["unidade_orcamento"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: Database["public"]["Enums"]["categoria_item"]
          codigo?: string | null
          created_at?: string | null
          custo_estimado?: number | null
          descricao?: string | null
          id?: string
          margem_lucro?: number | null
          nome: string
          preco_base: number
          unidade_medida?: Database["public"]["Enums"]["unidade_orcamento"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: Database["public"]["Enums"]["categoria_item"]
          codigo?: string | null
          created_at?: string | null
          custo_estimado?: number | null
          descricao?: string | null
          id?: string
          margem_lucro?: number | null
          nome?: string
          preco_base?: number
          unidade_medida?: Database["public"]["Enums"]["unidade_orcamento"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cheques: {
        Row: {
          agencia: string | null
          banco: string
          conta: string | null
          created_at: string
          data_compensacao: string
          data_emissao: string
          id: string
          numero_cheque: string
          observacoes: string | null
          pagamento_id: string | null
          repassado_para: string | null
          status: Database["public"]["Enums"]["status_cheque"]
          tipo: Database["public"]["Enums"]["tipo_cheque"]
          titular: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          agencia?: string | null
          banco: string
          conta?: string | null
          created_at?: string
          data_compensacao: string
          data_emissao?: string
          id?: string
          numero_cheque: string
          observacoes?: string | null
          pagamento_id?: string | null
          repassado_para?: string | null
          status?: Database["public"]["Enums"]["status_cheque"]
          tipo: Database["public"]["Enums"]["tipo_cheque"]
          titular: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          agencia?: string | null
          banco?: string
          conta?: string | null
          created_at?: string
          data_compensacao?: string
          data_emissao?: string
          id?: string
          numero_cheque?: string
          observacoes?: string | null
          pagamento_id?: string | null
          repassado_para?: string | null
          status?: Database["public"]["Enums"]["status_cheque"]
          tipo?: Database["public"]["Enums"]["tipo_cheque"]
          titular?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "cheques_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cheques_pagamento"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compras: {
        Row: {
          created_at: string | null
          data_compra: string
          data_entrega_prevista: string | null
          data_entrega_real: string | null
          fornecedor_id: string
          id: string
          observacoes: string | null
          ordem_compra: string | null
          status: Database["public"]["Enums"]["status_compra"]
          updated_at: string | null
          user_id: string
          valor_total: number
        }
        Insert: {
          created_at?: string | null
          data_compra?: string
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          fornecedor_id: string
          id?: string
          observacoes?: string | null
          ordem_compra?: string | null
          status?: Database["public"]["Enums"]["status_compra"]
          updated_at?: string | null
          user_id: string
          valor_total?: number
        }
        Update: {
          created_at?: string | null
          data_compra?: string
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          fornecedor_id?: string
          id?: string
          observacoes?: string | null
          ordem_compra?: string | null
          status?: Database["public"]["Enums"]["status_compra"]
          updated_at?: string | null
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "compras_fornecedor_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_compras_fornecedor"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      contas: {
        Row: {
          cliente_id: string | null
          compra_id: string | null
          created_at: string
          data_emissao: string
          data_vencimento: string
          descricao: string
          fornecedor_id: string | null
          id: string
          numero_documento: string | null
          observacoes: string | null
          project_id: string | null
          saldo_devedor: number | null
          status: Database["public"]["Enums"]["status_conta"]
          tipo: Database["public"]["Enums"]["tipo_conta"]
          tipo_documento: Database["public"]["Enums"]["tipo_documento"]
          updated_at: string
          user_id: string
          valor_pago: number
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          compra_id?: string | null
          created_at?: string
          data_emissao?: string
          data_vencimento: string
          descricao: string
          fornecedor_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          project_id?: string | null
          saldo_devedor?: number | null
          status?: Database["public"]["Enums"]["status_conta"]
          tipo: Database["public"]["Enums"]["tipo_conta"]
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
          updated_at?: string
          user_id: string
          valor_pago?: number
          valor_total?: number
        }
        Update: {
          cliente_id?: string | null
          compra_id?: string | null
          created_at?: string
          data_emissao?: string
          data_vencimento?: string
          descricao?: string
          fornecedor_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          project_id?: string | null
          saldo_devedor?: number | null
          status?: Database["public"]["Enums"]["status_conta"]
          tipo?: Database["public"]["Enums"]["tipo_conta"]
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
          updated_at?: string
          user_id?: string
          valor_pago?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_cliente_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_compra_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_fornecedor_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_project_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_project_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contas_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contas_compra"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contas_fornecedor"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contas_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contas_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque: {
        Row: {
          created_at: string | null
          data_ultima_compra: string | null
          fornecedor_principal_id: string | null
          id: string
          material_id: string
          preco_medio_compra: number | null
          quantidade_atual: number
          quantidade_maxima: number | null
          quantidade_minima: number
          quantidade_ultima_compra: number | null
          ultima_atualizacao: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_ultima_compra?: string | null
          fornecedor_principal_id?: string | null
          id?: string
          material_id: string
          preco_medio_compra?: number | null
          quantidade_atual?: number
          quantidade_maxima?: number | null
          quantidade_minima?: number
          quantidade_ultima_compra?: number | null
          ultima_atualizacao?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_ultima_compra?: string | null
          fornecedor_principal_id?: string | null
          id?: string
          material_id?: string
          preco_medio_compra?: number | null
          quantidade_atual?: number
          quantidade_maxima?: number | null
          quantidade_minima?: number
          quantidade_ultima_compra?: number | null
          ultima_atualizacao?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_fornecedor_fkey"
            columns: ["fornecedor_principal_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_material_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estoque_fornecedor_principal"
            columns: ["fornecedor_principal_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estoque_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          avaliacao_atendimento_geral:
            | Database["public"]["Enums"]["avaliacao"]
            | null
          avaliacao_equipe_projetos:
            | Database["public"]["Enums"]["avaliacao"]
            | null
          avaliacao_fabricacao: Database["public"]["Enums"]["avaliacao"] | null
          avaliacao_montagem: Database["public"]["Enums"]["avaliacao"] | null
          avaliacao_vendedor: Database["public"]["Enums"]["avaliacao"] | null
          created_at: string | null
          data_feedback: string | null
          id: string
          project_id: string
          recomendaria_servico: boolean | null
          sugestoes_melhoria: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avaliacao_atendimento_geral?:
            | Database["public"]["Enums"]["avaliacao"]
            | null
          avaliacao_equipe_projetos?:
            | Database["public"]["Enums"]["avaliacao"]
            | null
          avaliacao_fabricacao?: Database["public"]["Enums"]["avaliacao"] | null
          avaliacao_montagem?: Database["public"]["Enums"]["avaliacao"] | null
          avaliacao_vendedor?: Database["public"]["Enums"]["avaliacao"] | null
          created_at?: string | null
          data_feedback?: string | null
          id?: string
          project_id: string
          recomendaria_servico?: boolean | null
          sugestoes_melhoria?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avaliacao_atendimento_geral?:
            | Database["public"]["Enums"]["avaliacao"]
            | null
          avaliacao_equipe_projetos?:
            | Database["public"]["Enums"]["avaliacao"]
            | null
          avaliacao_fabricacao?: Database["public"]["Enums"]["avaliacao"] | null
          avaliacao_montagem?: Database["public"]["Enums"]["avaliacao"] | null
          avaliacao_vendedor?: Database["public"]["Enums"]["avaliacao"] | null
          created_at?: string | null
          data_feedback?: string | null
          id?: string
          project_id?: string
          recomendaria_servico?: boolean | null
          sugestoes_melhoria?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_project_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_project_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_feedbacks_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_feedbacks_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      ferramentas: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_ferramenta"]
          categoria_customizada: string | null
          codigo_patrimonio: string | null
          created_at: string | null
          data_aquisicao: string | null
          foto_url: string | null
          id: string
          localizacao: Database["public"]["Enums"]["localizacao_ferramenta"]
          marca: string | null
          modelo: string | null
          moeda: Database["public"]["Enums"]["moeda"]
          nome: string
          numero_serie: string | null
          observacoes: string | null
          proxima_manutencao: string | null
          qr_code: string | null
          status: Database["public"]["Enums"]["status_ferramenta"]
          taxa_depreciacao_anual: number | null
          tipo: Database["public"]["Enums"]["tipo_ferramenta"]
          tipo_customizado: string | null
          ultima_manutencao: string | null
          updated_at: string | null
          user_id: string
          valor_aquisicao: number | null
          valor_atual: number | null
          vida_util_anos: number | null
        }
        Insert: {
          categoria: Database["public"]["Enums"]["categoria_ferramenta"]
          categoria_customizada?: string | null
          codigo_patrimonio?: string | null
          created_at?: string | null
          data_aquisicao?: string | null
          foto_url?: string | null
          id?: string
          localizacao?: Database["public"]["Enums"]["localizacao_ferramenta"]
          marca?: string | null
          modelo?: string | null
          moeda?: Database["public"]["Enums"]["moeda"]
          nome: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["status_ferramenta"]
          taxa_depreciacao_anual?: number | null
          tipo: Database["public"]["Enums"]["tipo_ferramenta"]
          tipo_customizado?: string | null
          ultima_manutencao?: string | null
          updated_at?: string | null
          user_id: string
          valor_aquisicao?: number | null
          valor_atual?: number | null
          vida_util_anos?: number | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_ferramenta"]
          categoria_customizada?: string | null
          codigo_patrimonio?: string | null
          created_at?: string | null
          data_aquisicao?: string | null
          foto_url?: string | null
          id?: string
          localizacao?: Database["public"]["Enums"]["localizacao_ferramenta"]
          marca?: string | null
          modelo?: string | null
          moeda?: Database["public"]["Enums"]["moeda"]
          nome?: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["status_ferramenta"]
          taxa_depreciacao_anual?: number | null
          tipo?: Database["public"]["Enums"]["tipo_ferramenta"]
          tipo_customizado?: string | null
          ultima_manutencao?: string | null
          updated_at?: string | null
          user_id?: string
          valor_aquisicao?: number | null
          valor_atual?: number | null
          vida_util_anos?: number | null
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          ativo: boolean | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          prazo_entrega_medio: number | null
          telefone: string | null
          tipo_material: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          prazo_entrega_medio?: number | null
          telefone?: string | null
          tipo_material?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          prazo_entrega_medio?: number | null
          telefone?: string | null
          tipo_material?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fretes: {
        Row: {
          avaliacao: number | null
          created_at: string | null
          custo_frete: number | null
          data_frete: string
          destino: string | null
          fretista_id: string | null
          id: string
          km_rodados: number | null
          montagem_id: string | null
          observacoes: string | null
          origem: string | null
          project_id: string | null
          status_pagamento: string | null
          tipo_transporte: Database["public"]["Enums"]["tipo_transporte"]
          user_id: string
          veiculo_id: string | null
        }
        Insert: {
          avaliacao?: number | null
          created_at?: string | null
          custo_frete?: number | null
          data_frete?: string
          destino?: string | null
          fretista_id?: string | null
          id?: string
          km_rodados?: number | null
          montagem_id?: string | null
          observacoes?: string | null
          origem?: string | null
          project_id?: string | null
          status_pagamento?: string | null
          tipo_transporte: Database["public"]["Enums"]["tipo_transporte"]
          user_id: string
          veiculo_id?: string | null
        }
        Update: {
          avaliacao?: number | null
          created_at?: string | null
          custo_frete?: number | null
          data_frete?: string
          destino?: string | null
          fretista_id?: string | null
          id?: string
          km_rodados?: number | null
          montagem_id?: string | null
          observacoes?: string | null
          origem?: string | null
          project_id?: string | null
          status_pagamento?: string | null
          tipo_transporte?: Database["public"]["Enums"]["tipo_transporte"]
          user_id?: string
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_fretes_fretista"
            columns: ["fretista_id"]
            isOneToOne: false
            referencedRelation: "fretistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fretes_montagem"
            columns: ["montagem_id"]
            isOneToOne: false
            referencedRelation: "montagem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fretes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fretes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fretes_veiculo"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fretes_fretista_id_fkey"
            columns: ["fretista_id"]
            isOneToOne: false
            referencedRelation: "fretistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fretes_montagem_id_fkey"
            columns: ["montagem_id"]
            isOneToOne: false
            referencedRelation: "montagem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fretes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fretes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fretes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      fretistas: {
        Row: {
          ativo: boolean | null
          avaliacao_media: number | null
          capacidade_carga: number | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          placa_veiculo: string | null
          telefone: string | null
          tipo_veiculo:
            | Database["public"]["Enums"]["tipo_veiculo_fretista"]
            | null
          total_fretes: number | null
          total_pago: number | null
          updated_at: string | null
          user_id: string
          valor_frete_fixo: number | null
          valor_km: number | null
        }
        Insert: {
          ativo?: boolean | null
          avaliacao_media?: number | null
          capacidade_carga?: number | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          placa_veiculo?: string | null
          telefone?: string | null
          tipo_veiculo?:
            | Database["public"]["Enums"]["tipo_veiculo_fretista"]
            | null
          total_fretes?: number | null
          total_pago?: number | null
          updated_at?: string | null
          user_id: string
          valor_frete_fixo?: number | null
          valor_km?: number | null
        }
        Update: {
          ativo?: boolean | null
          avaliacao_media?: number | null
          capacidade_carga?: number | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          placa_veiculo?: string | null
          telefone?: string | null
          tipo_veiculo?:
            | Database["public"]["Enums"]["tipo_veiculo_fretista"]
            | null
          total_fretes?: number | null
          total_pago?: number | null
          updated_at?: string | null
          user_id?: string
          valor_frete_fixo?: number | null
          valor_km?: number | null
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          salario: number | null
          telefone: string | null
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          salario?: number | null
          telefone?: string | null
          tipo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          salario?: number | null
          telefone?: string | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_compra: {
        Row: {
          compra_id: string
          created_at: string | null
          id: string
          material_id: string
          preco_unitario: number
          quantidade: number
          subtotal: number
        }
        Insert: {
          compra_id: string
          created_at?: string | null
          id?: string
          material_id: string
          preco_unitario: number
          quantidade: number
          subtotal: number
        }
        Update: {
          compra_id?: string
          created_at?: string | null
          id?: string
          material_id?: string
          preco_unitario?: number
          quantidade?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_itens_compra_compra"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_itens_compra_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_compra_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_compra_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      manutencoes_ferramentas: {
        Row: {
          created_at: string | null
          custo: number | null
          data: string
          descricao: string | null
          ferramenta_id: string
          id: string
          proxima_prevista: string | null
          responsavel: string | null
          tipo: Database["public"]["Enums"]["tipo_manutencao"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custo?: number | null
          data?: string
          descricao?: string | null
          ferramenta_id: string
          id?: string
          proxima_prevista?: string | null
          responsavel?: string | null
          tipo: Database["public"]["Enums"]["tipo_manutencao"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          custo?: number | null
          data?: string
          descricao?: string | null
          ferramenta_id?: string
          id?: string
          proxima_prevista?: string | null
          responsavel?: string | null
          tipo?: Database["public"]["Enums"]["tipo_manutencao"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_manutencoes_ferramentas_ferramenta"
            columns: ["ferramenta_id"]
            isOneToOne: false
            referencedRelation: "ferramentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manutencoes_ferramentas_ferramenta_id_fkey"
            columns: ["ferramenta_id"]
            isOneToOne: false
            referencedRelation: "ferramentas"
            referencedColumns: ["id"]
          },
        ]
      }
      manutencoes_veiculos: {
        Row: {
          created_at: string | null
          custo: number | null
          data: string
          descricao: string | null
          id: string
          km_atual: number | null
          oficina: string | null
          proxima_manutencao_km: number | null
          tipo: Database["public"]["Enums"]["tipo_manutencao"]
          user_id: string
          veiculo_id: string
        }
        Insert: {
          created_at?: string | null
          custo?: number | null
          data?: string
          descricao?: string | null
          id?: string
          km_atual?: number | null
          oficina?: string | null
          proxima_manutencao_km?: number | null
          tipo: Database["public"]["Enums"]["tipo_manutencao"]
          user_id: string
          veiculo_id: string
        }
        Update: {
          created_at?: string | null
          custo?: number | null
          data?: string
          descricao?: string | null
          id?: string
          km_atual?: number | null
          oficina?: string | null
          proxima_manutencao_km?: number | null
          tipo?: Database["public"]["Enums"]["tipo_manutencao"]
          user_id?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_manutencoes_veiculos_veiculo"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manutencoes_veiculos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          codigo: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          preco_medio: number | null
          tipo: Database["public"]["Enums"]["tipo_material"]
          unidade: Database["public"]["Enums"]["unidade_medida"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          preco_medio?: number | null
          tipo: Database["public"]["Enums"]["tipo_material"]
          unidade?: Database["public"]["Enums"]["unidade_medida"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          preco_medio?: number | null
          tipo?: Database["public"]["Enums"]["tipo_material"]
          unidade?: Database["public"]["Enums"]["unidade_medida"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metas: {
        Row: {
          created_at: string | null
          id: string
          mes_referencia: string
          meta_faturamento: number | null
          meta_lucro: number | null
          meta_projetos: number | null
          updated_at: string | null
          user_id: string
          vendedor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mes_referencia: string
          meta_faturamento?: number | null
          meta_lucro?: number | null
          meta_projetos?: number | null
          updated_at?: string | null
          user_id: string
          vendedor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mes_referencia?: string
          meta_faturamento?: number | null
          meta_lucro?: number | null
          meta_projetos?: number | null
          updated_at?: string | null
          user_id?: string
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_metas_vendedor"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      montagem: {
        Row: {
          ambiente: string | null
          created_at: string | null
          data_montagem: string | null
          desafios: string | null
          feedback_cliente: string | null
          id: string
          montador_id: string | null
          nome_movel: string | null
          project_id: string
          status: Database["public"]["Enums"]["status_montagem"]
          tempo_estimado: number | null
          tempo_real: number | null
          updated_at: string | null
          user_id: string
          valor_montagem: number | null
        }
        Insert: {
          ambiente?: string | null
          created_at?: string | null
          data_montagem?: string | null
          desafios?: string | null
          feedback_cliente?: string | null
          id?: string
          montador_id?: string | null
          nome_movel?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["status_montagem"]
          tempo_estimado?: number | null
          tempo_real?: number | null
          updated_at?: string | null
          user_id: string
          valor_montagem?: number | null
        }
        Update: {
          ambiente?: string | null
          created_at?: string | null
          data_montagem?: string | null
          desafios?: string | null
          feedback_cliente?: string | null
          id?: string
          montador_id?: string | null
          nome_movel?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["status_montagem"]
          tempo_estimado?: number | null
          tempo_real?: number | null
          updated_at?: string | null
          user_id?: string
          valor_montagem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_montagem_montador"
            columns: ["montador_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_montagem_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_montagem_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "montagem_montador_id_fkey"
            columns: ["montador_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "montagem_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "montagem_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "montagem_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_ferramentas: {
        Row: {
          created_at: string | null
          data_retorno_prevista: string | null
          data_retorno_real: string | null
          data_saida: string | null
          ferramenta_id: string
          funcionario_id: string | null
          id: string
          montagem_id: string | null
          observacoes: string | null
          tipo_movimentacao: Database["public"]["Enums"]["tipo_movimentacao_ferramenta"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_retorno_prevista?: string | null
          data_retorno_real?: string | null
          data_saida?: string | null
          ferramenta_id: string
          funcionario_id?: string | null
          id?: string
          montagem_id?: string | null
          observacoes?: string | null
          tipo_movimentacao: Database["public"]["Enums"]["tipo_movimentacao_ferramenta"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_retorno_prevista?: string | null
          data_retorno_real?: string | null
          data_saida?: string | null
          ferramenta_id?: string
          funcionario_id?: string | null
          id?: string
          montagem_id?: string | null
          observacoes?: string | null
          tipo_movimentacao?: Database["public"]["Enums"]["tipo_movimentacao_ferramenta"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_movimentacoes_ferramentas_ferramenta"
            columns: ["ferramenta_id"]
            isOneToOne: false
            referencedRelation: "ferramentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_movimentacoes_ferramentas_funcionario"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_movimentacoes_ferramentas_montagem"
            columns: ["montagem_id"]
            isOneToOne: false
            referencedRelation: "montagem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_ferramentas_ferramenta_id_fkey"
            columns: ["ferramenta_id"]
            isOneToOne: false
            referencedRelation: "ferramentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_ferramentas_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_ferramentas_montagem_id_fkey"
            columns: ["montagem_id"]
            isOneToOne: false
            referencedRelation: "montagem"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_orcamento: string
          data_validade: string | null
          desconto_percentual: number | null
          desconto_valor: number | null
          email_cliente: string | null
          id: string
          nome_cliente: string
          numero_orcamento: string | null
          observacoes: string | null
          observacoes_internas: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["status_orcamento"]
          telefone_cliente: string | null
          updated_at: string | null
          user_id: string
          validade_dias: number
          valor_subtotal: number
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_orcamento?: string
          data_validade?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          email_cliente?: string | null
          id?: string
          nome_cliente: string
          numero_orcamento?: string | null
          observacoes?: string | null
          observacoes_internas?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["status_orcamento"]
          telefone_cliente?: string | null
          updated_at?: string | null
          user_id: string
          validade_dias?: number
          valor_subtotal?: number
          valor_total?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_orcamento?: string
          data_validade?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          email_cliente?: string | null
          id?: string
          nome_cliente?: string
          numero_orcamento?: string | null
          observacoes?: string | null
          observacoes_internas?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["status_orcamento"]
          telefone_cliente?: string | null
          updated_at?: string | null
          user_id?: string
          validade_dias?: number
          valor_subtotal?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos_itens: {
        Row: {
          catalogo_item_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome_item: string
          orcamento_id: string
          ordem: number
          preco_unitario: number
          quantidade: number
          subtotal: number
          unidade_medida: Database["public"]["Enums"]["unidade_orcamento"]
        }
        Insert: {
          catalogo_item_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_item: string
          orcamento_id: string
          ordem?: number
          preco_unitario: number
          quantidade: number
          subtotal?: number
          unidade_medida?: Database["public"]["Enums"]["unidade_orcamento"]
        }
        Update: {
          catalogo_item_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_item?: string
          orcamento_id?: string
          ordem?: number
          preco_unitario?: number
          quantidade?: number
          subtotal?: number
          unidade_medida?: Database["public"]["Enums"]["unidade_orcamento"]
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_itens_catalogo_item_id_fkey"
            columns: ["catalogo_item_id"]
            isOneToOne: false
            referencedRelation: "catalogo_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          cheque_banco: string | null
          cheque_data_compensacao: string | null
          cheque_numero: string | null
          cheque_titular: string | null
          comprovante_url: string | null
          conta_id: string
          created_at: string
          data_pagamento: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          observacoes: string | null
          parcela_id: string | null
          user_id: string
          valor: number
        }
        Insert: {
          cheque_banco?: string | null
          cheque_data_compensacao?: string | null
          cheque_numero?: string | null
          cheque_titular?: string | null
          comprovante_url?: string | null
          conta_id: string
          created_at?: string
          data_pagamento?: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          observacoes?: string | null
          parcela_id?: string | null
          user_id: string
          valor: number
        }
        Update: {
          cheque_banco?: string | null
          cheque_data_compensacao?: string | null
          cheque_numero?: string | null
          cheque_titular?: string | null
          comprovante_url?: string | null
          conta_id?: string
          created_at?: string
          data_pagamento?: string
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          observacoes?: string | null
          parcela_id?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_pagamentos_conta"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pagamentos_parcela"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcelas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcelas"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros: {
        Row: {
          ativo: boolean | null
          categoria: Database["public"]["Enums"]["categoria_parceiro"]
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          percentual_comissao: number | null
          telefone: string | null
          tipo_remuneracao:
            | Database["public"]["Enums"]["tipo_remuneracao"]
            | null
          total_comissoes_pagas: number | null
          total_indicacoes: number | null
          total_vendas_geradas: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: Database["public"]["Enums"]["categoria_parceiro"]
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          percentual_comissao?: number | null
          telefone?: string | null
          tipo_remuneracao?:
            | Database["public"]["Enums"]["tipo_remuneracao"]
            | null
          total_comissoes_pagas?: number | null
          total_indicacoes?: number | null
          total_vendas_geradas?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: Database["public"]["Enums"]["categoria_parceiro"]
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          percentual_comissao?: number | null
          telefone?: string | null
          tipo_remuneracao?:
            | Database["public"]["Enums"]["tipo_remuneracao"]
            | null
          total_comissoes_pagas?: number | null
          total_indicacoes?: number | null
          total_vendas_geradas?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      parcelas: {
        Row: {
          conta_id: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          desconto: number
          id: string
          juros_multa: number
          numero_parcela: number
          observacoes: string | null
          status: Database["public"]["Enums"]["status_parcela"]
          updated_at: string
          valor_pago: number
          valor_parcela: number
        }
        Insert: {
          conta_id: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          desconto?: number
          id?: string
          juros_multa?: number
          numero_parcela: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_parcela"]
          updated_at?: string
          valor_pago?: number
          valor_parcela: number
        }
        Update: {
          conta_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          desconto?: number
          id?: string
          juros_multa?: number
          numero_parcela?: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_parcela"]
          updated_at?: string
          valor_pago?: number
          valor_parcela?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_parcelas_conta"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcelas_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
      producao: {
        Row: {
          ambiente: string | null
          consumo_ferragem: number | null
          consumo_madeira: number | null
          created_at: string | null
          custo_mao_obra: number | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio: string | null
          data_liberacao: string | null
          id: string
          marceneiro_id: string | null
          nome_movel: string | null
          observacoes: string | null
          project_id: string
          status: Database["public"]["Enums"]["status_producao"]
          taxa_rejeicao: number | null
          tempo_estimado: number | null
          tempo_real: number | null
          updated_at: string | null
          user_id: string
          valor_producao: number | null
        }
        Insert: {
          ambiente?: string | null
          consumo_ferragem?: number | null
          consumo_madeira?: number | null
          created_at?: string | null
          custo_mao_obra?: number | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          data_liberacao?: string | null
          id?: string
          marceneiro_id?: string | null
          nome_movel?: string | null
          observacoes?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["status_producao"]
          taxa_rejeicao?: number | null
          tempo_estimado?: number | null
          tempo_real?: number | null
          updated_at?: string | null
          user_id: string
          valor_producao?: number | null
        }
        Update: {
          ambiente?: string | null
          consumo_ferragem?: number | null
          consumo_madeira?: number | null
          created_at?: string | null
          custo_mao_obra?: number | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          data_liberacao?: string | null
          id?: string
          marceneiro_id?: string | null
          nome_movel?: string | null
          observacoes?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["status_producao"]
          taxa_rejeicao?: number | null
          tempo_estimado?: number | null
          tempo_real?: number | null
          updated_at?: string | null
          user_id?: string
          valor_producao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_producao_marceneiro"
            columns: ["marceneiro_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_producao_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_producao_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producao_marceneiro_id_fkey"
            columns: ["marceneiro_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producao_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producao_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producao_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          nome_marcenaria: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          nome_marcenaria: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome_marcenaria?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          ambiente: string
          cliente_id: string | null
          cod_projeto: string
          comissao_parceiro: number | null
          created_at: string | null
          custo_mao_obra: number
          custo_materiais: number
          data_contato: string
          data_entrega: string | null
          data_venda: string | null
          id: string
          nome_cliente: string
          origem_lead: Database["public"]["Enums"]["origem_lead"]
          outros_custos: number
          parceiro_id: string | null
          prazo_entrega: number | null
          preencheu_formulario: boolean | null
          status: Database["public"]["Enums"]["status_projeto"]
          status_pagamento_parceiro:
            | Database["public"]["Enums"]["status_pagamento_comissao"]
            | null
          telefone: string
          updated_at: string | null
          user_id: string
          valor_orcamento: number
          valor_venda: number | null
          vendedor_id: string | null
          vendedor_responsavel: string
          visualizado_cliente: boolean | null
        }
        Insert: {
          ambiente: string
          cliente_id?: string | null
          cod_projeto: string
          comissao_parceiro?: number | null
          created_at?: string | null
          custo_mao_obra?: number
          custo_materiais?: number
          data_contato: string
          data_entrega?: string | null
          data_venda?: string | null
          id?: string
          nome_cliente: string
          origem_lead: Database["public"]["Enums"]["origem_lead"]
          outros_custos?: number
          parceiro_id?: string | null
          prazo_entrega?: number | null
          preencheu_formulario?: boolean | null
          status?: Database["public"]["Enums"]["status_projeto"]
          status_pagamento_parceiro?:
            | Database["public"]["Enums"]["status_pagamento_comissao"]
            | null
          telefone: string
          updated_at?: string | null
          user_id: string
          valor_orcamento?: number
          valor_venda?: number | null
          vendedor_id?: string | null
          vendedor_responsavel: string
          visualizado_cliente?: boolean | null
        }
        Update: {
          ambiente?: string
          cliente_id?: string | null
          cod_projeto?: string
          comissao_parceiro?: number | null
          created_at?: string | null
          custo_mao_obra?: number
          custo_materiais?: number
          data_contato?: string
          data_entrega?: string | null
          data_venda?: string | null
          id?: string
          nome_cliente?: string
          origem_lead?: Database["public"]["Enums"]["origem_lead"]
          outros_custos?: number
          parceiro_id?: string | null
          prazo_entrega?: number | null
          preencheu_formulario?: boolean | null
          status?: Database["public"]["Enums"]["status_projeto"]
          status_pagamento_parceiro?:
            | Database["public"]["Enums"]["status_pagamento_comissao"]
            | null
          telefone?: string
          updated_at?: string | null
          user_id?: string
          valor_orcamento?: number
          valor_venda?: number | null
          vendedor_id?: string | null
          vendedor_responsavel?: string
          visualizado_cliente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projects_parceiro"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projects_vendedor"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_financeiras: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_transacao"]
          compra_id: string | null
          created_at: string | null
          data_transacao: string
          descricao: string | null
          documento_associado: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"] | null
          id: string
          numero_nf: string | null
          project_id: string | null
          status_pagamento: string | null
          subcategoria: string | null
          tipo: Database["public"]["Enums"]["tipo_transacao"]
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          categoria: Database["public"]["Enums"]["categoria_transacao"]
          compra_id?: string | null
          created_at?: string | null
          data_transacao?: string
          descricao?: string | null
          documento_associado?: string | null
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          numero_nf?: string | null
          project_id?: string | null
          status_pagamento?: string | null
          subcategoria?: string | null
          tipo: Database["public"]["Enums"]["tipo_transacao"]
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_transacao"]
          compra_id?: string | null
          created_at?: string | null
          data_transacao?: string
          descricao?: string | null
          documento_associado?: string | null
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          numero_nf?: string | null
          project_id?: string | null
          status_pagamento?: string | null
          subcategoria?: string | null
          tipo?: Database["public"]["Enums"]["tipo_transacao"]
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_transacoes_compra"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transacoes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transacoes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "resumo_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: number | null
          cor: string | null
          created_at: string | null
          custo_mensal_medio: number | null
          data_aquisicao: string | null
          id: string
          km_atual: number | null
          marca: string | null
          modelo: string
          observacoes: string | null
          placa: string
          status: Database["public"]["Enums"]["status_veiculo"]
          tipo: Database["public"]["Enums"]["tipo_veiculo"]
          updated_at: string | null
          user_id: string
          valor_aquisicao: number | null
        }
        Insert: {
          ano?: number | null
          cor?: string | null
          created_at?: string | null
          custo_mensal_medio?: number | null
          data_aquisicao?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          modelo: string
          observacoes?: string | null
          placa: string
          status?: Database["public"]["Enums"]["status_veiculo"]
          tipo: Database["public"]["Enums"]["tipo_veiculo"]
          updated_at?: string | null
          user_id: string
          valor_aquisicao?: number | null
        }
        Update: {
          ano?: number | null
          cor?: string | null
          created_at?: string | null
          custo_mensal_medio?: number | null
          data_aquisicao?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          modelo?: string
          observacoes?: string | null
          placa?: string
          status?: Database["public"]["Enums"]["status_veiculo"]
          tipo?: Database["public"]["Enums"]["tipo_veiculo"]
          updated_at?: string | null
          user_id?: string
          valor_aquisicao?: number | null
        }
        Relationships: []
      }
      vendedores: {
        Row: {
          ativo: boolean | null
          comissao_percentual: number | null
          created_at: string | null
          email: string | null
          id: string
          meta_mensal: number | null
          nome: string
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          comissao_percentual?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          meta_mensal?: number | null
          nome: string
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          comissao_percentual?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          meta_mensal?: number | null
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendedores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_vendas: {
        Row: {
          faturamento_total: number | null
          lucro_total: number | null
          mes: string | null
          ticket_medio: number | null
          total_vendas: number | null
          user_id: string | null
          vendedor_nome: string | null
          vendedor_responsavel: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumo_projetos: {
        Row: {
          ambiente: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          cod_projeto: string | null
          created_at: string | null
          custo_mao_obra: number | null
          custo_materiais: number | null
          data_contato: string | null
          data_venda: string | null
          id: string | null
          lucro: number | null
          nome_cliente: string | null
          origem_lead: Database["public"]["Enums"]["origem_lead"] | null
          outros_custos: number | null
          preencheu_formulario: boolean | null
          status: Database["public"]["Enums"]["status_projeto"] | null
          user_id: string | null
          valor_orcamento: number | null
          valor_venda: number | null
          vendedor_nome: string | null
          vendedor_responsavel: string | null
          visualizado_cliente: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calcular_depreciacao_ferramenta: {
        Args: { ferramenta_id: string }
        Returns: number
      }
      calcular_lucro_projeto: {
        Args: { project_id: string }
        Returns: number
      }
      calcular_projecao_fluxo: {
        Args: { _data_fim: string; _data_inicio: string; _user_id: string }
        Returns: {
          data: string
          entradas_previstas: number
          saidas_previstas: number
          saldo_projetado: number
        }[]
      }
    }
    Enums: {
      avaliacao: "EXCELENTE" | "BOM" | "REGULAR" | "RUIM"
      categoria_ferramenta:
        | "CORTE"
        | "ACABAMENTO"
        | "MEDICAO"
        | "FIXACAO"
        | "LIXAMENTO"
        | "FURACAO"
        | "OUTRO"
      categoria_item:
        | "ARMARIO"
        | "BALCAO"
        | "PORTA"
        | "GAVETA"
        | "ACESSORIO"
        | "ACABAMENTO"
        | "FERRAGEM"
        | "VIDRO"
        | "ILUMINACAO"
        | "OUTROS"
      categoria_parceiro:
        | "ARQUITETO"
        | "DESIGNER_INTERIORES"
        | "CONSTRUTORA"
        | "CORRETOR_IMOVEIS"
        | "LOJA_MATERIAIS"
        | "DECORADOR"
        | "ENGENHEIRO"
        | "OUTRO"
      categoria_transacao:
        | "VENDA"
        | "SERVICO"
        | "COMPRA_MATERIAL"
        | "SALARIO"
        | "ALUGUEL"
        | "ENERGIA"
        | "MARKETING"
        | "MANUTENCAO"
        | "OUTROS"
      forma_pagamento:
        | "DINHEIRO"
        | "CARTAO_CREDITO"
        | "CARTAO_DEBITO"
        | "PIX"
        | "BOLETO"
        | "TRANSFERENCIA"
        | "CREDITO_PARCELADO"
      localizacao_ferramenta: "MARCENARIA" | "OBRA" | "MANUTENCAO_EXTERNA"
      moeda: "BRL" | "USD" | "EUR" | "GBP" | "JPY" | "CHF" | "CAD" | "AUD"
      origem_lead:
        | "LOJA"
        | "INSTAGRAM"
        | "FACEBOOK"
        | "WHATSAPP"
        | "INDICACAO"
        | "GOOGLE"
        | "OUTROS"
      status_cheque: "PENDENTE" | "COMPENSADO" | "DEVOLVIDO" | "REPASSADO"
      status_compra:
        | "PENDENTE"
        | "CONFIRMADO"
        | "EM_TRANSITO"
        | "ENTREGUE"
        | "CANCELADO"
      status_conta:
        | "ABERTA"
        | "PAGA_PARCIAL"
        | "PAGA_TOTAL"
        | "VENCIDA"
        | "CANCELADA"
      status_ferramenta:
        | "DISPONIVEL"
        | "EM_USO"
        | "MANUTENCAO"
        | "QUEBRADA"
        | "VENDIDA"
      status_montagem: "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO"
      status_orcamento:
        | "RASCUNHO"
        | "ENVIADO"
        | "APROVADO"
        | "REJEITADO"
        | "EXPIRADO"
        | "CONVERTIDO"
      status_pagamento_comissao: "PENDENTE" | "PAGO" | "CANCELADO"
      status_parcela: "PENDENTE" | "PAGA" | "ATRASADA" | "CANCELADA"
      status_producao:
        | "PLANEJADO"
        | "EM_ANDAMENTO"
        | "PAUSADO"
        | "CONCLUIDO"
        | "REJEITADO"
      status_projeto:
        | "ORCAMENTO"
        | "CONVERTIDO"
        | "EM_PRODUCAO"
        | "ENTREGUE"
        | "CANCELADO"
      status_veiculo: "ATIVO" | "MANUTENCAO" | "INATIVO" | "VENDIDO"
      tipo_cheque: "RECEBIDO" | "EMITIDO"
      tipo_conta: "PAGAR" | "RECEBER"
      tipo_documento:
        | "NOTA_FISCAL"
        | "BOLETO"
        | "CONTRATO"
        | "CHEQUE"
        | "RECIBO"
        | "OUTRO"
      tipo_ferramenta: "ESTACIONARIA" | "MANUAL" | "ELETRICA" | "PNEUMATICA"
      tipo_manutencao: "PREVENTIVA" | "CORRETIVA" | "TROCA_PECA" | "CALIBRACAO"
      tipo_material:
        | "MADEIRA"
        | "FERRAGEM"
        | "ACABAMENTO"
        | "FERRAMENTA"
        | "OUTROS"
      tipo_movimentacao_ferramenta:
        | "SAIDA_OBRA"
        | "RETORNO_MARCENARIA"
        | "EMPRESTIMO_FUNCIONARIO"
        | "DEVOLUCAO"
        | "MANUTENCAO"
      tipo_remuneracao: "PERCENTUAL" | "VALOR_FIXO"
      tipo_transacao: "RECEITA" | "DESPESA"
      tipo_transporte: "VEICULO_PROPRIO" | "FRETISTA"
      tipo_veiculo:
        | "CARRO"
        | "CAMINHAO"
        | "KOMBI"
        | "VAN"
        | "UTILITARIO"
        | "OUTRO"
      tipo_veiculo_fretista: "CARRO" | "CAMINHAO" | "VAN" | "BAU" | "UTILITARIO"
      unidade_medida:
        | "UNIDADE"
        | "METRO"
        | "METRO_QUADRADO"
        | "LITRO"
        | "KILO"
        | "PACOTE"
      unidade_orcamento: "M2" | "ML" | "UNIDADE" | "M3" | "KG"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      avaliacao: ["EXCELENTE", "BOM", "REGULAR", "RUIM"],
      categoria_ferramenta: [
        "CORTE",
        "ACABAMENTO",
        "MEDICAO",
        "FIXACAO",
        "LIXAMENTO",
        "FURACAO",
        "OUTRO",
      ],
      categoria_item: [
        "ARMARIO",
        "BALCAO",
        "PORTA",
        "GAVETA",
        "ACESSORIO",
        "ACABAMENTO",
        "FERRAGEM",
        "VIDRO",
        "ILUMINACAO",
        "OUTROS",
      ],
      categoria_parceiro: [
        "ARQUITETO",
        "DESIGNER_INTERIORES",
        "CONSTRUTORA",
        "CORRETOR_IMOVEIS",
        "LOJA_MATERIAIS",
        "DECORADOR",
        "ENGENHEIRO",
        "OUTRO",
      ],
      categoria_transacao: [
        "VENDA",
        "SERVICO",
        "COMPRA_MATERIAL",
        "SALARIO",
        "ALUGUEL",
        "ENERGIA",
        "MARKETING",
        "MANUTENCAO",
        "OUTROS",
      ],
      forma_pagamento: [
        "DINHEIRO",
        "CARTAO_CREDITO",
        "CARTAO_DEBITO",
        "PIX",
        "BOLETO",
        "TRANSFERENCIA",
        "CREDITO_PARCELADO",
      ],
      localizacao_ferramenta: ["MARCENARIA", "OBRA", "MANUTENCAO_EXTERNA"],
      moeda: ["BRL", "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"],
      origem_lead: [
        "LOJA",
        "INSTAGRAM",
        "FACEBOOK",
        "WHATSAPP",
        "INDICACAO",
        "GOOGLE",
        "OUTROS",
      ],
      status_cheque: ["PENDENTE", "COMPENSADO", "DEVOLVIDO", "REPASSADO"],
      status_compra: [
        "PENDENTE",
        "CONFIRMADO",
        "EM_TRANSITO",
        "ENTREGUE",
        "CANCELADO",
      ],
      status_conta: [
        "ABERTA",
        "PAGA_PARCIAL",
        "PAGA_TOTAL",
        "VENCIDA",
        "CANCELADA",
      ],
      status_ferramenta: [
        "DISPONIVEL",
        "EM_USO",
        "MANUTENCAO",
        "QUEBRADA",
        "VENDIDA",
      ],
      status_montagem: ["AGENDADO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"],
      status_orcamento: [
        "RASCUNHO",
        "ENVIADO",
        "APROVADO",
        "REJEITADO",
        "EXPIRADO",
        "CONVERTIDO",
      ],
      status_pagamento_comissao: ["PENDENTE", "PAGO", "CANCELADO"],
      status_parcela: ["PENDENTE", "PAGA", "ATRASADA", "CANCELADA"],
      status_producao: [
        "PLANEJADO",
        "EM_ANDAMENTO",
        "PAUSADO",
        "CONCLUIDO",
        "REJEITADO",
      ],
      status_projeto: [
        "ORCAMENTO",
        "CONVERTIDO",
        "EM_PRODUCAO",
        "ENTREGUE",
        "CANCELADO",
      ],
      status_veiculo: ["ATIVO", "MANUTENCAO", "INATIVO", "VENDIDO"],
      tipo_cheque: ["RECEBIDO", "EMITIDO"],
      tipo_conta: ["PAGAR", "RECEBER"],
      tipo_documento: [
        "NOTA_FISCAL",
        "BOLETO",
        "CONTRATO",
        "CHEQUE",
        "RECIBO",
        "OUTRO",
      ],
      tipo_ferramenta: ["ESTACIONARIA", "MANUAL", "ELETRICA", "PNEUMATICA"],
      tipo_manutencao: ["PREVENTIVA", "CORRETIVA", "TROCA_PECA", "CALIBRACAO"],
      tipo_material: [
        "MADEIRA",
        "FERRAGEM",
        "ACABAMENTO",
        "FERRAMENTA",
        "OUTROS",
      ],
      tipo_movimentacao_ferramenta: [
        "SAIDA_OBRA",
        "RETORNO_MARCENARIA",
        "EMPRESTIMO_FUNCIONARIO",
        "DEVOLUCAO",
        "MANUTENCAO",
      ],
      tipo_remuneracao: ["PERCENTUAL", "VALOR_FIXO"],
      tipo_transacao: ["RECEITA", "DESPESA"],
      tipo_transporte: ["VEICULO_PROPRIO", "FRETISTA"],
      tipo_veiculo: [
        "CARRO",
        "CAMINHAO",
        "KOMBI",
        "VAN",
        "UTILITARIO",
        "OUTRO",
      ],
      tipo_veiculo_fretista: ["CARRO", "CAMINHAO", "VAN", "BAU", "UTILITARIO"],
      unidade_medida: [
        "UNIDADE",
        "METRO",
        "METRO_QUADRADO",
        "LITRO",
        "KILO",
        "PACOTE",
      ],
      unidade_orcamento: ["M2", "ML", "UNIDADE", "M3", "KG"],
    },
  },
} as const
