import type { FastifyTypedInstance } from "#types";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "#api";
import z from "zod";
import { StatusCodes } from "http-status-codes";

export function authRoute(app: FastifyTypedInstance) {
  app.route({
    method: ["GET", "POST"],
    url: "/auth/*",
    async handler(request, reply) {
      try {
        // Construct request URL
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = fromNodeHeaders(request.headers);
        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });
        // Process authentication request
        const response = await auth.handler(req);
        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value, key) => {
          reply.header(key, value);
        });
        return reply.send(response.body ? await response.text() : null);
      } catch (error: any) {
        app.log.error("Authentication Error:", error);
        return reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });

  app.post(
    "/api/auth/login",
    {
      schema: {
        summary: "Login",
        description: "Login",
        tags: ["auth"],
        body: z.object({
          email: z.email(),
          password: z.string().min(6).max(16),
          rememberMe: z.boolean(),
        }),
        response: {
          200: z.object({
            status: z.string(),
            username: z.string(),
          }),
          500: z.object({
            status: z.string(),
            error: z.string(),
            code: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password, rememberMe } = req.body;

      try {
        const result = await auth.api.signInEmail({
          body: {
            email,
            password,
            rememberMe,
          },
        });

        return res
          .setCookie("auth_token", result.token, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          })
          .setCookie("auth_info", result.user.name, {
            httpOnly: false,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          })
          .status(StatusCodes.OK)
          .send({
            status: "success",
            username: result.user.name,
          });
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

  app.post(
    "/api/auth/register",
    {
      schema: {
        summary: "Register",
        description: "Register a new user",
        tags: ["auth"],
        body: z.object({
          username: z.string().min(6).max(16),
          email: z.email(),
          password: z.string().min(6).max(16),
        }),
        response: {
          201: z.object({}),
          500: z.object({
            status: z.string(),
            error: z.string(),
            code: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { username, email, password } = req.body;

      try {
        const result = await auth.api.signUpEmail({
          body: {
            name: username,
            email,
            password,
          },
        });

        return res.status(StatusCodes.CREATED).send({});
      } catch (error: any) {
        app.log.error("Authentication Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "error",
          error: `${error}`,
          code: "AUTH_FAILURE",
        });
      }
    },
  );

  app.post(
    "/api/auth/logout",
    {
      schema: {
        summary: "Logout",
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
        await auth.api.signOut({
          headers: fromNodeHeaders(req.headers)
        });

        return res.status(StatusCodes.NO_CONTENT).send({});
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
