import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  boolean,
  uuid,
  pgEnum,
  varchar,
} from "drizzle-orm/pg-core";
import { sessions } from "./sessions.ts";
import { subscriptions } from "./subscriptions.ts";

export const userRole = pgEnum("role", ["owner", "customer"]);

export const users = pgTable("users", {
  id: uuid("id").default(sql`uuidv7()`).primaryKey(),
  username: varchar("username", { length: 16 }).notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  password: text("password").notNull(),
  role: userRole("role").default("customer").notNull(),
  disabled: boolean("disabled").notNull().default(false),
});

export const usersRelations = relations(users, ({ many }) => ({
  session: many(sessions),
  subscription: many(subscriptions),
}));
