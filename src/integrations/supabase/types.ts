export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      course_enrollments: {
        Row: {
          course_id: string
          created_at: string
          grade: string | null
          id: string
          semester: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          grade?: string | null
          id?: string
          semester: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          grade?: string | null
          id?: string
          semester?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credit: number
          department: string
          id: string
          name: string
          requirement_type: string
        }
        Insert: {
          code: string
          created_at?: string
          credit: number
          department: string
          id?: string
          name: string
          requirement_type: string
        }
        Update: {
          code?: string
          created_at?: string
          credit?: number
          department?: string
          id?: string
          name?: string
          requirement_type?: string
        }
        Relationships: []
      }
      graduation_requirements: {
        Row: {
          created_at: string
          department: string
          description: string
          entry_year: number
          id: string
          min_credits: number | null
          requirement_type: string
        }
        Insert: {
          created_at?: string
          department: string
          description: string
          entry_year: number
          id?: string
          min_credits?: number | null
          requirement_type: string
        }
        Update: {
          created_at?: string
          department?: string
          description?: string
          entry_year?: number
          id?: string
          min_credits?: number | null
          requirement_type?: string
        }
        Relationships: []
      }
      schedule_items: {
        Row: {
          course_id: string
          created_at: string
          day: string
          end_time: string
          id: string
          location: string | null
          plan_id: string
          start_time: string
        }
        Insert: {
          course_id: string
          created_at?: string
          day: string
          end_time: string
          id?: string
          location?: string | null
          plan_id: string
          start_time: string
        }
        Update: {
          course_id?: string
          created_at?: string
          day?: string
          end_time?: string
          id?: string
          location?: string | null
          plan_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "schedule_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_plans: {
        Row: {
          created_at: string
          id: string
          name: string
          semester: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          semester: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          semester?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          department: string
          entry_year: number
          id: string
          name: string
          student_id: string
        }
        Insert: {
          created_at?: string
          department: string
          entry_year: number
          id: string
          name: string
          student_id: string
        }
        Update: {
          created_at?: string
          department?: string
          entry_year?: number
          id?: string
          name?: string
          student_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
