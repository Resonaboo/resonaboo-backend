import type { FastifyTypedInstance } from "#types";
import { StatusCodes } from "http-status-codes";
import { securityFilters } from "../services/security.ts";

export function registerMiddlewares(app: FastifyTypedInstance) {
  app.addHook("onRequest", async (req, res) => {
    const privateRoutes = ["/api/profile", "/api/dashboard"];

    for (const route of privateRoutes) {
      if (req.url.startsWith(route)) {
        const isValid = securityFilters(req, res);
        if (!isValid) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .send({ error: "Unauthorized" });
        }
      }
    }
  });
}
