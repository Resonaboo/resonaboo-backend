import type { FastifyReply, FastifyRequest } from "fastify";
import { recoverToken } from "#services";

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
