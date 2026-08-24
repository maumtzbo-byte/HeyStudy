"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/services/account/deleteAccountService";
import { z } from "zod";
import {
  updatePreferredStudyMethod,
  updateReviewRemindersEnabled,
  updateWeeklyReportEnabled,
  updateDeadlineRemindersEnabled,
  updateParentEmail,
  updateParentReportEnabled,
} from "@/services/profile/profileService";
import { studyMethods } from "@/lib/validation/onboardingSchemas";
import { runAction, type ActionResult, UserFacingError } from "@/lib/actions/result";

export async function updatePreferredStudyMethodAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireAuthUser();

    const value = String(formData.get("preferredStudyMethod") ?? "");
    if (!studyMethods.includes(value as (typeof studyMethods)[number])) {
      throw new UserFacingError("Manera de estudiar inválida");
    }

    await updatePreferredStudyMethod(user.id, value as (typeof studyMethods)[number]);
    revalidatePath("/dashboard/perfil");
    revalidatePath("/dashboard");
  });
}

export async function updateReviewRemindersEnabledAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireAuthUser();
    const enabled = formData.get("reviewRemindersEnabled") === "on";
    await updateReviewRemindersEnabled(user.id, enabled);
    revalidatePath("/dashboard/perfil");
  });
}

export async function updateWeeklyReportEnabledAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireAuthUser();
    const enabled = formData.get("weeklyReportEnabled") === "on";
    await updateWeeklyReportEnabled(user.id, enabled);
    revalidatePath("/dashboard/perfil");
  });
}

export async function updateDeadlineRemindersEnabledAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireAuthUser();
    const enabled = formData.get("deadlineRemindersEnabled") === "on";
    await updateDeadlineRemindersEnabled(user.id, enabled);
    revalidatePath("/dashboard/perfil");
  });
}

export async function updateParentEmailAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireAuthUser();
    const raw = String(formData.get("parentEmail") ?? "").trim();

    if (raw === "") {
      await updateParentEmail(user.id, null);
    } else {
      const parsed = z.string().email("Correo inválido").safeParse(raw);
      if (!parsed.success) throw new UserFacingError(parsed.error.issues[0]?.message ?? "Correo inválido");
      await updateParentEmail(user.id, parsed.data);
    }

    revalidatePath("/dashboard/perfil");
  });
}

export async function updateParentReportEnabledAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireAuthUser();
    const enabled = formData.get("parentReportEnabled") === "on";
    await updateParentReportEnabled(user.id, enabled);
    revalidatePath("/dashboard/perfil");
  });
}

export async function deleteAccountAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireAuthUser();

    const confirmation = String(formData.get("confirmation") ?? "");
    if (confirmation.trim().toLowerCase() !== user.email?.toLowerCase()) {
      throw new UserFacingError("Escribe tu correo exactamente como aparece arriba para confirmar.");
    }

    await deleteAccount(user.id);

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/");
  });
}
