import { cookies } from "next/headers";
import { getUserByEmail } from "@/utils/db/db-operations/user";
import { verifyToken } from "@/utils/db/db-operations/jwt/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return Response.json({ user: null }, { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ user: null }, { status: 401 });

  try {
    const user = await getUserByEmail(decoded.email);

    if (!user) {
      if (process.env.NODE_ENV !== "production") {
        return Response.json({
          user: {
            id: decoded.id ?? `dev-${decoded.email}`,
            name: decoded.name,
            email: decoded.email,
            avatarUrl: decoded.avatarUrl ?? null,
          },
        });
      }

      return Response.json({ user: null }, { status: 401 });
    }

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("/api/auth/me DB lookup failed, using token fallback:", error);
      return Response.json({
        user: {
          id: decoded.id ?? `dev-${decoded.email}`,
          name: decoded.name,
          email: decoded.email,
          avatarUrl: decoded.avatarUrl ?? null,
        },
      });
    }

    return Response.json({ user: null }, { status: 503 });
  }
}