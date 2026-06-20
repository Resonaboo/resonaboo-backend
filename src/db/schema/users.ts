import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { accounts } from "./accounts.ts";
import { sessions } from "./sessions.ts";
import { entrypoints } from "./entrypoints.ts";
import { uuidv7 } from "uuidv7";

export const users = pgTable("users", {
  id: uuid("id")
    .default(sql`uuidv7()`)
    .$defaultFn(() => uuidv7())
    .primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  entrypoints: many(entrypoints),
}));
