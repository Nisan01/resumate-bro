import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/utils/db/schema-fn/user";
import { signToken } from "@/utils/db/schema-fn/jwt/jwt";

export async function POST(req: Request) {
  try {
    
    const body = await req.json();
    const { email, name, password, avatarUrl } = body;

       const commonRequired = ["email", "password", "name"];
    for (const field of commonRequired) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

   
    const user = await createUser({
      email,
      name,
      password, 
      avatarUrl: avatarUrl || null,
    });

    const token = signToken({
      name: body.name,
      email: body.email
     
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}