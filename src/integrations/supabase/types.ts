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
      courses: {
        Row: {
          category: Database["public"]["Enums"]["course_category"]
          classroom: string | null
          course_code: string
          course_id: string
          course_name: string
          credit: number
          department_id: string
          grade: number | null
          schedule_time: string
        }
        Insert: {
          category: Database["public"]["Enums"]["course_category"]
          classroom?: string | null
          course_code: string
          course_id?: string
          course_name: string
          credit: number
          department_id: string
          grade?: number | null
          schedule_time: string
        }
        Update: {
          category?: Database["public"]["Enums"]["course_category"]
          classroom?: string | null
          course_code?: string
          course_id?: string
          course_name?: string
          credit?: number
          department_id?: string
          grade?: number | null
          schedule_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
        ]
      }
      departments: {
        Row: {
          department_id: string
          department_name: string
        }
        Insert: {
          department_id?: string
          department_name: string
        }
        Update: {
          department_id?: string
          department_name?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          enrollment_id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          enrollment_id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          enrollment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["course_id"]
          },
        ]
      }
      graduation_requirements: {
        Row: {
          department_id: string
          required_basic_general: number
          required_distribution: number
          required_free: number
          required_industry: number
          required_major_basic: number
          required_major_elective: number
          required_major_required: number
          required_total_credits: number
          requirement_id: string
        }
        Insert: {
          department_id: string
          required_basic_general?: number
          required_distribution?: number
          required_free?: number
          required_industry?: number
          required_major_basic?: number
          required_major_elective?: number
          required_major_required?: number
          required_total_credits: number
          requirement_id?: string
        }
        Update: {
          department_id?: string
          required_basic_general?: number
          required_distribution?: number
          required_free?: number
          required_industry?: number
          required_major_basic?: number
          required_major_elective?: number
          required_major_required?: number
          required_total_credits?: number
          requirement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "graduation_requirements_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
        ]
      }
      prerequisites: {
        Row: {
          course_id: string
          created_at: string | null
          prerequisite_course_id: string
          prerequisite_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          prerequisite_course_id: string
          prerequisite_id?: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          prerequisite_course_id?: string
          prerequisite_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prerequisites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "prerequisites_prerequisite_course_id_fkey"
            columns: ["prerequisite_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["course_id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          description_tags: string[] | null
          schedule_id: string
          schedule_json: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          description_tags?: string[] | null
          schedule_id?: string
          schedule_json: Json
          user_id: string
        }
        Update: {
          created_at?: string
          description_tags?: string[] | null
          schedule_id?: string
          schedule_json?: Json
          user_id?: string
        }
        Relationships: []
      }
      temp_courses_with_names: {
        Row: {
          category: string | null
          classroom: string | null
          course_code: string | null
          course_name: string | null
          credit: number | null
          department_name: string | null
          schedule_time: string | null
        }
        Insert: {
          category?: string | null
          classroom?: string | null
          course_code?: string | null
          course_name?: string | null
          credit?: number | null
          department_name?: string | null
          schedule_time?: string | null
        }
        Update: {
          category?: string | null
          classroom?: string | null
          course_code?: string | null
          course_name?: string | null
          credit?: number | null
          department_name?: string | null
          schedule_time?: string | null
        }
        Relationships: []
      }
      temp_gen_courses_with_names: {
        Row: {
          category: string | null
          classroom: string | null
          course_code: string | null
          course_name: string | null
          credit: number | null
          department_name: string | null
          schedule_time: string | null
        }
        Insert: {
          category?: string | null
          classroom?: string | null
          course_code?: string | null
          course_name?: string | null
          credit?: number | null
          department_name?: string | null
          schedule_time?: string | null
        }
        Update: {
          category?: string | null
          classroom?: string | null
          course_code?: string | null
          course_name?: string | null
          credit?: number | null
          department_name?: string | null
          schedule_time?: string | null
        }
        Relationships: []
      }
      temp_temp_courses: {
        Row: {
          category: string | null
          classroom: string | null
          course_code: string | null
          course_name: string | null
          credit: number | null
          department_id: string | null
          grade: number | null
          schedule_time: string | null
        }
        Insert: {
          category?: string | null
          classroom?: string | null
          course_code?: string | null
          course_name?: string | null
          credit?: number | null
          department_id?: string | null
          grade?: number | null
          schedule_time?: string | null
        }
        Update: {
          category?: string | null
          classroom?: string | null
          course_code?: string | null
          course_name?: string | null
          credit?: number | null
          department_id?: string | null
          grade?: number | null
          schedule_time?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          department_id: string
          grade: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          grade: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          grade?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
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
      course_category:
        | "전공필수"
        | "전공선택"
        | "전공기초"
        | "배분이수교과"
        | "자유이수교과"
        | "산학필수"
        | "기초교과"
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
