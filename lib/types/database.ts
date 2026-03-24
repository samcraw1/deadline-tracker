export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "staff" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: "staff" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "staff" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          plan_type: "401k" | "403b" | "defined_benefit" | "457b" | "profit_sharing" | "other";
          participant_count: number | null;
          plan_year_end: string;
          has_safe_harbor: boolean;
          has_auto_enrollment: boolean;
          has_rmd: boolean;
          contact_email: string | null;
          contact_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan_type: "401k" | "403b" | "defined_benefit" | "457b" | "profit_sharing" | "other";
          participant_count?: number | null;
          plan_year_end: string;
          has_safe_harbor?: boolean;
          has_auto_enrollment?: boolean;
          has_rmd?: boolean;
          contact_email?: string | null;
          contact_name?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          plan_type?: "401k" | "403b" | "defined_benefit" | "457b" | "profit_sharing" | "other";
          participant_count?: number | null;
          plan_year_end?: string;
          has_safe_harbor?: boolean;
          has_auto_enrollment?: boolean;
          has_rmd?: boolean;
          contact_email?: string | null;
          contact_name?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      notice_types: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          days_before_plan_year_end: number | null;
          frequency: "annual" | "quarterly" | "one_time" | "event_driven";
          applies_to: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          days_before_plan_year_end?: number | null;
          frequency?: "annual" | "quarterly" | "one_time" | "event_driven";
          applies_to?: string[];
          is_active?: boolean;
        };
        Update: {
          name?: string;
          code?: string;
          description?: string | null;
          days_before_plan_year_end?: number | null;
          frequency?: "annual" | "quarterly" | "one_time" | "event_driven";
          applies_to?: string[];
          is_active?: boolean;
        };
        Relationships: [];
      };
      deadlines: {
        Row: {
          id: string;
          client_id: string;
          notice_type_id: string;
          due_date: string;
          status: "pending" | "sent" | "confirmed" | "overdue";
          assigned_to: string | null;
          sent_at: string | null;
          confirmed_at: string | null;
          notes: string | null;
          plan_year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          notice_type_id: string;
          due_date: string;
          status?: "pending" | "sent" | "confirmed" | "overdue";
          assigned_to?: string | null;
          sent_at?: string | null;
          confirmed_at?: string | null;
          notes?: string | null;
          plan_year: number;
        };
        Update: {
          client_id?: string;
          notice_type_id?: string;
          due_date?: string;
          status?: "pending" | "sent" | "confirmed" | "overdue";
          assigned_to?: string | null;
          sent_at?: string | null;
          confirmed_at?: string | null;
          notes?: string | null;
          plan_year?: number;
        };
        Relationships: [];
      };
      alert_log: {
        Row: {
          id: string;
          deadline_id: string;
          client_id: string;
          alert_type: "60_day" | "30_day" | "7_day" | "overdue";
          channel: "email" | "in_app" | "both";
          sent_to: string;
          sent_at: string;
          delivered: boolean;
        };
        Insert: {
          id?: string;
          deadline_id: string;
          client_id: string;
          alert_type: "60_day" | "30_day" | "7_day" | "overdue";
          channel?: "email" | "in_app" | "both";
          sent_to: string;
          sent_at?: string;
          delivered?: boolean;
        };
        Update: {
          deadline_id?: string;
          client_id?: string;
          alert_type?: "60_day" | "30_day" | "7_day" | "overdue";
          channel?: "email" | "in_app" | "both";
          sent_to?: string;
          sent_at?: string;
          delivered?: boolean;
        };
        Relationships: [];
      };
      deadline_activities: {
        Row: {
          id: string;
          deadline_id: string;
          type: "status_change" | "comment" | "assignment";
          content: string;
          user_id: string | null;
          metadata: Record<string, string> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          deadline_id: string;
          type: "status_change" | "comment" | "assignment";
          content: string;
          user_id?: string | null;
          metadata?: Record<string, string> | null;
          created_at?: string;
        };
        Update: {
          deadline_id?: string;
          type?: "status_change" | "comment" | "assignment";
          content?: string;
          user_id?: string | null;
          metadata?: Record<string, string> | null;
        };
        Relationships: [];
      };
      deadline_dependencies: {
        Row: {
          id: string;
          deadline_id: string;
          depends_on_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          deadline_id: string;
          depends_on_id: string;
          created_at?: string;
        };
        Update: {
          deadline_id?: string;
          depends_on_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
