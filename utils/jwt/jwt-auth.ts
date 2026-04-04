import jwt from "jsonwebtoken";

interface JwtAuthUser {
  id: string;
  email: string;
  role?: string;
}

export function createToken(user: JwtAuthUser) {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not set");
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? "user" },
    secret,
    { expiresIn: "5h" }
  );
}
