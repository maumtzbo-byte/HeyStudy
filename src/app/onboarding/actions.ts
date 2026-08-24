"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireAuthUser } from "@/lib/auth/getCurrentUser";
import { onboardingSchema } from "@/lib/validation/onboardingSchemas";
import { completeOnboarding } from "@/services/onboarding/onboardingService";
import { REFERRAL_COOKIE_NAME, isValidReferralCode } from "@/lib/referrals/cookie";

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
    preferredStudyMethod: formData.get("preferredStudyMethod"),
    subjectNames,
    ageConfirmed: formData.get("ageConfirmed"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const cookieStore = await cookies();
  const rawReferralCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value ?? null;
  const referralCode = rawReferralCode && isValidReferralCode(rawReferralCode) ? rawReferralCode : null;

  await completeOnboarding({ userId: user.id, input: parsed.data, referralCode });
  cookieStore.delete(REFERRAL_COOKIE_NAME);
  redirect("/dashboard");
}
