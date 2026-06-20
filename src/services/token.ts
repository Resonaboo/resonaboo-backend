import { env } from "#env";
import jwt, { type JwtPayload } from "jsonwebtoken";
import z from "zod";

export const tokenSchema = z.object({
  username: z.string(),
  email: z.email(),
  role: z.enum(["owner", "customer"]),
});

export type TokenPayload = z.infer<typeof tokenSchema>;

export function generateToken(
  email: string,
  username: string,
  role: TokenPayload["role"],
) {
  return jwt.sign({ username, role }, env.AUTH_SECRET, {
    algorithm: "HS256",
    issuer: "auth-api",
    subject: email,
    expiresIn: "14d",
  });
}

export function recoverToken(token: string): TokenPayload {
  const decodedToken = jwt.verify(token, env.AUTH_SECRET, {
    issuer: "auth-api",
    algorithms: ["HS256"],
  }) as JwtPayload;

  return tokenSchema.parse({
    username: decodedToken.username,
    email: decodedToken.sub,
    role: decodedToken.role,
  });
}
