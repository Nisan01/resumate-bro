import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/utils/db/db-operations/jwt/jwt";
import { getUserByEmail } from "@/utils/db/db-operations/user";
import { createUserFromGoogle } from "@/utils/db/db-operations/user";
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/sign-in?error=no_code`);
  }

  try {
    
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userInfoRes.json();
    

    let user = await getUserByEmail(googleUser.email);
    const avatarUrl = googleUser.picture || `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(googleUser.email || googleUser.name || "user")}`;

    if (!user) {
      user = await createUserFromGoogle({
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: avatarUrl,
      });
    }

    const token = signToken({ name: user.name, email: user.email });

    const response = NextResponse.redirect(`${appUrl}/dashboard`);
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 5,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${appUrl}/sign-in?error=oauth_failed`);
  }
}