import jwt from "jsonwebtoken";

export function createToken(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET_KEY || "dev-secret",
    { expiresIn: "5h" }
  );
}
