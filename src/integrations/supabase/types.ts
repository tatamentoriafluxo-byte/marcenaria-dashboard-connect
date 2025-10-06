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
          status?: Database["public"]["Enums"]["status_compra"]
          updated_at?: string | null
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "compras_fornecedor_id_fkey"
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
        ]
      }
      estoque: {
        Row: {
          created_at: string | null
          id: string
          material_id: string
          quantidade_atual: number
          quantidade_maxima: number | null
          quantidade_minima: number
          ultima_atualizacao: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id: string
          quantidade_atual?: number
          quantidade_maxima?: number | null
          quantidade_minima?: number
          ultima_atualizacao?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string
          quantidade_atual?: number
          quantidade_maxima?: number | null
          quantidade_minima?: number
          ultima_atualizacao?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_material_id_fkey"
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
            foreignKeyName: "feedbacks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_project_id_fkey"
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
        ]
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
          created_at: string | null
          data_montagem: string | null
          desafios: string | null
          id: string
          montador_id: string | null
          project_id: string
          status: Database["public"]["Enums"]["status_montagem"]
          tempo_estimado: number | null
          tempo_real: number | null
          updated_at: string | null
          user_id: string
          valor_montagem: number | null
        }
        Insert: {
          created_at?: string | null
          data_montagem?: string | null
          desafios?: string | null
          id?: string
          montador_id?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["status_montagem"]
          tempo_estimado?: number | null
          tempo_real?: number | null
          updated_at?: string | null
          user_id: string
          valor_montagem?: number | null
        }
        Update: {
          created_at?: string | null
          data_montagem?: string | null
          desafios?: string | null
          id?: string
          montador_id?: string | null
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
      producao: {
        Row: {
          created_at: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio: string | null
          id: string
          marceneiro_id: string | null
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
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          id?: string
          marceneiro_id?: string | null
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
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          id?: string
          marceneiro_id?: string | null
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
          prazo_entrega: number | null
          preencheu_formulario: boolean | null
          status: Database["public"]["Enums"]["status_projeto"]
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
          prazo_entrega?: number | null
          preencheu_formulario?: boolean | null
          status?: Database["public"]["Enums"]["status_projeto"]
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
          prazo_entrega?: number | null
          preencheu_formulario?: boolean | null
          status?: Database["public"]["Enums"]["status_projeto"]
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
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"] | null
          id: string
          numero_nf: string | null
          project_id: string | null
          status_pagamento: string | null
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
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          numero_nf?: string | null
          project_id?: string | null
          status_pagamento?: string | null
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
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          numero_nf?: string | null
          project_id?: string | null
          status_pagamento?: string | null
          tipo?: Database["public"]["Enums"]["tipo_transacao"]
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
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
      calcular_lucro_projeto: {
        Args: { project_id: string }
        Returns: number
      }
    }
    Enums: {
      avaliacao: "EXCELENTE" | "BOM" | "REGULAR" | "RUIM"
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
      origem_lead:
        | "LOJA"
        | "INSTAGRAM"
        | "FACEBOOK"
        | "WHATSAPP"
        | "INDICACAO"
        | "GOOGLE"
        | "OUTROS"
      status_compra:
        | "PENDENTE"
        | "CONFIRMADO"
        | "EM_TRANSITO"
        | "ENTREGUE"
        | "CANCELADO"
      status_montagem: "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO"
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
      tipo_material:
        | "MADEIRA"
        | "FERRAGEM"
        | "ACABAMENTO"
        | "FERRAMENTA"
        | "OUTROS"
      tipo_transacao: "RECEITA" | "DESPESA"
      unidade_medida:
        | "UNIDADE"
        | "METRO"
        | "METRO_QUADRADO"
        | "LITRO"
        | "KILO"
        | "PACOTE"
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
      origem_lead: [
        "LOJA",
        "INSTAGRAM",
        "FACEBOOK",
        "WHATSAPP",
        "INDICACAO",
        "GOOGLE",
        "OUTROS",
      ],
      status_compra: [
        "PENDENTE",
        "CONFIRMADO",
        "EM_TRANSITO",
        "ENTREGUE",
        "CANCELADO",
      ],
      status_montagem: ["AGENDADO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"],
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
      tipo_material: [
        "MADEIRA",
        "FERRAGEM",
        "ACABAMENTO",
        "FERRAMENTA",
        "OUTROS",
      ],
      tipo_transacao: ["RECEITA", "DESPESA"],
      unidade_medida: [
        "UNIDADE",
        "METRO",
        "METRO_QUADRADO",
        "LITRO",
        "KILO",
        "PACOTE",
      ],
    },
  },
} as const
