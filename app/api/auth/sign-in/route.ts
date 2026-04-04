// app/api/auth/sign-in/route.ts
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { isAuthDevFallbackEnabled } from "@/lib/server/auth-dev-fallback";
import { getUserByEmail } from "@/utils/db/db-operations/user";
import { signToken } from "@/utils/db/db-operations/jwt/jwt";

const DUMMY_HASH = "$2b$12$Itt4.IoaOWw9.U.sLhX2x.MgPkCWWQEcWSidtwLgJaGKmGTz5c8/C";

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const allowDevFallback = isAuthDevFallbackEnabled();
    let user;

    try {
      user = await getUserByEmail(email);
    } catch (dbError) {
      if (!allowDevFallback) throw dbError;

      const fallbackName = email.split("@")[0] || "Developer";
      const fallbackUser = {
        id: `dev-${email}`,
        name: fallbackName,
        email,
        avatarUrl: null,
      };

      const fallbackToken = signToken({
        id: fallbackUser.id,
        name: fallbackUser.name,
        email: fallbackUser.email,
      });

      const fallbackResponse = NextResponse.json({
        success: true,
        user: fallbackUser,
        warning: "Database is unavailable. You are signed in with local dev fallback.",
      });

      fallbackResponse.cookies.set("auth_token", fallbackToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return fallbackResponse;
    }

    const passwordMatches = await compare(password, user?.password ?? DUMMY_HASH);

    if (!user || !passwordMatches) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Sign-in route error:", error);
    return NextResponse.json(
      { error: "Authentication service is temporarily unavailable" },
      { status: 503 }
    );
  }
}