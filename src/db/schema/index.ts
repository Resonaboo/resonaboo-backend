import { plans } from "./plans.ts";
import { sessions } from "./sessions.ts";
import { subscriptions } from "./subscriptions.ts";
import { users } from "./users.ts";

export { users, sessions, plans, subscriptions };

export const schema = {
  users,
  sessions,
  plans,
  subscriptions
};
