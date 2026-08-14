// Routing y pricing de modelos Claude. Free usa Haiku, Paid usa Sonnet
// (sección 3 y 5 del spec). Precios en USD por millón de tokens.

export type AITier = "free" | "paid";

export const MODEL_BY_TIER: Record<AITier, string> = {
  free: "claude-haiku-4-5",
  paid: "claude-sonnet-5",
};

export const MODEL_PRICING_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1.0, output: 5.0 },
  "claude-sonnet-5": { input: 3.0, output: 15.0 },
};

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING_PER_MTOK[model];
  if (!pricing) return 0;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}
