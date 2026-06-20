import type { FastifyTypedInstance } from "#types";
import z from "zod";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import { db, users } from "#db";
import { eq } from "drizzle-orm";
import { generateToken } from "#services";

function maskEmail(email: string) {
  const visibleCount = Math.min(3, email.length);
  return email.slice(0, visibleCount) + "*".repeat(email.length - visibleCount);
}

export function authRoute(app: FastifyTypedInstance) {
  const route = "/api/auth";

  app.post(
    `${route}/sign-in`,
    {
      schema: {
        summary: "Sign-in",
        description: "Login route",
        tags: ["auth"],
        body: z.object({
          email: z.email(),
          password: z.string().min(6).max(16),
        }),
        response: {
          200: z.object({
            status: z.string(),
          }),
          401: z.object({
            error: z.string(),
          }),
          500: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      try {
        const u = await db.select().from(users).where(eq(users.email, email));
        if (u.length === 0)
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .send({ error: "Invalid credentials" });

        const auth = u[0];
        const isPassValid = await bcrypt.compare(password, auth.password);
        if (isPassValid)
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .send({ error: "Invalid credentials" });

        const token = generateToken(auth.email, auth.username, auth.role);

        return res
          .setCookie("auth-token", JSON.stringify(token), {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 14,
          })
          .setCookie("user-info", JSON.stringify({
            username: auth.username,
            email: maskEmail(auth.email)
          }), {
            httpOnly: false,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 14,
          })
          .status(StatusCodes.OK)
          .send({
            status: "success",
          });
      } catch (error: any) {
        app.log.error("Authentication Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          error: "Internal authentication error",
        });
      }
    },
  );

  app.post(
    `${route}/sign-up`,
    {
      schema: {
        summary: "sign-up",
        description: "Register a new user",
        tags: ["auth"],
        body: z.object({
          username: z.string().min(6).max(16),
          email: z.email(),
          password: z.string().min(6).max(16),
        }),
        response: {
          201: z.object({}),
          400: z.object({
            error: z.string(),
          }),
          500: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { username, email, password } = req.body;
      const bcpassword = await bcrypt.hash(password, 10);

      try {
        const u = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (u.length > 0)
          return res.status(StatusCodes.BAD_REQUEST).send({
            error: "Email already registered",
          });

        await db.insert(users).values({
          email,
          username,
          password: bcpassword,
        });

        return res.status(StatusCodes.CREATED).send({});
      } catch (error: any) {
        app.log.error("Authentication Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          error: `${error}`,
        });
      }
    },
  );

  app.post(
    `${route}/sign-out`,
    {
      schema: {
        summary: "sign-out",
        description: "Logout from the API.",
        tags: ["auth"],
        response: {
          204: z.object({}),
          500: z.object({
            status: z.string(),
            error: z.string(),
            code: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      try {
        return res
          .clearCookie("auth-token", {
            path: "/",
            sameSite: "lax",
          })
          .clearCookie("user-info", {
            path: "/",
            sameSite: "lax",
          })
          .status(StatusCodes.NO_CONTENT)
          .send({});
      } catch (error: any) {
        app.log.error("Authentication Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "error",
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  );
}
