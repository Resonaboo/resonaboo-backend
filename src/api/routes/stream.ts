import { isAuthenticated } from "#services";
import type { FastifyTypedInstance } from "#types";
import { useApi } from "#utils";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export function streamRoute(app: FastifyTypedInstance) {
  app.get(
    "/stream",
    {
      schema: {
        summary: "Streaming video",
        description: "Stream video.",
        tags: ["stream"],
        response: {
          200: z.object({
            status: z.literal("success"),
            data: z.literal("Hello, world!"),
          }),
          401: z.object({
            status: z.literal("Unauthorized"),
          }),
          500: z.object({
            status: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const session = await isAuthenticated(req);
      if (!session) {
        return res.status(StatusCodes.UNAUTHORIZED).send({ status: "Unauthorized" });
      }
      const api = useApi();

      const result = await api.GET("/v3/config/global/get");
      const { response, data, error } = result;
      if (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: error.status || "error",
          message: error.error || "Failed to fetch mediamtx configuration",
        });
      }
    }
  );

  app.get(
    "/stream",
    {
      schema: {
        summary: "Streaming video",
        description: "Stream video.",
        tags: ["stream"],
        response: {
          200: z.object({
            status: z.literal("success"),
            data: z.literal("Hello, world!"),
          }),
          500: z.object({
            status: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const api = useApi();

      const result = await api.POST("/v3/config/paths/add/{name}", {
        params: {
          path: {
            name: "nathan"
          }
        },
        body: {

        }
      });
    }
  );
}