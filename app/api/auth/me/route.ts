import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "@/utils/db/db-operations/user";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return Response.json({ user: null }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    
    const user = await getUserByEmail(decoded.email); // 👈 fetch from DB
    if (!user) return Response.json({ user: null }, { status: 401 });

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null, // 👈 now you have it
      },
    });
  } catch {
    return Response.json({ user: null }, { status: 401 });
  }
}