import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/utils/db/db-operations/user";
import { signToken } from "@/utils/db/db-operations/jwt/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const avatarInput = typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : "";

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "email, name and password are required" },
        { status: 400 }
      );
    }

    const avatarUrl = avatarInput || `https://api.dicebear.com/9.x/bottts/svg?seed=${email}`;
    const isDevMode = process.env.NODE_ENV !== "production";

    const buildAuthResponse = (
      authUser: { id: string; name: string; email: string; avatarUrl: string | null },
      warning?: string
    ) => {
      const token = signToken({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        avatarUrl: authUser.avatarUrl,
      });

      const responseBody: {
        success: true;
        userId: string;
        user: { id: string; name: string; email: string; avatarUrl: string | null };
        warning?: string;
      } = {
        success: true,
        userId: authUser.id,
        user: authUser,
      };

      if (warning) responseBody.warning = warning;

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
    } catch (dbError) {
      if (!isDevMode) throw dbError;

      return buildAuthResponse(
        {
          id: `dev-${email}`,
          name,
          email,
          avatarUrl,
        },
        "Database is unavailable. Account is not persisted, but you are signed in with local dev fallback."
      );
    }

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    try {
      const user = await createUser({
        email,
        name,
        password,
        avatarUrl,
      });

      return buildAuthResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
      });
    } catch (dbError) {
      if (!isDevMode) throw dbError;

      return buildAuthResponse(
        {
          id: `dev-${email}`,
          name,
          email,
          avatarUrl,
        },
        "Database is unavailable. Account is not persisted, but you are signed in with local dev fallback."
      );
    }
  } catch (error) {
    console.error("Sign-up route error:", error);
    return NextResponse.json(
      { error: "Registration service is temporarily unavailable" },
      { status: 503 }
    );
  }
}