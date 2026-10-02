/**
 * VEYRA server actions — deployment experience
 *
 * All actions require authentication via requireUser().
 * tenant_id is always set to auth.uid() — RLS enforces row ownership.
 * Service-role key is never used here.
 *
 * Note: Supabase insert/update calls for tables added after initial generation
 * use `as any` to bypass strict TS inference. The runtime types are correct and
 * enforced by Supabase RLS — the `as any` is purely a TS type workaround for
 * manually authored database.types.ts.
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getExecutor } from "@/lib/agents/executor";
import type { Database } from "@/lib/supabase/database.types";

type DeploymentRow = Database["public"]["Tables"]["deployments"]["Row"];
type AgentRow      = Database["public"]["Tables"]["agents"]["Row"];
type AgentTaskRow  = Database["public"]["Tables"]["agent_tasks"]["Row"];

// ─── Enriched types returned by queries ──────────────────────────────────────

export interface DeploymentWithAgent extends DeploymentRow {
  agents: Pick<AgentRow, "id" | "slug" | "name" | "tagline" | "category" | "status"> | null;
}

// ─── Create deployment ────────────────────────────────────────────────────────

export interface CreateDeploymentInput {
  agentId: string;
  agentSlug: string;
  name: string;
  config: Record<string, unknown>;
}

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function createDeployment(
  input: CreateDeploymentInput
): Promise<ActionResult<{ deploymentId: string }>> {
  const user = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("deployments")
    .insert({
      tenant_id: user.id,
      agent_id: input.agentId,
      name: input.name,
      config: input.config,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createDeployment]", error?.message);
    return { success: false, error: "Could not create deployment. Please try again." };
  }

  revalidatePath("/my-employees");
  const row = data as { id: string };
  return { success: true, data: { deploymentId: row.id } };
}

// ─── Get user deployments ─────────────────────────────────────────────────────

export async function getUserDeployments(): Promise<DeploymentWithAgent[]> {
  const user = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("deployments")
    .select("*, agents(id, slug, name, tagline, category, status)")
    .eq("tenant_id", user.id)
    .in("status", ["active", "paused"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getUserDeployments]", error.message);
    return [];
  }
  return (data ?? []) as DeploymentWithAgent[];
}

// ─── Get single deployment ────────────────────────────────────────────────────

export async function getDeploymentById(deploymentId: string): Promise<DeploymentWithAgent | null> {
  const user = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("deployments")
    .select("*, agents(id, slug, name, tagline, category, status)")
    .eq("id", deploymentId)
    .eq("tenant_id", user.id)
    .single();

  if (error || !data) {
    console.error("[getDeploymentById]", error?.message);
    return null;
  }
  return data as DeploymentWithAgent;
}

// ─── Submit task ──────────────────────────────────────────────────────────────

export interface SubmitTaskInput {
  deploymentId: string;
  agentSlug: string;
  taskInput: Record<string, unknown>;
}

export async function submitTask(
  input: SubmitTaskInput
): Promise<ActionResult<{ taskId: string; result: unknown }>> {
  const user = await requireUser();
  const supabase = await createClient();

  // Get the executor for this agent
  const executor = getExecutor(input.agentSlug);
  if (!executor) {
    return { success: false, error: `No executor registered for agent: ${input.agentSlug}` };
  }

  // Insert task with initial status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: taskRow, error: insertError } = await (supabase as any)
    .from("agent_tasks")
    .insert({
      tenant_id: user.id,
      deployment_id: input.deploymentId,
      input: input.taskInput,
      status: "queued",
      executor_type: "mock",
    })
    .select("id")
    .single();

  if (insertError || !taskRow) {
    console.error("[submitTask] insert", insertError?.message);
    return { success: false, error: "Could not submit task. Please try again." };
  }

  const taskId = (taskRow as { id: string }).id;

  // Execute via the mock executor
  const execution = await executor.executeTask(input.deploymentId, input.taskInput);

  // Update task with result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from("agent_tasks")
    .update({
      status: execution.status,
      executor_type: execution.executor_type,
      result: execution.result as Record<string, unknown> | null,
      error_message: execution.error_message,
    })
    .eq("id", taskId)
    .eq("tenant_id", user.id);

  if (updateError) {
    console.error("[submitTask] update", updateError.message);
  }

  revalidatePath(`/my-employees/${input.deploymentId}`);

  return {
    success: true,
    data: {
      taskId,
      result: execution.result,
    },
  };
}

// ─── Get tasks for deployment ─────────────────────────────────────────────────

export async function getDeploymentTasks(deploymentId: string): Promise<AgentTaskRow[]> {
  const user = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("agent_tasks")
    .select("*")
    .eq("deployment_id", deploymentId)
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[getDeploymentTasks]", error.message);
    return [];
  }
  return (data ?? []) as AgentTaskRow[];
}

// ─── Request an AI employee ───────────────────────────────────────────────────

export interface AgentRequestInput {
  requestDescription: string;
  businessWorkflow: string;
  interactionPreference: "voice" | "text" | "both";
  additionalDetails?: string;
}

export async function createAgentRequest(
  input: AgentRequestInput
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("agent_requests")
    .insert({
      user_id: user.id,
      request_description: input.requestDescription,
      business_workflow: input.businessWorkflow,
      interaction_preference: input.interactionPreference,
      additional_details: input.additionalDetails ?? null,
      status: "received",
    });

  if (error) {
    console.error("[createAgentRequest]", error.message);
    return { success: false, error: "Could not submit request. Please try again." };
  }

  return { success: true };
}

// ─── Request human help ───────────────────────────────────────────────────────

export interface SupportRequestInput {
  description: string;
  deploymentId?: string;
  agentSlug?: string;
}

export async function createSupportRequest(
  input: SupportRequestInput
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("support_requests")
    .insert({
      user_id: user.id,
      deployment_id: input.deploymentId ?? null,
      agent_slug: input.agentSlug ?? null,
      description: input.description,
      status: "open",
    });

  if (error) {
    console.error("[createSupportRequest]", error.message);
    return { success: false, error: "Could not submit request. Please try again." };
  }

  return { success: true };
}

// ─── Deploy and redirect ──────────────────────────────────────────────────────

export async function deployAndRedirect(input: CreateDeploymentInput): Promise<void> {
  const result = await createDeployment(input);
  if (result.success && result.data) {
    redirect(`/my-employees/${result.data.deploymentId}`);
  }
}
