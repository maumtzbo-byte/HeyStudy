import { prisma } from "@/lib/prisma/client";
import { estimateCostUsd } from "@/services/ai/models";

export async function logAIUsage(params: {
  userId: string;
  model: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
}) {
  const cacheCreationTokens = params.cacheCreationTokens ?? 0;
  const cacheReadTokens = params.cacheReadTokens ?? 0;
  const estimatedCostUsd = estimateCostUsd(
    params.model,
    params.inputTokens,
    params.outputTokens,
    cacheCreationTokens,
    cacheReadTokens,
  );

  await prisma.aIUsageLog.create({
    data: {
      userId: params.userId,
      model: params.model,
      feature: params.feature,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      cacheCreationTokens,
      cacheReadTokens,
      estimatedCostUsd,
    },
  });
}
