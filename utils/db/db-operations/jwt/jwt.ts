import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

export type JwtPayload = {
  id: string;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
};

export function signToken(payload: JwtPayload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

  return jwt.sign(
    {
      sub: payload.id,
      name: payload.name,
      email: payload.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set - cannot verify token");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") return null;

    const id =
      typeof decoded.sub === "string"
        ? decoded.sub
        : typeof decoded.id === "string"
          ? decoded.id
          : "";
    const name = typeof decoded.name === "string" ? decoded.name : "";
    const email = typeof decoded.email === "string" ? decoded.email : "";

    if (!id || !name || !email) {
      return null;
    }

    return {
      id,
      name,
      email,
      iat: typeof decoded.iat === "number" ? decoded.iat : undefined,
      exp: typeof decoded.exp === "number" ? decoded.exp : undefined,
    };
  } catch {
    return null;
  }
}