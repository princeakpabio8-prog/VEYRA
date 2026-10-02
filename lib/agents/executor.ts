/**
 * AgentExecutor — core abstraction for VEYRA agent execution.
 *
 * Architecture:
 *   Customer → VEYRA Deployment → AgentExecutor → Task status → Task result
 *
 * The executor interface is intentionally minimal. Each agent's input/result
 * types are defined separately in lib/agents/registry.ts.
 *
 * Mock executors live in this file. When real integrations are ready:
 *   1. Create RealArclioExecutor, RealProcureCallExecutor, RealServexaExecutor
 *   2. Swap in getExecutor() below — no other code changes required.
 *
 * IMPORTANT: Mock executors do NOT claim real external execution occurred.
 * All simulated results are clearly marked executor_type = 'mock'.
 */

// ─── Core types ───────────────────────────────────────────────────────────────

export interface TaskInput {
  /** Generic free-form input — agent-specific shape defined in registry */
  [key: string]: unknown;
}

export interface TaskResult {
  /** Whether the simulated execution succeeded */
  success: boolean;
  /** Human-readable summary */
  summary: string;
  /** Structured data — agent-specific shape */
  data: Record<string, unknown>;
  /** Always set for mock executors; will be false for real integrations */
  is_demo: boolean;
  /** ISO timestamp of when the result was generated */
  completed_at: string;
}

export interface TaskExecution {
  /** Status after calling executeTask */
  status: "queued" | "working" | "completed" | "failed";
  /**
   * executor_type is always explicit.
   * 'mock' = simulated demo result.
   * 'real' = real external agent was called (not implemented yet).
   */
  executor_type: "mock" | "real";
  result: TaskResult | null;
  error_message: string | null;
}

/**
 * AgentExecutor interface.
 *
 * Future real integrations will need:
 *   - authenticated task submission (API key or OAuth token)
 *   - deployment identifier to scope the task
 *   - task identifier for polling/webhook
 *   - status polling or webhook callback URL
 *   - structured result retrieval
 *   - error/retry handling
 *
 * The interface below encapsulates all of that behind executeTask().
 * Real executors should implement polling internally and resolve when complete,
 * or return status:'working' and implement getTaskStatus() for async workflows.
 */
export interface AgentExecutor {
  /** The agent slug this executor handles */
  readonly agentSlug: string;

  /**
   * Submit a task for execution.
   * Mock executors return synchronously with a simulated result.
   * Real executors may return status:'working' and require polling.
   */
  executeTask(
    deploymentId: string,
    input: TaskInput
  ): Promise<TaskExecution>;
}

// ─── Mock Arclio Executor ─────────────────────────────────────────────────────

export class MockArclioExecutor implements AgentExecutor {
  readonly agentSlug = "arclio";

  async executeTask(
    _deploymentId: string,
    input: TaskInput
  ): Promise<TaskExecution> {
    const task = (input.task as string) || "business task";
    const context = (input.context as string) || "";

    return {
      status: "completed",
      executor_type: "mock",
      error_message: null,
      result: {
        success: true,
        is_demo: true,
        completed_at: new Date().toISOString(),
        summary: `Arclio processed your request: "${task}"`,
        data: {
          steps_taken: [
            { step: 1, action: "Understood request", detail: `Parsed: "${task}"${context ? ` with context: "${context}"` : ""}` },
            { step: 2, action: "Planned execution", detail: "Identified 3 actions to complete the task" },
            { step: 3, action: "Executed actions", detail: "Completed all planned steps using available tools" },
            { step: 4, action: "Verified result", detail: "Confirmed task outcome meets the original objective" },
          ],
          outcome: "completed",
          actions_performed: [
            "Reviewed relevant business data",
            "Identified key action items",
            "Prepared and organised task output",
          ],
          next_steps: [
            "Review the output and confirm it meets your needs",
            "Connect business tools to let Arclio act on your behalf",
          ],
          demo_note: "This is a simulated result. Connect Arclio to your business tools to enable real execution.",
        },
      },
    };
  }
}

// ─── Mock ProcureCall Executor ────────────────────────────────────────────────

export class MockProcureCallExecutor implements AgentExecutor {
  readonly agentSlug = "procurecall";

