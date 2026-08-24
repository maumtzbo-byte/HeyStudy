"use server";

import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth/getCurrentUser";
import { onboardingSchema } from "@/lib/validation/onboardingSchemas";
import { completeOnboarding } from "@/services/onboarding/onboardingService";

export type OnboardingActionState = { error?: string } | undefined;

export async function submitOnboardingAction(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const user = await requireAuthUser();

  const subjectNames = formData
    .getAll("subjectNames")
    .map((v) => v.toString().trim())
    .filter(Boolean);

  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    educationLevel: formData.get("educationLevel"),
    subjectNames,
    ageConfirmed: formData.get("ageConfirmed"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await completeOnboarding({ userId: user.id, input: parsed.data });
  redirect("/dashboard");
}
