
import { NextResponse } from "next/server";
import { getUserByEmail } from "@/utils/db/db-operations/user";
import { signToken } from "@/utils/db/db-operations/jwt/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await getUserByEmail(email);

if (!user || !user.password || user.password !== password) {
  return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
}

    const token = signToken({ name: user.name, email: user.email }); 

    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email } 
    });

    response.cookies.set("auth_token", token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 5,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}