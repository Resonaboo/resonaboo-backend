import type { FastifyTypedInstance } from "#types";
import { authRoute } from "./auth.ts";
import { profileRoute } from "./profile.ts";
import { subscriptionRoute } from "./subscription.ts";

export function registerRoutes(app: FastifyTypedInstance) {
  authRoute(app);
  profileRoute(app);
  subscriptionRoute(app);
}
