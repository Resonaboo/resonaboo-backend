import type { FastifyTypedInstance } from "#types";
import z from "zod";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import { db, sessions, users } from "#db";
import { authenticateUser, getCredentials } from "#services";
import { Exception } from "#utils";
import { eq, inArray, and } from "drizzle-orm";

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
            message: z.string(),
          }),
          500: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body;
      const { userAgent, ip } = req;

      const auth = await authenticateUser({
        email,
        password,
        ip,
        browser: userAgent.family,
        os: userAgent.os.family,
      });

      if (!auth)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send({ message: "Invalid credentials" });

      const userInfo = {
        username: auth.username,
        email: auth.maskedEmail,
      };

      return res
        .setCookie("auth-token", auth.token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 14,
        })
        .setCookie("user-info", JSON.stringify(userInfo), {
          httpOnly: false,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 14,
        })
        .status(StatusCodes.OK)
        .send({
          status: "success",
        });
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
            message: z.string(),
          }),
          500: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { username, email, password } = req.body;
      const bcpassword = await bcrypt.hash(password, 10);

      const userQuery = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.email, email));

      if (userQuery.length > 0)
        throw new Exception(
          StatusCodes.BAD_REQUEST,
          "Email is already registered",
        );

      await db.insert(users).values({
        id: undefined,
        username: username,
        email: email,
        emailVerified: false,
        password: bcpassword,
        role: "customer",
      });

      return res.status(StatusCodes.CREATED).send({});
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
        },
      },
    },
    async (_, res) => {
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
    },
  );

  app.delete(
    `${route}/delete-session`,
    {
      schema: {
        summary: "delete-session",
        description: "Delete a device session from user",
        tags: ["auth"],
        body: z.object({
          sessionIds: z.array(z.string("Id can not be empty or null")),
        }),
        response: {
          204: z.object({}),
          400: z.object({
            message: z.string(),
          }),
          500: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { sessionId, userId } = await getCredentials(req);
      const { sessionIds } = req.body;

      const deletedSessions = await db
        .delete(sessions)
        .where(
          and(inArray(sessions.id, sessionIds), eq(sessions.fkUserId, userId)),
        )
        .returning();

      if (deletedSessions.length === 0)
        throw new Exception(StatusCodes.NOT_FOUND, "No sessions id found");

      return res.status(StatusCodes.NO_CONTENT).send({});
    },
  );
}
