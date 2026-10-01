"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";
import {
  clearAdminSession,
  createAdminSession,
  createJudgeSession,
  clearJudgeSession,
  getJudgeSession,
  requireAdmin,
} from "@/lib/auth";
import { ensureAdminSeeded, prisma } from "@/lib/db";
import { clampMark, newPrivateToken, normalizeGrade } from "@/lib/utils";

function fail(message: string) {
  return { ok: false as const, error: message };
}
function ok<T extends Record<string, unknown> = Record<string, never>>(data?: T) {
  return { ok: true as const, ...(data ?? ({} as T)) };
}

export async function adminLoginAction(formData: FormData) {
  await ensureAdminSeeded();
  const password = String(formData.get("password") ?? "");
  const admin = await prisma.adminCredential.findFirst();
  if (!admin) return fail("Admin not configured");
  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) return fail("Invalid password");
  await createAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/login");
}

export async function createJudgeAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return fail("Name is required");
  const exists = await prisma.judge.findUnique({ where: { name } });
  if (exists) return fail("Judge already exists");
  await prisma.judge.create({ data: { name } });
  revalidatePath("/admin/judges");
  revalidatePath("/admin");
  return ok();
}

const itemSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(1),
  judge1Id: z.string().min(1),
  judge2Id: z.string().min(1),
});

export async function createItemAction(formData: FormData) {
  await requireAdmin();
  const parsed = itemSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    judge1Id: String(formData.get("judge1Id") ?? ""),
    judge2Id: String(formData.get("judge2Id") ?? ""),
  });
  if (!parsed.success) return fail("Check item fields");
  if (parsed.data.judge1Id === parsed.data.judge2Id) {
    return fail("Choose two different judges");
  }
  const codeTaken = await prisma.item.findUnique({ where: { code: parsed.data.code } });
  if (codeTaken) return fail("Item code already used");
  const item = await prisma.item.create({
    data: {
      ...parsed.data,
      privateToken: newPrivateToken(),
    },
  });
  revalidatePath("/admin");
  redirect(`/admin/items/${item.id}/participants`);
}

export async function updateItemAction(itemId: string, formData: FormData) {
  await requireAdmin();
  const parsed = itemSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    judge1Id: String(formData.get("judge1Id") ?? ""),
    judge2Id: String(formData.get("judge2Id") ?? ""),
  });
  if (!parsed.success) return fail("Check item fields");
  if (parsed.data.judge1Id === parsed.data.judge2Id) {
    return fail("Choose two different judges");
  }
  const clash = await prisma.item.findFirst({
    where: { code: parsed.data.code, NOT: { id: itemId } },
  });
  if (clash) return fail("Item code already used");
  await prisma.item.update({ where: { id: itemId }, data: parsed.data });
  revalidatePath("/admin");
  revalidatePath(`/admin/items/${itemId}`);
  return ok();
}

export async function deleteItemAction(itemId: string) {
  await requireAdmin();
  await prisma.item.delete({ where: { id: itemId } });
  revalidatePath("/admin");
  revalidatePath("/results");
  revalidatePath(`/results/${itemId}`);
}

export async function addParticipantAction(itemId: string, formData: FormData) {
  await requireAdmin();
  const chestNo = String(formData.get("chestNo") ?? "").trim();
  const codeLetter = String(formData.get("codeLetter") ?? "").trim().toUpperCase();
  const slRaw = String(formData.get("slNo") ?? "").trim();
  if (!chestNo || !codeLetter) return fail("Chest no and code letter required");

  const max = await prisma.participant.aggregate({
    where: { itemId },
    _max: { slNo: true },
  });
  const slNo = slRaw ? Number(slRaw) : (max._max.slNo ?? 0) + 1;
  if (!Number.isInteger(slNo) || slNo < 1) return fail("Invalid SL no");

  try {
    await prisma.participant.create({
      data: { itemId, slNo, chestNo, codeLetter },
    });
  } catch {
    return fail("Duplicate SL, chest no, or code letter");
  }
  revalidatePath(`/admin/items/${itemId}/participants`);
  revalidatePath(`/admin/items/${itemId}/results`);
  return ok();
}

export async function deleteParticipantAction(itemId: string, participantId: string) {
  await requireAdmin();
  await prisma.participant.delete({ where: { id: participantId } });
  revalidatePath(`/admin/items/${itemId}/participants`);
  revalidatePath(`/admin/items/${itemId}/results`);
  return ok();
}

export async function judgeLoginAction(token: string, formData: FormData) {
  const judgeId = String(formData.get("judgeId") ?? "");
  const item = await prisma.item.findUnique({
    where: { privateToken: token },
    include: { judge1: true, judge2: true },
  });
  if (!item) return fail("Invalid link");
  if (judgeId !== item.judge1Id && judgeId !== item.judge2Id) {
    return fail("Not assigned to this item");
  }
  const judge = judgeId === item.judge1Id ? item.judge1 : item.judge2;
  await createJudgeSession({
    judgeId: judge.id,
    itemId: item.id,
    judgeName: judge.name,
  });
  redirect(`/judge/${token}/score`);
}

