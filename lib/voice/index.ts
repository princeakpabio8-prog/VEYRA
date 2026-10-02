/**
 * Voice provider factory.
 *
 * Import this file — not individual providers — from application code.
 * Switch providers by changing VOICE_PROVIDER in .env.local.
 *
 * Usage:
 *   import { getVoiceProvider } from "@/lib/voice";
 *   const provider = getVoiceProvider();
 *   await provider.initiateCall({ ... });
 */
import type { VoiceProvider } from "./types";

type SupportedProvider = "vapi" | "twilio" | "retell";

/**
 * Returns the configured voice provider.
 * Throws at startup if the provider is unsupported — fail fast.
 */
export function getVoiceProvider(): VoiceProvider {
  const name = (process.env.VOICE_PROVIDER ?? "vapi") as SupportedProvider;

  switch (name) {
    case "vapi":
      // import("./providers/vapi") — implement when integrating Vapi
      throw new Error("Vapi provider not yet implemented. Add lib/voice/providers/vapi.ts");
    case "twilio":
      throw new Error("Twilio provider not yet implemented. Add lib/voice/providers/twilio.ts");
    case "retell":
      throw new Error("Retell provider not yet implemented. Add lib/voice/providers/retell.ts");
    default:
      throw new Error(`Unknown VOICE_PROVIDER: "${name}". Supported: vapi | twilio | retell`);
  }
}

export type { VoiceProvider, VoiceCallOptions, VoiceCallResult, VoiceWebhookEvent } from "./types";
