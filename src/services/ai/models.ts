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

// Prompt caching (tutor): un token leído de caché cuesta ~0.1x el precio de
// input normal, uno escrito por primera vez ~1.25x (TTL de 5 min, el
// default). Sin esto, el costo estimado de una conversación larga con el
// tutor se ve artificialmente bajo en cuanto la caché empieza a pegar,
// porque cache_creation/cache_read_input_tokens no son lo mismo que
// input_tokens pero tampoco son gratis.
const CACHE_WRITE_MULTIPLIER = 1.25;
const CACHE_READ_MULTIPLIER = 0.1;

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens = 0,
  cacheReadTokens = 0,
): number {
  const pricing = MODEL_PRICING_PER_MTOK[model];
  if (!pricing) return 0;
  const inputPricePerTok = pricing.input / 1_000_000;
  return (
    inputTokens * inputPricePerTok +
    outputTokens * (pricing.output / 1_000_000) +
    cacheCreationTokens * inputPricePerTok * CACHE_WRITE_MULTIPLIER +
    cacheReadTokens * inputPricePerTok * CACHE_READ_MULTIPLIER
  );
}
