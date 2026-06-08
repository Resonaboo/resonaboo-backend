import type { FastifyTypedInstance } from "#types";
import { authRoute } from "./auth.ts";
import { homeRoute } from "./home.ts";

export function registerRoutes(app: FastifyTypedInstance) {
  authRoute(app);
  homeRoute(app);
}
