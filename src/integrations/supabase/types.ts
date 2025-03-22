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
      bookings: {
        Row: {
          bay_id: string | null
          booking_date: string
          booking_time: string
          car: string
          cost: number | null
          created_at: string | null
          customer_name: string
          customer_phone: string
          duration: number
          id: string
          mechanic: string | null
          notes: string | null
          service: string
          service_id: string | null
          status: string
          technician_id: string | null
          updated_at: string | null
        }
        Insert: {
          bay_id?: string | null
          booking_date: string
          booking_time: string
          car: string
          cost?: number | null
          created_at?: string | null
          customer_name: string
          customer_phone: string
          duration: number
          id?: string
          mechanic?: string | null
          notes?: string | null
          service: string
          service_id?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bay_id?: string | null
          booking_date?: string
          booking_time?: string
          car?: string
          cost?: number | null
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          duration?: number
          id?: string
          mechanic?: string | null
          notes?: string | null
          service?: string
          service_id?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_bay_id_fkey"
            columns: ["bay_id"]
            isOneToOne: false
            referencedRelation: "service_bays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          content: string | null
          customer_id: number
          direction: string
          duration: number | null
          id: string
          staff_member: string | null
          status: string | null
          timestamp: string | null
          type: string
        }
        Insert: {
          content?: string | null
          customer_id: number
          direction: string
          duration?: number | null
          id?: string
          staff_member?: string | null
          status?: string | null
          timestamp?: string | null
          type: string
        }
        Update: {
          content?: string | null
          customer_id?: number
          direction?: string
          duration?: number | null
          id?: string
          staff_member?: string | null
          status?: string | null
          timestamp?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: number
          id: string
          note: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: number
          id?: string
          note: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: number
          id?: string
          note?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tag_relations: {
        Row: {
          created_at: string | null
          customer_id: number
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: number
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: number
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_tag_relations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "customer_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          assigned_to: string
          created_at: string
          customer: string
          date: string
          id: string
          priority: string
          service: string
          status: string
          time_estimate: string
          updated_at: string
          vehicle: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          customer: string
          date: string
          id: string
          priority: string
          service: string
          status: string
          time_estimate: string
          updated_at?: string
          vehicle: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          customer?: string
          date?: string
          id?: string
          priority?: string
          service?: string
          status?: string
          time_estimate?: string
          updated_at?: string
          vehicle?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: number
          phone_number: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          workshop_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: never
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          workshop_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: never
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          workshop_name?: string | null
        }
        Relationships: []
      }
      service_bays: {
        Row: {
          created_at: string | null
          equipment: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipment?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipment?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_reminders: {
        Row: {
          created_at: string | null
          customer_id: number
          due_date: string
          id: string
          last_sent_at: string | null
          notification_method: string[] | null
          reminder_text: string | null
          service_type: string
          status: string | null
          vehicle_info: string
        }
        Insert: {
          created_at?: string | null
          customer_id: number
          due_date: string
          id?: string
          last_sent_at?: string | null
          notification_method?: string[] | null
          reminder_text?: string | null
          service_type: string
          status?: string | null
          vehicle_info: string
        }
        Update: {
          created_at?: string | null
          customer_id?: number
          due_date?: string
          id?: string
          last_sent_at?: string | null
          notification_method?: string[] | null
          reminder_text?: string | null
          service_type?: string
          status?: string | null
          vehicle_info?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          duration: number
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          created_at: string | null
          experience: string | null
          id: string
          name: string
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          experience?: string | null
          id?: string
          name: string
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          experience?: string | null
          id?: string
          name?: string
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_bookings: {
        Row: {
          bay_id: string | null
          booking_date: string
          booking_time: string
          car: string
          cost: number | null
          created_at: string | null
          customer_name: string
          customer_phone: string
          duration: number
          id: string
          notes: string | null
          service: string
          service_id: string | null
          status: string | null
          technician_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bay_id?: string | null
          booking_date: string
          booking_time: string
          car: string
          cost?: number | null
          created_at?: string | null
          customer_name: string
          customer_phone: string
          duration: number
          id?: string
          notes?: string | null
          service: string
          service_id?: string | null
          status?: string | null
          technician_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bay_id?: string | null
          booking_date?: string
          booking_time?: string
          car?: string
          cost?: number | null
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          duration?: number
          id?: string
          notes?: string | null
          service?: string
          service_id?: string | null
          status?: string | null
          technician_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_inventory_items: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          in_stock: number
          last_order: string | null
          location: string | null
          min_stock: number
          name: string
          price: number | null
          status: string | null
          supplier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          in_stock?: number
          last_order?: string | null
          location?: string | null
          min_stock?: number
          name: string
          price?: number | null
          status?: string | null
          supplier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          in_stock?: number
          last_order?: string | null
          location?: string | null
          min_stock?: number
          name?: string
          price?: number | null
          status?: string | null
          supplier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_jobs: {
        Row: {
          bay_id: string | null
          cost: number | null
          created_at: string | null
          customer_name: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          technician_id: string | null
          title: string
          updated_at: string | null
          user_id: string
          vehicle: string | null
        }
        Insert: {
          bay_id?: string | null
          cost?: number | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          technician_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          vehicle?: string | null
        }
        Update: {
          bay_id?: string | null
          cost?: number | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          technician_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          vehicle?: string | null
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
