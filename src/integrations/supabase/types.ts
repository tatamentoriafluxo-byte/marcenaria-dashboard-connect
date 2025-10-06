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
          vendedor_responsavel: string
          visualizado_cliente: boolean | null
        }
        Insert: {
          ambiente: string
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
          vendedor_responsavel: string
          visualizado_cliente?: boolean | null
        }
        Update: {
          ambiente?: string
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
          vendedor_responsavel?: string
          visualizado_cliente?: boolean | null
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
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      origem_lead:
        | "LOJA"
        | "INSTAGRAM"
        | "FACEBOOK"
        | "WHATSAPP"
        | "INDICACAO"
        | "GOOGLE"
        | "OUTROS"
      status_projeto:
        | "ORCAMENTO"
        | "CONVERTIDO"
        | "EM_PRODUCAO"
        | "ENTREGUE"
        | "CANCELADO"
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
      origem_lead: [
        "LOJA",
        "INSTAGRAM",
        "FACEBOOK",
        "WHATSAPP",
        "INDICACAO",
        "GOOGLE",
        "OUTROS",
      ],
      status_projeto: [
        "ORCAMENTO",
        "CONVERTIDO",
        "EM_PRODUCAO",
        "ENTREGUE",
        "CANCELADO",
      ],
    },
  },
} as const
