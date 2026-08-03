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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_analysis: {
        Row: {
          category: string | null
          colors: string[]
          created_at: string
          detected_item: string | null
          difficulty: string | null
          id: string
          project_id: string
          suggested_use: string | null
        }
        Insert: {
          category?: string | null
          colors?: string[]
          created_at?: string
          detected_item?: string | null
          difficulty?: string | null
          id?: string
          project_id: string
          suggested_use?: string | null
        }
        Update: {
          category?: string | null
          colors?: string[]
          created_at?: string
          detected_item?: string | null
          difficulty?: string | null
          id?: string
          project_id?: string
          suggested_use?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_content: {
        Row: {
          created_at: string
          currency: string
          friendly_caption: string | null
          hashtags: string[]
          id: string
          playful_caption: string | null
          pricing_max: number | null
          pricing_min: number | null
          product_description: string | null
          professional_caption: string | null
          project_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          friendly_caption?: string | null
          hashtags?: string[]
          id?: string
          playful_caption?: string | null
          pricing_max?: number | null
          pricing_min?: number | null
          product_description?: string | null
          professional_caption?: string | null
          project_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          friendly_caption?: string | null
          hashtags?: string[]
          id?: string
          playful_caption?: string | null
          pricing_max?: number | null
          pricing_min?: number | null
          product_description?: string | null
          professional_caption?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_content_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_ai_usage: {
        Row: {
          fingerprint: string
          first_used_at: string
          id: string
          last_used_at: string
          runs: number
        }
        Insert: {
          fingerprint: string
          first_used_at?: string
          id?: string
          last_used_at?: string
          runs?: number
        }
        Update: {
          fingerprint?: string
          first_used_at?: string
          id?: string
          last_used_at?: string
          runs?: number
        }
        Relationships: []
      }
      ideas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_id: string
          saved: boolean
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id: string
          saved?: boolean
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string
          saved?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          theme: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          theme?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          theme?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          enhanced_image_url: string | null
          goal: string
          id: string
          notes: string | null
          original_image_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          enhanced_image_url?: string | null
          goal?: string
          id?: string
          notes?: string | null
          original_image_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          enhanced_image_url?: string | null
          goal?: string
          id?: string
          notes?: string | null
          original_image_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_guest_ai_run: {
        Args: { _fingerprint: string; _limit: number }
        Returns: number
      }
      guest_ai_runs_used: { Args: { _fingerprint: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
