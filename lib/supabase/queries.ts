/**
 * Typed server-side query helpers for the VEYRA marketplace.
 *
 * All functions use the server Supabase client (cookies-based, never exposes
 * service-role key). RLS on public.agents / public.agent_capabilities allows
 * public SELECT, so no auth is required for catalogue reads.
 */
import { createClient } from "./server";
import type { Database } from "./database.types";

export type Agent       = Database["public"]["Tables"]["agents"]["Row"];
export type Capability  = Database["public"]["Tables"]["agent_capabilities"]["Row"];

/** Fetch all published agents (active + beta), ordered by name. */
export async function getActiveAgents(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .in("status", ["active", "beta"])
    .order("name");

  if (error) {
    console.error("[getActiveAgents]", error.message);
    return [];
  }
  return data ?? [];
}

/** Fetch a single agent by slug. Returns null if not found or not published. */
export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("slug", slug)
    .in("status", ["active", "beta"])
    .maybeSingle();

  if (error) {
    console.error("[getAgentBySlug]", error.message);
    return null;
  }
  return data;
}

/** Fetch capabilities for a given agent id, ordered by created_at. */
export async function getAgentCapabilities(agentId: string): Promise<Capability[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_capabilities")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at");

  if (error) {
    console.error("[getAgentCapabilities]", error.message);
    return [];
  }
  return data ?? [];
}
