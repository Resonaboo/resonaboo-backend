import { accounts } from "./accounts.ts";
import { sessions } from "./sessions.ts";
import { users } from "./users.ts";
import { verifications } from "./verifications.ts";

export { accounts, sessions, users, verifications };

export const schema = {
  accounts,
  sessions,
  users,
  verifications,
};
