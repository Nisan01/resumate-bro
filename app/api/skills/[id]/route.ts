import { NextRequest, NextResponse } from "next/server";
import { updateUserSkill, deleteUserSkill } from "@/utils/db/db-operations/skills-operations/skills";

/**
 * PUT /api/skills/[id]
 * Updates a specific skill for a user
 * Body: { userId, skillName?, proficiency?, status?, notes?, meta? }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Unwrapping params because they are now a Promise in Next.js 15
    const { id } = await params;

    const body = await req.json();
    const { userId, skillName, proficiency, status, notes, meta } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const updated = await updateUserSkill(id, {
      ...(skillName && { skillName }),
      ...(proficiency !== undefined && { proficiency }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(meta && { meta }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({ skill: updated });
  } catch (err) {
    console.error("[PUT /api/skills/[id]]", err);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

/**
 * DELETE /api/skills/[id]
 * Deletes a specific skill for a user
 * Body: { userId }
 */
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Unwrapping params to fix the "must be unwrapped with await" error
    const { id } = await params;

    const body = await req.json();
    if (!body.userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await deleteUserSkill(id);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/skills/[id]]", err);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}