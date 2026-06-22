import type { FastifyTypedInstance } from "#types";
import { StatusCodes } from "http-status-codes";
import { securityFilters } from "../../services/security.ts";

export function middlewares(app: FastifyTypedInstance) {
  app.addHook("preHandler", async (req, res) => {
    const privateRoutes = ["/api/profile", "/api/dashboard"];

    for (const route of privateRoutes) {
      if (req.url.startsWith(route)) {
        securityFilters(req);
      }
    }
  });
}
