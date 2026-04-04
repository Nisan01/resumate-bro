import { cookies } from "next/headers";
import { verifyToken } from "@/utils/db/db-operations/jwt/jwt";
import { getUserByEmail } from "@/utils/db/db-operations/user";

export interface DashboardSession {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export async function getDashboardSession(): Promise<DashboardSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded?.email) return null;

  const normalizedEmail = decoded.email.trim().toLowerCase();

  if (decoded.id) {
    return {
      userId: decoded.id,
      email: normalizedEmail,
      name: decoded.name,
      avatarUrl: decoded.avatarUrl ?? null,
    };
  }

  try {
    const user = await getUserByEmail(normalizedEmail);

    if (user) {
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl ?? null,
      };
    }
  } catch {
    // Fall through to token-only fallback for local development.
  }

  return {
    userId: `dev-${normalizedEmail}`,
    email: normalizedEmail,
    name: decoded.name,
    avatarUrl: decoded.avatarUrl ?? null,
  };
}
