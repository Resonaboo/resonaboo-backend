import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "#env";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { db, sessions, users } from "#db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { Exception } from "#utils";
import { StatusCodes } from "http-status-codes";

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

export type Credentials = {
  sessionId: string;
  userId: string;
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

export function securityFilters(req: FastifyRequest) {
  const rawToken = req.cookies["auth-token"];
  if (typeof rawToken !== "string")
    throw new Exception(StatusCodes.UNAUTHORIZED, "Need to sign-in");

  if (rawToken.length === 0)
    throw new Exception(StatusCodes.UNAUTHORIZED, "Need to sign-in");
}

export async function getCredentials(
  req: FastifyRequest,
): Promise<Credentials> {
  const { cookies, userAgent } = req;
  const rawToken = cookies["auth-token"];
  if (typeof rawToken !== "string")
    throw new Exception(StatusCodes.UNAUTHORIZED, "Need sign-in");

  const sessionId = await recoverToken(rawToken);
  if (!sessionId)
    throw new Exception(StatusCodes.UNAUTHORIZED, "Invalid session");

  const sessionQuery = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  if (sessionQuery.length === 0)
    throw new Exception(StatusCodes.UNAUTHORIZED, "Invalid session");

  const session = sessionQuery[0];

  if (
    session.ip !== req.ip ||
    session.os !== userAgent.family ||
    session.browser !== userAgent.toAgent()
  )
    if (sessionQuery.length === 0)
      throw new Exception(
        StatusCodes.UNAUTHORIZED,
        "User agent info does not match with session",
      );

  return {
    sessionId: session.id,
    userId: session.fkUserId,
  };
}

export async function authenticateUser(props: AuthProps): Promise<AuthInfo> {
  const { email, password, ip, os, browser } = props;

  const usersQuery = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (usersQuery.length === 0)
    throw new Exception(StatusCodes.UNAUTHORIZED, "Invalid credentials");

  const user = usersQuery[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    throw new Exception(StatusCodes.UNAUTHORIZED, "Invalid credentials");

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
