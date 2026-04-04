import { cookies } from "next/headers";
import {
  isAuthDevFallbackEnabled,
  isDevFallbackUserId,
} from "@/lib/server/auth-dev-fallback";
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
  const allowDevFallback = isAuthDevFallbackEnabled();

  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded?.email) return null;

  const normalizedEmail = decoded.email.trim().toLowerCase();

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

    if (allowDevFallback && isDevFallbackUserId(decoded.id)) {
      return {
        userId: decoded.id,
        email: normalizedEmail,
        name: decoded.name,
        avatarUrl: null,
      };
    }
  } catch {
    if (allowDevFallback && isDevFallbackUserId(decoded.id)) {
      return {
        userId: decoded.id,
        email: normalizedEmail,
        name: decoded.name,
        avatarUrl: null,
      };
    }
  }

  return null;
}
