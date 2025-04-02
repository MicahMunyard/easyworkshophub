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
      default_inventory_items: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string
          id: string
          imageurl: string | null
          instock: number
          lastorder: string | null
          location: string | null
          minstock: number
          name: string
          price: number
          status: string
          supplier: string
          supplierid: string
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          description: string
          id?: string
          imageurl?: string | null
          instock?: number
          lastorder?: string | null
          location?: string | null
          minstock?: number
          name: string
          price?: number
          status?: string
          supplier: string
          supplierid: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string
          id?: string
          imageurl?: string | null
          instock?: number
          lastorder?: string | null
          location?: string | null
          minstock?: number
          name?: string
          price?: number
          status?: string
          supplier?: string
          supplierid?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_connections: {
        Row: {
          access_token: string | null
          auto_create_bookings: boolean | null
          connected_at: string | null
          created_at: string | null
          email_address: string
          id: string
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          auto_create_bookings?: boolean | null
          connected_at?: string | null
          created_at?: string | null
          email_address: string
          id?: string
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          auto_create_bookings?: boolean | null
          connected_at?: string | null
          created_at?: string | null
          email_address?: string
          id?: string
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
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
          time: string | null
          time_estimate: string
          updated_at: string
          user_id: string | null
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
          time?: string | null
          time_estimate: string
          updated_at?: string
          user_id?: string | null
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
          time?: string | null
          time_estimate?: string
          updated_at?: string
          user_id?: string | null
          vehicle?: string
        }
        Relationships: []
      }
      processed_emails: {
        Row: {
          booking_created: boolean
          email_id: string
          id: string
          processed_at: string
          user_id: string
        }
        Insert: {
          booking_created?: boolean
          email_id: string
          id?: string
          processed_at?: string
          user_id: string
        }
        Update: {
          booking_created?: boolean
          email_id?: string
          id?: string
          processed_at?: string
          user_id?: string
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
      social_conversations: {
        Row: {
          contact_handle: string | null
          contact_name: string
          created_at: string | null
          external_id: string | null
          id: string
          last_message_at: string | null
          platform: string
          profile_picture_url: string | null
          unread: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_handle?: string | null
          contact_name: string
          created_at?: string | null
          external_id?: string | null
          id?: string
          last_message_at?: string | null
          platform: string
          profile_picture_url?: string | null
          unread?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_handle?: string | null
          contact_name?: string
          created_at?: string | null
          external_id?: string | null
          id?: string
          last_message_at?: string | null
          platform?: string
          profile_picture_url?: string | null
          unread?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_type: string
          sent_at: string | null
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_type: string
          sent_at?: string | null
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_type?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "social_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_logins: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          password_hash: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          password_hash: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          password_hash?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_logins_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "user_technicians"
            referencedColumns: ["id"]
          },
        ]
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
          customer_email: string | null
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
          customer_email?: string | null
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
          customer_email?: string | null
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
      user_customer_vehicles: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          vehicle_info: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          vehicle_info: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          vehicle_info?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_customer_vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          last_visit: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          phone?: string | null
          status?: string
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
      user_inventory_order_items: {
        Row: {
          code: string
          created_at: string
          id: string
          itemid: string
          name: string
          order_id: string
          price: number
          quantity: number
          total: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          itemid: string
          name: string
          order_id: string
          price?: number
          quantity?: number
          total?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          itemid?: string
          name?: string
          order_id?: string
          price?: number
          quantity?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "user_inventory_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory_orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          orderdate: string
          status: string
          supplierid: string
          suppliername: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          orderdate?: string
          status?: string
          supplierid: string
          suppliername: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          orderdate?: string
          status?: string
          supplierid?: string
          suppliername?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_inventory_suppliers: {
        Row: {
          address: string | null
          category: string
          contactperson: string
          created_at: string
          email: string
          id: string
          isdefault: boolean | null
          name: string
          notes: string | null
          phone: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          category: string
          contactperson: string
          created_at?: string
          email: string
          id?: string
          isdefault?: boolean | null
          name: string
          notes?: string | null
          phone: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          contactperson?: string
          created_at?: string
          email?: string
          id?: string
          isdefault?: boolean | null
          name?: string
          notes?: string | null
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string | null
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
      user_service_bays: {
        Row: {
          created_at: string | null
          equipment: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          equipment?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          equipment?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_services: {
        Row: {
          created_at: string | null
          duration: number
          id: string
          name: string
          price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration: number
          id?: string
          name: string
          price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_technicians: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string | null
          experience: string | null
          id: string
          name: string
          specialty: string | null
          tech_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          name: string
          specialty?: string | null
          tech_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          name?: string
          specialty?: string | null
          tech_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_technician_login: {
        Args: {
          tech_id: string
          tech_email: string
          tech_password: string
        }
        Returns: undefined
      }
      update_technician_email: {
        Args: {
          tech_id: string
          new_email: string
        }
        Returns: undefined
      }
      update_technician_last_login: {
        Args: {
          tech_id: string
        }
        Returns: undefined
      }
      verify_technician_login: {
        Args: {
          tech_email: string
          tech_password: string
          workshop_user_id: string
        }
        Returns: Json
      }
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
