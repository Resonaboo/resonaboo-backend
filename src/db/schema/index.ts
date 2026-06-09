import { accounts } from "./accounts.ts";
import { mediamtx } from "./mediamtx.ts";
import { sessions } from "./sessions.ts";
import { users } from "./users.ts";
import { verifications } from "./verifications.ts";

export { accounts, mediamtx, sessions, users, verifications };

export const schema = {
  accounts,
  mediamtx,
  sessions,
  users,
  verifications,
};
