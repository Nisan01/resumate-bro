import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/utils/db/db-operations/user";
import { signToken } from "@/utils/db/db-operations/jwt/jwt";

export async function POST(req: Request) {
  try {
    
    const body = await req.json();
    let { email, name, password, avatarUrl } = body;

       const commonRequired = ["email", "password", "name"];
    for (const field of commonRequired) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    if(!avatarUrl){
      avatarUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${email}`;
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

   
    const user = await createUser({
      email,
      name,
      password, 
      avatarUrl: avatarUrl,
    });

    const token = signToken({
      name,
      email,
     
    });

   const response = NextResponse.json({ success: true, userId: user.id });
     response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("[sign-up] Failed to create user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}