import { db, plans, sessions, subscriptions } from "#db";
import { getCredentials } from "#services";
import type { FastifyTypedInstance } from "#types";
import { Exception } from "#utils";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export function profileRoute(app: FastifyTypedInstance) {
  app.get(
    "/api/profile",
    {
      schema: {
        summary: "Avaliable plans",
        description: "Get all avaliable plans info",
        tags: ["subscription"],
        response: {
          200: z.object({
            subscription: z
              .object({
                name: z.string(),
                expireAt: z.date(),
              })
              .nullable(),
            currentSession: z.object({
              id: z.string(),
              ip: z.string(),
              os: z.string(),
              browser: z.string(),
            }),
            sessions: z.array(
              z.object({
                id: z.string(),
                ip: z.string(),
                os: z.string(),
                browser: z.string(),
              }),
            ),
          }),
          404: z.object({
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
      const sessionSchema = z.object({
        id: z.string(),
        ip: z.string(),
        os: z.string(),
        browser: z.string(),
      });

      const { sessionId, userId } = await getCredentials(req);

      const sessionsQuery = await db
        .select({
          id: sessions.id,
          ip: sessions.ip,
          os: sessions.os,
          browser: sessions.browser,
        })
        .from(sessions)
        .where(eq(sessions.fkUserId, userId));

      const subscriptionQuery = await db
        .select({ name: plans.name, expireAt: subscriptions.expireAt })
        .from(subscriptions)
        .innerJoin(plans, eq(plans.id, subscriptions.fkPlanId))
        .where(eq(subscriptions.fkUserId, userId));

      const currentSession = sessionsQuery.find((s) => s.id === sessionId) as z.infer<typeof sessionSchema>;
      const sessionList = sessionsQuery.filter((s) => s.id !== sessionId);

      return res.status(StatusCodes.OK).send({
        subscription: subscriptionQuery[0] ?? null,
        currentSession: currentSession,
        sessions: sessionList,
      });
    },
  );
}
