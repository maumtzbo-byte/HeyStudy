import "server-only";
import { prisma } from "@/lib/prisma/client";
import type { AITier } from "@/services/ai/models";

export async function getAITier(userId: string): Promise<AITier> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  return subscription?.plan === "PAID" ? "paid" : "free";
}