  async executeTask(
    _deploymentId: string,
    input: TaskInput
  ): Promise<TaskExecution> {
    const objective = (input.objective as string) || "procurement objective";
    const supplierNumbers = (input.supplier_numbers as string) || "";
    const suppliers = supplierNumbers
      .split(/[\n,]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    const supplierCount = suppliers.length || 2;
    const mockSuppliers = suppliers.length > 0 ? suppliers : ["Supplier A", "Supplier B"];

    const supplierResults = mockSuppliers.slice(0, Math.min(supplierCount, 4)).map((supplier, i) => ({
      supplier_name: supplier,
      phone: supplier.match(/^\+?\d/) ? supplier : `+234-${800 + i}-${String(1000 + i * 111).padStart(4, "0")}-${String(2000 + i * 222).padStart(4, "0")}`,
      call_duration_seconds: 180 + i * 45,
      outcome: "Conversation completed",
      moq: [250, 500, 1000, 2000][i % 4],
      unit_price_ngn: [850, 720, 680, 610][i % 4],
      availability: ["In stock — ready to ship", "Available — 3–5 day lead time", "Low stock — order soon", "Available — 7-day lead time"][i % 4],
      delivery_terms: ["Ex-works Lagos", "DDP Abuja", "FOB Lagos port", "CIF destination"][i % 4],
      payment_terms: ["50% upfront, 50% on delivery", "Net 30", "100% upfront", "Letter of credit"][i % 4],
      notes: i === 0 ? "Supplier expressed willingness to negotiate on bulk orders" : i === 1 ? "Currently running a promotion for Q4" : "Standard terms apply",
    }));

    return {
      status: "completed",
      executor_type: "mock",
      error_message: null,
      result: {
        success: true,
        is_demo: true,
        completed_at: new Date().toISOString(),
        summary: `ProcureCall contacted ${supplierResults.length} supplier${supplierResults.length !== 1 ? "s" : ""} for: "${objective}"`,
        data: {
          objective,
          total_suppliers_contacted: supplierResults.length,
          conversations_completed: supplierResults.length,
          supplier_results: supplierResults,
          best_price: {
            supplier: supplierResults.reduce((a, b) => a.unit_price_ngn < b.unit_price_ngn ? a : b).supplier_name,
            unit_price_ngn: Math.min(...supplierResults.map(s => s.unit_price_ngn)),
          },
          recommendation: `${supplierResults[0].supplier_name} offers the best overall terms when considering price, availability, and delivery.`,
          demo_note: "This is a simulated procurement call result. Real ProcureCall integration will place actual outbound calls to suppliers.",
        },
      },
    };
  }
}

// ─── Mock Servexa Executor ────────────────────────────────────────────────────

export class MockServexaExecutor implements AgentExecutor {
  readonly agentSlug = "servexa";

  async executeTask(
    _deploymentId: string,
    input: TaskInput
  ): Promise<TaskExecution> {
    const objective = (input.objective as string) || "customer outreach";
    const customerNumbers = (input.customer_numbers as string) || "";
    const tags = (input.customer_tags as string) || "";

    const customers = customerNumbers
      .split(/[\n,]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    const customerCount = customers.length || 2;
    const mockCustomers = customers.length > 0 ? customers : ["Customer A", "Customer B"];

    const outcomes = ["Confirmed", "Will call back", "Payment scheduled", "Requested more time", "Confirmed"];
    const details: Record<string, string> = {
      "Confirmed": "Customer confirmed they are aware and agreed to proceed.",
      "Will call back": "Customer asked for a callback in 2 hours to confirm.",
      "Payment scheduled": "Customer set a payment date for 3 days from now.",
      "Requested more time": "Customer requested a 7-day extension.",
    };

    const customerResults = mockCustomers.slice(0, Math.min(customerCount, 5)).map((customer, i) => ({
      customer_identifier: customer,
      call_duration_seconds: 90 + i * 30,
      call_status: "completed",
      outcome: outcomes[i % outcomes.length],
      outcome_detail: details[outcomes[i % outcomes.length]] || "Call completed successfully.",
      tags_used: tags ? tags.split(",").map((t: string) => t.trim()).slice(0, 2) : [],
      follow_up_required: i % 3 === 1,
      follow_up_note: i % 3 === 1 ? "Call back in 2 hours as requested" : null,
    }));

    const confirmed = customerResults.filter(c => c.outcome === "Confirmed" || c.outcome === "Payment scheduled").length;

    return {
      status: "completed",
      executor_type: "mock",
      error_message: null,
      result: {
        success: true,
        is_demo: true,
        completed_at: new Date().toISOString(),
        summary: `Servexa contacted ${customerResults.length} customer${customerResults.length !== 1 ? "s" : ""} for: "${objective}"`,
        data: {
          objective,
          total_customers_contacted: customerResults.length,
          conversations_completed: customerResults.length,
          positive_outcomes: confirmed,
          follow_ups_required: customerResults.filter(c => c.follow_up_required).length,
          customer_results: customerResults,
          outcome_breakdown: {
            confirmed: customerResults.filter(c => c.outcome === "Confirmed").length,
            scheduled: customerResults.filter(c => c.outcome === "Payment scheduled").length,
            pending: customerResults.filter(c => c.outcome === "Will call back" || c.outcome === "Requested more time").length,
          },
          demo_note: "This is a simulated customer outreach result. Real Servexa integration will place actual outbound calls to your customers.",
        },
      },
    };
  }
}

// ─── Executor registry ────────────────────────────────────────────────────────
// Adding a new agent: create its executor class above, register it here.
// No other code changes required in the rest of VEYRA.

const MOCK_EXECUTORS: Record<string, AgentExecutor> = {
  arclio:      new MockArclioExecutor(),
  procurecall: new MockProcureCallExecutor(),
  servexa:     new MockServexaExecutor(),
};

/**
 * Returns the appropriate executor for an agent slug.
 *
 * When real integrations exist, swap mock executors for real ones here,
 * or use an environment variable to switch between mock and real per-agent.
 *
 * Example future pattern:
 *   if (process.env.ARCLIO_API_KEY) return new RealArclioExecutor(process.env.ARCLIO_API_KEY);
 */
export function getExecutor(agentSlug: string): AgentExecutor | null {
  return MOCK_EXECUTORS[agentSlug] ?? null;
}
