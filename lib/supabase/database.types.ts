/**
 * Supabase database type definitions.
 *
 * Manually authored to match migrations 0001–0003.
 * Regenerate with:
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PricingModel = "per_seat" | "per_usage" | "flat" | "free";
export type AgentStatus  = "active" | "beta" | "coming_soon" | "deprecated";
export type DeploymentStatus = "draft" | "active" | "paused" | "decommissioned";
export type TaskStatus       = "queued" | "working" | "completed" | "failed";
export type ExecutorType     = "mock" | "real";
export type AgentRequestInteraction = "voice" | "text" | "both";
export type AgentRequestStatus  = "received" | "reviewing" | "in_progress" | "completed" | "declined";
export type SupportRequestStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id:                     string;
          slug:                   string;
          name:                   string;
          tagline:                string;
          description:            string;
          avatar_url:             string | null;
          category:               string;
          pricing_model:          PricingModel;
          base_monthly_price_usd: number | null;
          status:                 AgentStatus;
          created_at:             string;
          updated_at:             string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          tagline?: string;
          description?: string;
          avatar_url?: string | null;
          category?: string;
          pricing_model?: PricingModel;
          base_monthly_price_usd?: number | null;
          status?: AgentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          tagline?: string;
          description?: string;
          avatar_url?: string | null;
          category?: string;
          pricing_model?: PricingModel;
          base_monthly_price_usd?: number | null;
          status?: AgentStatus;
          updated_at?: string;
        };
        Relationships: [];
      };

      agent_capabilities: {
        Row: {
          id:          string;
          agent_id:    string;
          name:        string;
          description: string;
          icon:        string | null;
          created_at:  string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          name: string;
          description?: string;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          icon?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "agent_capabilities_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          }
        ];
      };

      profiles: {
        Row: {
          id:           string;
          display_name: string;
          avatar_url:   string | null;
          company_name: string | null;
          role:         "owner" | "admin" | "member";
          created_at:   string;
          updated_at:   string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          company_name?: string | null;
          role?: "owner" | "admin" | "member";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          company_name?: string | null;
          role?: "owner" | "admin" | "member";
          updated_at?: string;
        };
        Relationships: [];
      };

      deployments: {
        Row: {
          id:                    string;
          tenant_id:             string;
          agent_id:              string;
          name:                  string;
          config:                Json;
          status:                DeploymentStatus;
          voice_provider_id:     string | null;
          external_callback_url: string | null;
          created_at:            string;
          updated_at:            string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          agent_id: string;
          name: string;
          config?: Json;
          status?: DeploymentStatus;
          voice_provider_id?: string | null;
          external_callback_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          config?: Json;
          status?: DeploymentStatus;
          voice_provider_id?: string | null;
          external_callback_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deployments_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          }
        ];
      };

      agent_tasks: {
        Row: {
          id:            string;
          tenant_id:     string;
          deployment_id: string;
          input:         Json;
          status:        TaskStatus;
          executor_type: ExecutorType;
          result:        Json | null;
          error_message: string | null;
          created_at:    string;
          updated_at:    string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          deployment_id: string;
          input?: Json;
          status?: TaskStatus;
          executor_type?: ExecutorType;
          result?: Json | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: TaskStatus;
          executor_type?: ExecutorType;
          result?: Json | null;
          error_message?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_tasks_deployment_id_fkey";
            columns: ["deployment_id"];
            isOneToOne: false;
            referencedRelation: "deployments";
            referencedColumns: ["id"];
          }
        ];
      };

      agent_requests: {
        Row: {
          id:                     string;
          user_id:                string;
          request_description:    string;
          business_workflow:      string;
          interaction_preference: AgentRequestInteraction;
          additional_details:     string | null;
          status:                 AgentRequestStatus;
          created_at:             string;
          updated_at:             string;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_description: string;
          business_workflow: string;
          interaction_preference?: AgentRequestInteraction;
          additional_details?: string | null;
          status?: AgentRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: AgentRequestStatus;
          updated_at?: string;
        };
        Relationships: [];
      };

      support_requests: {
        Row: {
          id:            string;
          user_id:       string;
          deployment_id: string | null;
          agent_slug:    string | null;
          description:   string;
          status:        SupportRequestStatus;
          created_at:    string;
          updated_at:    string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deployment_id?: string | null;
          agent_slug?: string | null;
          description: string;
          status?: SupportRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: SupportRequestStatus;
          updated_at?: string;
        };
        Relationships: [];
      };

      calls: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
        Relationships: [];
      };
      usage_records: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
        Relationships: [];
      };
      reviews: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
        Relationships: [];
      };
      integrations: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
        Relationships: [];
      };
    };
    Views:     Record<string, never>;
    Functions: Record<string, never>;
    Enums:     Record<string, never>;
  };
}
