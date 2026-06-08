import type { FastifyTypedInstance } from "#types";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export function homeRoute(app: FastifyTypedInstance) {
  app.get(
    "/",
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
        },
      },
    },
    async (_, res) => {
      return res.status(StatusCodes.OK).send({
        status: "success",
        data: "Hello, world!",
      });
    },
  );
}
