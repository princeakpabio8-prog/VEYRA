/**
 * Voice provider abstraction.
 *
 * All voice infrastructure (Twilio, Vapi, Retell AI, etc.) must be accessed
 * through this interface. VEYRA is never coupled to a single vendor.
 *
 * Concrete adapters live in lib/voice/providers/.
 * Only the adapter factory (lib/voice/index.ts) is imported from application code.
 */

export interface VoiceCallOptions {
  to: string;               // Destination phone number (E.164)
  from: string;             // Caller ID (E.164)
  deploymentId: string;     // Which deployment is placing this call
  webhookUrl: string;       // Where the provider should send status updates
  metadata?: Record<string, unknown>;
}

export interface VoiceCallResult {
  providerCallId: string;   // The call ID assigned by the external provider
  status: "initiated" | "failed";
  error?: string;
}

export interface ActiveCallControl {
  providerCallId: string;
  end(): Promise<void>;
}

/**
 * The contract every voice provider adapter must satisfy.
 */
export interface VoiceProvider {
  readonly name: string;

  /**
   * Initiate an outbound call.
   */
  initiateCall(options: VoiceCallOptions): Promise<VoiceCallResult>;

  /**
   * Validate a webhook payload received from the provider.
   * Returns the normalised event, or null if the signature is invalid.
   */
  validateWebhook(
    payload: unknown,
    signature: string
  ): Promise<VoiceWebhookEvent | null>;
}

// ─── Normalised webhook events ────────────────────────────────────────────────

export type VoiceWebhookEvent =
  | CallInitiatedEvent
  | CallAnsweredEvent
  | CallEndedEvent
  | CallFailedEvent;

interface BaseEvent {
  providerCallId: string;
  deploymentId: string;
  occurredAt: string;  // ISO-8601
}

export interface CallInitiatedEvent extends BaseEvent {
  type: "call.initiated";
}

export interface CallAnsweredEvent extends BaseEvent {
  type: "call.answered";
}

export interface CallEndedEvent extends BaseEvent {
  type: "call.ended";
  durationSeconds: number;
  recordingUrl: string | null;
  transcriptUrl: string | null;
}

export interface CallFailedEvent extends BaseEvent {
  type: "call.failed";
  reason: string;
}