export async function judgeLogoutAction(token: string) {
  await clearJudgeSession();
  redirect(`/judge/${token}`);
}

export async function saveJudgeScoresAction(
  token: string,
  scores: { participantId: string; mark: string; grade: string; remark: string }[],
) {
  const session = await getJudgeSession();
  if (!session) return fail("Session expired — log in again");
  const item = await prisma.item.findUnique({ where: { privateToken: token } });
  if (!item || item.id !== session.itemId) return fail("Wrong item");
  const submission = await prisma.judgeSubmission.findUnique({
    where: { itemId_judgeId: { itemId: item.id, judgeId: session.judgeId } },
  });
  if (submission?.submittedAt) return fail("Already submitted — ask admin to unlock");

  for (const row of scores) {
    const markNum = row.mark === "" ? null : clampMark(Number(row.mark));
    if (row.mark !== "" && markNum === null) return fail("Marks must be 0–100");
    const grade = row.grade ? normalizeGrade(row.grade) : null;
    await prisma.score.upsert({
      where: {
        participantId_judgeId: {
          participantId: row.participantId,
          judgeId: session.judgeId,
        },
      },
      create: {
        participantId: row.participantId,
        judgeId: session.judgeId,
        mark: markNum,
        grade,
        remark: row.remark.trim() || null,
      },
      update: {
        mark: markNum,
        grade,
        remark: row.remark.trim() || null,
      },
    });
  }
  revalidatePath(`/judge/${token}/score`);
  revalidatePath(`/admin/items/${item.id}/results`);
  revalidatePath("/admin");
  return ok();
}

export async function submitJudgeScoresAction(token: string) {
  const session = await getJudgeSession();
  if (!session) return fail("Session expired — log in again");
  const item = await prisma.item.findUnique({
    where: { privateToken: token },
    include: { participants: true },
  });
  if (!item || item.id !== session.itemId) return fail("Wrong item");

  const scores = await prisma.score.findMany({
    where: { judgeId: session.judgeId, participantId: { in: item.participants.map((p) => p.id) } },
  });
  if (scores.length < item.participants.length) {
    return fail("Enter a mark for every participant before submit");
  }
  for (const s of scores) {
    if (s.mark === null || s.mark === undefined) {
      return fail("Enter a mark for every participant before submit");
    }
  }

  await prisma.judgeSubmission.upsert({
    where: { itemId_judgeId: { itemId: item.id, judgeId: session.judgeId } },
    create: { itemId: item.id, judgeId: session.judgeId, submittedAt: new Date() },
    update: { submittedAt: new Date() },
  });
  await writeAudit(item.id, "judge_submit", {
    judgeId: session.judgeId,
    judgeName: session.judgeName,
  });
  revalidatePath(`/judge/${token}/score`);
  revalidatePath(`/admin/items/${item.id}/results`);
  revalidatePath("/admin");
  return ok();
}

export async function unlockJudgeSubmissionAction(itemId: string, judgeId: string) {
  await requireAdmin();
  await prisma.judgeSubmission.updateMany({
    where: { itemId, judgeId },
    data: { submittedAt: null },
  });
  await writeAudit(itemId, "judge_unlock", { judgeId });
  revalidatePath(`/admin/items/${itemId}/results`);
  return ok();
}

export async function savePlacementsAction(
  itemId: string,
  placements: { participantId: string; placement: number | null }[],
) {
  await requireAdmin();
  const before = await prisma.participant.findMany({
    where: { itemId },
    select: { id: true, placement: true },
  });
  for (const row of placements) {
    await prisma.participant.update({
      where: { id: row.participantId },
      data: { placement: row.placement },
    });
  }
  await writeAudit(itemId, "placement_edit", { before, after: placements });
  revalidatePath(`/admin/items/${itemId}/results`);
  revalidatePath("/results");
  revalidatePath(`/results/${itemId}`);
  return ok();
}

export async function publishItemAction(itemId: string) {
  await requireAdmin();
  const withPlacement = await prisma.participant.count({
    where: { itemId, placement: { not: null } },
  });
  if (withPlacement < 1) return fail("Set at least one placement before publish");
  const before = await prisma.item.findUnique({ where: { id: itemId } });
  await prisma.item.update({
    where: { id: itemId },
    data: { publishedAt: new Date() },
  });
  await writeAudit(itemId, "publish", { beforePublishedAt: before?.publishedAt });
  revalidatePath("/admin");
  revalidatePath(`/admin/items/${itemId}/results`);
  revalidatePath("/results");
  revalidatePath(`/results/${itemId}`);
  return ok();
}

export async function unpublishItemAction(itemId: string) {
  await requireAdmin();
  await prisma.item.update({ where: { id: itemId }, data: { publishedAt: null } });
  await writeAudit(itemId, "unpublish", {});
  revalidatePath("/admin");
  revalidatePath(`/admin/items/${itemId}/results`);
  revalidatePath("/results");
  revalidatePath(`/results/${itemId}`);
  return ok();
}
