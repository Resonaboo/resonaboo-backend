import type { FastifyTypedInstance } from "#types";
import { authRoute } from "./auth.ts";
import { homeRoute } from "./home.ts";
import { streamRoute } from "./stream.ts";

export function registerRoutes(app: FastifyTypedInstance) {
  authRoute(app);
  homeRoute(app);
  streamRoute(app);
}
