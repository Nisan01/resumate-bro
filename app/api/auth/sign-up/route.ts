import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { createUser, getUserByEmail } from "@/utils/db/db-operations/user";
import { signToken } from "@/utils/db/db-operations/jwt/jwt";

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
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const avatarInput = typeof payload.avatarUrl === "string" ? payload.avatarUrl.trim() : "";

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "email, name and password are required" },
        { status: 400 }
      );
    }

    const avatarUrl = avatarInput || `https://api.dicebear.com/9.x/bottts/png?seed=${encodeURIComponent(email)}`;
    const buildAuthResponse = (authUser: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    }) => {
      const token = signToken({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
      });

      const responseBody: {
        success: true;
        userId: string;
        user: { id: string; name: string; email: string; avatarUrl: string | null };
      } = {
        success: true,
        userId: authUser.id,
        user: authUser,
      };

      const response = NextResponse.json(responseBody);
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    };

    let existingUser;
    try {
      existingUser = await getUserByEmail(email);
    } catch {
      return NextResponse.json({ error: "Registration service is temporarily unavailable" }, { status: 503 });
    }

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    try {
      const passwordHash = await hash(password, 12);

      const user = await createUser({
        email,
        name,
        password: passwordHash,
        avatarUrl,
      });

      return buildAuthResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
      });
    } catch {
      return NextResponse.json({ error: "Registration service is temporarily unavailable" }, { status: 503 });
    }
  } catch (error) {
    console.error("Sign-up route error:", error);
    return NextResponse.json(
      { error: "Registration service is temporarily unavailable" },
      { status: 503 }
    );
  }
}