import { db, plans } from "#db";
import type { FastifyTypedInstance } from "#types";
import { Exception } from "#utils";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export function subscriptionRoute(app: FastifyTypedInstance) {
  app.get(
    "/api/plans",
    {
      schema: {
        summary: "Avaliable plans",
        description: "Get all avaliable plans info",
        tags: ["subscription"],
        response: {
          200: z.object({
            avaliablePlans: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                description: z.string().nullable(),
                price: z.number(),
              })
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
    async (_, res) => {
      const plansQuery = await db
        .select({
          id: plans.id,
          name: plans.name,
          description: plans.description,
          price: plans.price,
        })
        .from(plans);

      if (plansQuery.length === 0)
        throw new Exception(StatusCodes.NOT_FOUND, "Not found");

      return res.status(StatusCodes.OK).send({
        avaliablePlans: plansQuery,
      });
    },
  );
}
