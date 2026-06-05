export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          email: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          email?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string | null;
        };
        Relationships: [];
      };
      saved_reports: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          title: string;
          file_name: string | null;
          readiness_score: number;
          readiness_label: string;
          parser_summary: Json;
          risk_summary: Json;
          report_preview: Json;
          partner_attribution: Json | null;
          source_type: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          file_name?: string | null;
          readiness_score: number;
          readiness_label: string;
          parser_summary: Json;
          risk_summary: Json;
          report_preview: Json;
          partner_attribution?: Json | null;
          source_type?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          file_name?: string | null;
          readiness_score?: number;
          readiness_label?: string;
          parser_summary?: Json;
          risk_summary?: Json;
          report_preview?: Json;
          partner_attribution?: Json | null;
          source_type?: string;
        };
        Relationships: [];
      };
      report_files: {
        Row: {
          id: string;
          user_id: string;
          saved_report_id: string | null;
          created_at: string;
          storage_bucket: string;
          storage_path: string;
          file_name: string;
          content_type: string | null;
          size_bytes: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          saved_report_id?: string | null;
          created_at?: string;
          storage_bucket: string;
          storage_path: string;
          file_name: string;
          content_type?: string | null;
          size_bytes?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          saved_report_id?: string | null;
          created_at?: string;
          storage_bucket?: string;
          storage_path?: string;
          file_name?: string;
          content_type?: string | null;
          size_bytes?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
