
import { getDb } from "@/index";
import { userSkills, NewUserSkill } from "@/utils/db/schema/schema";
import { eq, and, inArray,InferSelectModel } from "drizzle-orm";

type UserSkill = InferSelectModel<typeof userSkills>;

export async function getUserSkills(
  userId: string,
  sourceFilter?: ("resume" | "manual" | "suggested")[]
): Promise<UserSkill[]>  {
  const db = getDb();

  if (sourceFilter && sourceFilter.length > 0) {
    return await db
      .select()
      .from(userSkills)
      .where(and(eq(userSkills.userId, userId), inArray(userSkills.source, sourceFilter)))
      .orderBy(userSkills.createdAt);
  }
  return await db
    .select()
    .from(userSkills)
    .where(eq(userSkills.userId, userId))
    .orderBy(userSkills.createdAt);
}

export async function addUserSkill(data: {
  userId: string;
  skillName: string;
  source: "resume" | "manual" | "suggested";
  proficiency?: "none" | "beginner" | "intermediate" | "advanced" | "expert";
  status?: "learning" | "learned" | "interested" | "ignored";
  notes?: string;
  meta?: Record<string, any>;
}) {
    const db = getDb();
  const [skill] = await db
    .insert(userSkills)
    .values({
      userId: data.userId,
      skillName: data.skillName.trim(),
      source: data.source,
      proficiency: data.proficiency ?? "none",
      status: data.status ?? "interested",
      notes: data.notes ?? null,
      meta: data.meta ?? null,
    })
    .returning();
  return skill;
}

export async function updateUserSkill(
  id: string,
  data: Partial<{
    skillName: string;
    proficiency: "none" | "beginner" | "intermediate" | "advanced" | "expert";
    status: "learning" | "learned" | "interested" | "ignored";
    notes: string;
    meta: Record<string, any>;
  }>
) {
    const db = getDb();

  const [updated] = await db
    .update(userSkills)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(userSkills.id, id))
    .returning();
  return updated;
}

export async function deleteUserSkill(id: string) {
    const db = getDb();

  await db.delete(userSkills).where(eq(userSkills.id, id));
}

export async function clearUserSkills(
  userId: string,
  source: "resume" | "manual" | "suggested"
)
{
  const db = getDb();
  await db
    .delete(userSkills)
    .where(and(eq(userSkills.userId, userId), eq(userSkills.source, source)));
}

export async function saveResumeSkills(userId: string, skillsArray: string[]) {
  const db = getDb();

  await clearUserSkills(userId, "resume");
  if (skillsArray.length === 0) return [];

  const seen = new Set<string>();
  const unique = skillsArray.filter((name) => {
    const key = name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const rows: NewUserSkill[] = unique.map((name) => ({
    userId,
    skillName: name.trim(),
    source: "resume" as const,
    proficiency: "none" as const,
    status: "interested" as const,
    notes: null,
    meta: null,
  }));

  return await db.insert(userSkills).values(rows).returning();
}

export async function saveSuggestedSkills(
  userId: string,
  suggestedArray: {
    name: string;
    reason: string;
    priority: "high" | "medium" | "low";
    category: "technical" | "soft" | "tool";
  }[],
  industry: string
) {  const db = getDb();
  await clearUserSkills(userId, "suggested");
  if (suggestedArray.length === 0) return [];

  const rows: NewUserSkill[] = suggestedArray.map((s) => ({
    userId,
    skillName: s.name.trim(),
    source: "suggested" as const,
    proficiency: "none" as const,
    status: "interested" as const,
    notes: null,
    meta: { reason: s.reason, priority: s.priority, category: s.category, industry },
  }));

  return await db.insert(userSkills).values(rows).returning();
}

export async function getSuggestedSkills(userId: string) {
  const db = getDb();
  return await db
    .select()
    .from(userSkills)
    .where(and(eq(userSkills.userId, userId), eq(userSkills.source, "suggested")))
    .orderBy(userSkills.createdAt);
}


