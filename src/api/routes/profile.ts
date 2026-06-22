import { getCredentials, recoverToken } from "#services";
import type { FastifyTypedInstance } from "#types";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export function profileRoute(app: FastifyTypedInstance) {
  app.get(
    "/api",
    {
      schema: {
        summary: "Hello, world!",
        description: "Just a hello world API.",
        tags: ["home"],
        response: {
          200: z.object({
            status: z.literal("success"),
            data: z.literal("Hello, world!"),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const userId = await getCredentials(req);    
          
      return res.status(StatusCodes.OK).send({
        status: "success",
        data: "Hello, world!",
      });
    },
  );
}
