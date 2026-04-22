import { NextRequest, NextResponse } from "next/server";
import { updateUserSkill, deleteUserSkill } from "@/utils/db/db-operations/skills-operations/skills";






export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
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






export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
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