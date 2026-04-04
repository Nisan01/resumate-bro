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
  if (!decoded?.email || !decoded?.id || !decoded?.name) return null;

  const normalizedEmail = decoded.email.trim().toLowerCase();
  const normalizedUserId = decoded.id.trim();
  const normalizedName = decoded.name.trim();

  if (!normalizedEmail || !normalizedUserId || !normalizedName) return null;

  const tokenSession: DashboardSession = {
    userId: normalizedUserId,
    email: normalizedEmail,
    name: normalizedName,
    avatarUrl: null,
  };

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

    if (allowDevFallback && isDevFallbackUserId(normalizedUserId)) {
      if (process.env.NODE_ENV === "production") {
        console.warn("/api/dashboard/session token-only fallback enabled in production", {
          email: normalizedEmail,
        });
      }

      return tokenSession;
    }
  } catch {
    if (allowDevFallback && isDevFallbackUserId(normalizedUserId)) {
      if (process.env.NODE_ENV === "production") {
        console.warn("/api/dashboard/session token-only fallback enabled in production after DB failure", {
          email: normalizedEmail,
        });
      }

      return tokenSession;
    }

    return null;
  }

  return null;
}
