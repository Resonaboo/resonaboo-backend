import type { FastifyTypedInstance } from "#types";
import { homeRoute } from "./home.ts";

export function registerRoutes(app: FastifyTypedInstance) {
    homeRoute(app);
}