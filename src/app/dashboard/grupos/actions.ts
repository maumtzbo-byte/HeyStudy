"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStudentProfile } from "@/lib/auth/getCurrentUser";
import { runAction, type ActionResult } from "@/lib/actions/result";
import {
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  shareTodayPlanWithGroup,
  unsharePlanFromGroup,
} from "@/services/groups/studyGroupService";
import { track } from "@/lib/analytics/server";

export async function createGroupAction(_prev: ActionResult | undefined, formData: FormData) {
  return runAction(async () => {
    const { user, studentProfile } = await requireStudentProfile();
    const groupId = await createStudyGroup(studentProfile.id, String(formData.get("name") ?? ""));
    await track(user.id, "group_joined", { via: "created" });
    revalidatePath("/dashboard/grupos");
    // runAction reenvía el error de control de flujo de redirect(), así que
    // esto navega en vez de tragarse la excepción.
    redirect(`/dashboard/grupos/${groupId}`);
  });
}

export async function joinGroupAction(_prev: ActionResult | undefined, formData: FormData) {
  return runAction(async () => {
    const { user, studentProfile } = await requireStudentProfile();
    const groupId = await joinStudyGroup(studentProfile.id, String(formData.get("joinCode") ?? ""));
    await track(user.id, "group_joined", { via: "code" });
    revalidatePath("/dashboard/grupos");
    redirect(`/dashboard/grupos/${groupId}`);
  });
}

export async function leaveGroupAction(groupId: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await leaveStudyGroup(studentProfile.id, groupId);
    revalidatePath("/dashboard/grupos");
    redirect("/dashboard/grupos");
  });
}

export async function shareTodayPlanAction(groupId: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await shareTodayPlanWithGroup(studentProfile.id, groupId);
    revalidatePath(`/dashboard/grupos/${groupId}`);
  });
}

export async function unsharePlanAction(groupId: string, sharedPlanId: string) {
  return runAction(async () => {
    const { studentProfile } = await requireStudentProfile();
    await unsharePlanFromGroup(studentProfile.id, sharedPlanId);
    revalidatePath(`/dashboard/grupos/${groupId}`);
  });
}
