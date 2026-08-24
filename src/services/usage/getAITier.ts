import "server-only";
import { prisma } from "@/lib/prisma/client";
import type { AITier } from "@/services/ai/models";
import { getEffectivePlan } from "@/services/usage/effectivePlan";

export async function getAITier(userId: string): Promise<AITier> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) return "free";
  return getEffectivePlan(subscription) === "PAID" ? "paid" : "free";
}
