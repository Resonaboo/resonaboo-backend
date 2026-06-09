import { db } from "#db";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import * as bcrypt from "bcrypt";
import { betterAuth } from "better-auth";
import { fromNodeHeaders } from "better-auth/node";
import type { FastifyRequest } from "fastify/types/request.ts";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    camelCase: false,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: async (password: string) => await bcrypt.hash(password, 10),
      verify: async ({ password, hash }) =>
        await bcrypt.compare(password, hash),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 10,
    },
  },
});

export async function isAuthenticated(request: FastifyRequest) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  return session;
}
