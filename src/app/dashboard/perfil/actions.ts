"use server";

import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/services/account/deleteAccountService";
import { runAction, type ActionResult, UserFacingError } from "@/lib/actions/result";

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
