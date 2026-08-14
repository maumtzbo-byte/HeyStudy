import { prisma } from "@/lib/prisma/client";
import { estimateCostUsd } from "@/services/ai/models";

export async function logAIUsage(params: {
  userId: string;
  model: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
}) {
  const estimatedCostUsd = estimateCostUsd(params.model, params.inputTokens, params.outputTokens);

  await prisma.aIUsageLog.create({
    data: {
      userId: params.userId,
      model: params.model,
      feature: params.feature,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      estimatedCostUsd,
    },
  });
}
