import type { FastifyTypedInstance } from "#types";
import { exceptions } from "./exception.ts";
import { middlewares } from "./middleware.ts";

export function registerHandlers(app: FastifyTypedInstance) {
  middlewares(app);
  exceptions(app);
}