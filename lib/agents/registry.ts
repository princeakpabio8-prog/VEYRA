/**
 * VEYRA Agent Registry
 *
 * Centralised metadata, deployment configuration schema, and task input schema
 * for each AI employee. Adding a new agent requires:
 *   1. Add a record here
 *   2. Add its executor in lib/agents/executor.ts
 *   3. Add agent data to the database (seed or migration)
 *
 * NO if/else agent checks anywhere else in the application.
 * All agent-specific UI and behaviour is driven by this registry.
 */

// ─── Config field definition ──────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "textarea"
  | "tel-list"   // one phone number per line
  | "select"
  | "checkbox";

export interface ConfigField {
  key: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  helpText?: string;
  options?: { value: string; label: string }[];  // for 'select'
}

// ─── Agent registry entry ─────────────────────────────────────────────────────

export interface AgentRegistryEntry {
  slug: string;
  /** Short label used inside workspace UI */
  workerTitle: string;
  /** One-sentence role description shown on My AI Employees */
  roleDescription: string;
  /** Primary question in the workspace: "What would you like..." */
  primaryPrompt: string;
  /** "Try" page prompt */
  tryPrompt: string;
  /** Fields shown during the deploy setup wizard */
  deploymentConfigFields: ConfigField[];
  /** Fields shown in the task submission interface */
  taskInputFields: ConfigField[];
  /** Simulated status steps shown during task execution */
  executionSteps: string[];
  /**
   * Integration contract for future real agent connection.
   * Documents what will be required — not implemented.
   */
  futureIntegrationContract: {
    description: string;
    requiredCapabilities: string[];
  };
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const AGENT_REGISTRY: AgentRegistryEntry[] = [
  {
    slug: "arclio",
    workerTitle: "AI Business Operator",
    roleDescription: "Your AI business operator — handles everyday business tasks.",
    primaryPrompt: "What do you need done?",
    tryPrompt: "What would you like Arclio to handle?",
    deploymentConfigFields: [
      {
        key: "business_name",
        label: "Business name",
        placeholder: "e.g. Acme Ltd.",
        type: "text",
        required: true,
        helpText: "Arclio will use this as context for your business.",
      },
      {
        key: "business_context",
        label: "What does your business do?",
        placeholder: "Briefly describe your business and what Arclio will help with...",
        type: "textarea",
        required: false,
      },
    ],
    taskInputFields: [
      {
        key: "task",
        label: "What do you need done?",
        placeholder: "e.g. Summarise today's business priorities, draft a supplier email, organise meeting notes...",
        type: "textarea",
        required: true,
      },
      {
        key: "context",
        label: "Additional context",
        placeholder: "Any extra details Arclio should know... (optional)",
        type: "textarea",
        required: false,
      },
    ],
    executionSteps: [
      "Understanding your request",
      "Planning actions",
      "Executing",
      "Verifying result",
    ],
    futureIntegrationContract: {
      description:
        "Real Arclio integration requires authenticated task submission to the Arclio API, polling or webhook-based status updates, and structured result retrieval. Arclio manages its own tool integrations internally.",
      requiredCapabilities: [
        "Authenticated task submission (API key or OAuth)",
        "Deployment scoping (deployment_id)",
        "Task status polling or webhook callback",
        "Structured result retrieval",
        "Error/retry handling",
        "Optional: tool integration passthrough for connected business apps",
      ],
    },
  },

  {
    slug: "procurecall",
    workerTitle: "AI Procurement Representative",
    roleDescription: "Contacts suppliers, gathers quotes, and returns procurement information.",
    primaryPrompt: "What do you need to find from suppliers?",
    tryPrompt: "What would you like ProcureCall to find?",
    deploymentConfigFields: [
      {
        key: "company_name",
        label: "Company name",
        placeholder: "e.g. Acme Trading Ltd.",
        type: "text",
        required: true,
        helpText: "ProcureCall will introduce itself as representing your company.",
      },
      {
        key: "procurement_context",
        label: "What does your company procure?",
        placeholder: "e.g. We source raw materials for FMCG manufacturing...",
        type: "textarea",
        required: false,
        helpText: "Background context helps ProcureCall ask better supplier questions.",
      },
    ],
    taskInputFields: [
      {
        key: "objective",
        label: "What do you need to find from suppliers?",
        placeholder: "e.g. Find MOQ and pricing for 500 units of item X. Ask about availability and delivery terms.",
        type: "textarea",
        required: true,
      },
      {
        key: "supplier_numbers",
        label: "Supplier numbers to contact",
        placeholder: "+2348001234567\n+2348009876543",
        type: "tel-list",
        required: true,
        helpText: "One phone number per line.",
      },
    ],
    executionSteps: [
      "Queued",
      "Calling suppliers",
      "Conversations in progress",
      "Collecting results",
    ],
    futureIntegrationContract: {
      description:
        "Real ProcureCall integration requires submitting outbound call jobs to the ProcureCall telephony platform, receiving conversation transcripts and extracted data via webhook or polling, and associating results with the VEYRA deployment.",
      requiredCapabilities: [
        "Outbound call job submission with supplier numbers and objective",
        "Call status polling or webhook (queued → ringing → in_progress → completed)",
        "Transcript and extraction retrieval (MOQ, price, availability, terms)",
        "Deployment/task identifier for result association",
        "Authentication between VEYRA and ProcureCall platform",
        "Rate limiting and error handling for failed calls",
      ],
    },
  },

  {
    slug: "servexa",
    workerTitle: "AI Customer Engagement Representative",
    roleDescription: "Handles outbound customer calls for follow-ups, reminders, and engagement.",
    primaryPrompt: "What should we handle with these customers?",
    tryPrompt: "What would you like Servexa to handle?",
    deploymentConfigFields: [
      {
        key: "company_name",
        label: "Company name",
        placeholder: "e.g. Acme Financial Services",
        type: "text",
        required: true,
        helpText: "Servexa will introduce itself as calling on behalf of your company.",
      },
      {
        key: "customer_context",
        label: "What kind of customer interactions will Servexa handle?",
        placeholder: "e.g. Payment reminders for overdue accounts, loan recovery follow-ups...",
        type: "textarea",
        required: false,
        helpText: "This helps Servexa adopt the right tone and approach.",
      },
    ],
    taskInputFields: [
      {
        key: "objective",
        label: "What should we handle with these customers?",
        placeholder: "e.g. Confirm payment schedule for overdue accounts. Ask customers to confirm their payment date.",
        type: "textarea",
        required: true,
      },
      {
        key: "customer_numbers",
        label: "Customer numbers to contact",
        placeholder: "+2348001234567\n+2348009876543",
        type: "tel-list",
        required: true,
        helpText: "One phone number per line.",
      },
      {
        key: "customer_tags",
        label: "Customer tags / context",
        placeholder: "e.g. overdue_30_days, high_value, loan_recovery",
        type: "text",
        required: false,
        helpText: "Tags or context to inform how Servexa approaches each customer.",
      },
    ],
    executionSteps: [
      "Queued",
      "Calling customers",
      "Conversations in progress",
      "Outcomes captured",
    ],
    futureIntegrationContract: {
      description:
        "Real Servexa integration requires submitting outbound call jobs to the Servexa telephony platform, specifying customer numbers, tags, and objective, then receiving structured outcomes via webhook or polling.",
      requiredCapabilities: [
        "Outbound call job submission with customer numbers, tags, and objective",
        "Call status polling or webhook (queued → ringing → in_progress → completed)",
        "Outcome retrieval (confirmed, scheduled, pending, etc.)",
        "Transcript retrieval per call",
        "Deployment/task identifier for result association",
        "Authentication between VEYRA and Servexa platform",
        "Rate limiting, retry, and TCPA/compliance configuration",
      ],
    },
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const registryMap = new Map<string, AgentRegistryEntry>(
  AGENT_REGISTRY.map((entry) => [entry.slug, entry])
);

/**
 * Returns the registry entry for an agent slug, or null if not registered.
 * Use this everywhere agent-specific behaviour is needed instead of if/else.
 */
export function getAgentRegistryEntry(slug: string): AgentRegistryEntry | null {
  return registryMap.get(slug) ?? null;
}

export function getAllRegistryEntries(): AgentRegistryEntry[] {
  return AGENT_REGISTRY;
}
