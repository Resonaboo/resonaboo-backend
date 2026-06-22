import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "#env";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { db, sessions, users } from "#db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export type AuthProps = {
  email: string;
  password: string;
  ip: string;
  os: string;
  browser: string;
};

export type AuthInfo = {
  token: string;
  username: string;
  maskedEmail: string;
};

function maskEmail(email: string) {
  const visibleCount = Math.min(4, email.length);
  return email.slice(0, visibleCount) + "*".repeat(email.length - visibleCount);
}

export function generateToken(sessionId: string) {
  return jwt.sign({}, env.AUTH_SECRET, {
    algorithm: "HS256",
    issuer: "auth-api",
    subject: sessionId,
    expiresIn: "14d",
  });
}

export function recoverToken(token: string): string | undefined {
  const decodedToken = jwt.verify(token, env.AUTH_SECRET, {
    issuer: "auth-api",
    algorithms: ["HS256"],
  }) as JwtPayload;

  return decodedToken.sub;
}

export function securityFilters(req: FastifyRequest, res: FastifyReply) {
  const rawToken = req.cookies["auth-token"];
  if (typeof rawToken !== "string") return false;

  const token =
    rawToken.startsWith('"') && rawToken.endsWith('"')
      ? rawToken.slice(1, -1)
      : rawToken;

  try {
    recoverToken(token);
    return true;
  } catch (error: any) {
    res.clearCookie("auth-token", { path: "/", sameSite: "lax" });
    res.clearCookie("user-info", { path: "/", sameSite: "lax" });
    return false;
  }
}

export async function getCredentials(req: FastifyRequest) {
  const { cookies, userAgent } = req;
  const rawToken = cookies["auth-token"];
  if (typeof rawToken !== "string") return undefined;

  const sessionId = await recoverToken(rawToken);
  if (!sessionId) return undefined;

  const sessionQuery = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  if (sessionQuery.length === 0) return undefined;

  const session = sessionQuery[0];

  if (session.ip !== req.ip || session.os !== userAgent.family || session.browser !== userAgent.toAgent())
    return undefined;

  return session.fkUserId;
}

export async function authenticateUser(
  props: AuthProps,
): Promise<AuthInfo | undefined> {
  const { email, password, ip, os, browser } = props;

  const usersQuery = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (usersQuery.length === 0) return undefined;

  const user = usersQuery[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return undefined;

  const sessionInsert = await db
    .insert(sessions)
    .values({
      ip,
      os,
      browser,
      fkUserId: user.id,
    })
    .returning();

  const session = sessionInsert[0];

  const token = generateToken(session.id);

  return {
    token,
    maskedEmail: maskEmail(email),
    username: user.username,
  };
}
