"use server";

import { revalidatePath } from "next/cache";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { runAction, type ActionResult } from "@/lib/actions/result";
import { sendFriendRequest, respondToFriendRequest, removeFriendship } from "@/services/friends/friendService";

export async function sendFriendRequestAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await sendFriendRequest(studentProfile.id, String(formData.get("username") ?? ""));
    revalidatePath("/dashboard/amigos");
  });
}

export async function respondFriendRequestAction(friendshipId: string, accept: boolean) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await respondToFriendRequest(studentProfile.id, friendshipId, accept);
    revalidatePath("/dashboard/amigos");
  });
}

export async function removeFriendAction(friendshipId: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await removeFriendship(studentProfile.id, friendshipId);
    revalidatePath("/dashboard/amigos");
  });
}
