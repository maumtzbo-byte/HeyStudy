"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireAuthUser } from "@/lib/auth/getCurrentUser";
import { onboardingSchema } from "@/lib/validation/onboardingSchemas";
import { completeOnboarding } from "@/services/onboarding/onboardingService";
import { REFERRAL_COOKIE_NAME, isValidReferralCode } from "@/lib/referrals/cookie";
import { track, identifyUser } from "@/lib/analytics/server";

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
    admissionTargetId: formData.get("admissionTargetId"),
    subjectNames,
    schoolCalendarUrl: formData.get("schoolCalendarUrl") ?? "",
    ageConfirmed: formData.get("ageConfirmed"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const cookieStore = await cookies();
  const rawReferralCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value ?? null;
  const referralCode = rawReferralCode && isValidReferralCode(rawReferralCode) ? rawReferralCode : null;

  await completeOnboarding({ userId: user.id, input: parsed.data, referralCode });

  // Va antes del redirect: redirect() lanza para navegar, así que cualquier
  // cosa después de él no corre nunca.
  await identifyUser(user.id, {
    education_level: parsed.data.educationLevel,
    preferred_study_method: parsed.data.preferredStudyMethod,
    plan: "FREE",
  });
  await track(user.id, "onboarding_completed", {
    has_admission_target: Boolean(parsed.data.admissionTargetId),
    subjects_count: parsed.data.subjectNames.length,
    referred: Boolean(referralCode),
  });

  cookieStore.delete(REFERRAL_COOKIE_NAME);
  redirect("/dashboard");
}
