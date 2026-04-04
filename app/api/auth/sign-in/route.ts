// app/api/auth/sign-in/route.ts
import { NextResponse } from "next/server";
import { getUserByEmail } from "@/utils/db/db-operations/user";
import { signToken } from "@/utils/db/db-operations/jwt/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const isDevMode = process.env.NODE_ENV !== "production";
    let user;

    try {
      user = await getUserByEmail(email);
    } catch (dbError) {
      if (!isDevMode) throw dbError;

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
        avatarUrl: null,
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

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
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