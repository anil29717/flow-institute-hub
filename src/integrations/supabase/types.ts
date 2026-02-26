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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          batch_id: string | null
          created_at: string | null
          date: string
          id: string
          marked_by: string | null
          status: string
          student_name: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          marked_by?: string | null
          status?: string
          student_name: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          marked_by?: string | null
          status?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          course_id: string | null
          created_at: string | null
          current_students: number | null
          end_date: string
          id: string
          max_students: number
          name: string
          start_date: string
          status: string
          teacher_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          current_students?: number | null
          end_date: string
          id?: string
          max_students?: number
          name: string
          start_date: string
          status?: string
          teacher_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          current_students?: number | null
          end_date?: string
          id?: string
          max_students?: number
          name?: string
          start_date?: string
          status?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number
          id: string
          is_active: boolean | null
          name: string
          total_fee: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number
          id?: string
          is_active?: boolean | null
          name: string
          total_fee?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number
          id?: string
          is_active?: boolean | null
          name?: string
          total_fee?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          rating: number
          review_date: string | null
          reviewer_name: string | null
          teacher_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          rating: number
          review_date?: string | null
          reviewer_name?: string | null
          teacher_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          review_date?: string | null
          reviewer_name?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          paid_date: string | null
          receipt_no: string | null
          status: string
          student_name: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          paid_date?: string | null
          receipt_no?: string | null
          status?: string
          student_name: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          paid_date?: string | null
          receipt_no?: string | null
          status?: string
          student_name?: string
        }
        Relationships: []
      }
      institutes: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          logo_url: string | null
          name: string
          owner_user_id: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          logo_url?: string | null
          name: string
          owner_user_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          logo_url?: string | null
          name?: string
          owner_user_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          approved_by: string | null
          created_at: string | null
          end_date: string
          id: string
          leave_type: string
          reason: string
          start_date: string
          status: string
          teacher_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          leave_type: string
          reason: string
          start_date: string
          status?: string
          teacher_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          start_date?: string
          status?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          institute_id: string | null
          is_active: boolean | null
          last_name: string
          phone: string | null
          profile_pic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          institute_id?: string | null
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          profile_pic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          institute_id?: string | null
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          profile_pic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          batch_id: string | null
          class: string | null
          course_id: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          enrollment_date: string
          fee_paid: number | null
          fee_status: string
          first_name: string
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          institute_id: string | null
          is_active: boolean
          last_name: string
          phone: string | null
          school: string | null
          student_id: string
          total_fee: number | null
          updated_at: string | null
        }
        Insert: {
          batch_id?: string | null
          class?: string | null
          course_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          enrollment_date?: string
          fee_paid?: number | null
          fee_status?: string
          first_name: string
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          institute_id?: string | null
          is_active?: boolean
          last_name: string
          phone?: string | null
          school?: string | null
          student_id: string
          total_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_id?: string | null
          class?: string | null
          course_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          enrollment_date?: string
          fee_paid?: number | null
          fee_status?: string
          first_name?: string
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          institute_id?: string | null
          is_active?: boolean
          last_name?: string
          phone?: string | null
          school?: string | null
          student_id?: string
          total_fee?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          employee_id: string
          experience_years: number | null
          id: string
          institute_id: string | null
          join_date: string
          profile_id: string
          qualification: string | null
          specialization: string[] | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          experience_years?: number | null
          id?: string
          institute_id?: string | null
          join_date?: string
          profile_id: string
          qualification?: string | null
          specialization?: string[] | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          experience_years?: number | null
          id?: string
          institute_id?: string | null
          join_date?: string
          profile_id?: string
          qualification?: string | null
          specialization?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_teacher_id: { Args: { _user_id: string }; Returns: string }
      get_user_institute_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "teacher" | "admin"
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
      app_role: ["owner", "teacher", "admin"],
    },
  },
} as const
