import { relations, sql } from "drizzle-orm";
import { pgTable, text, boolean, uuid, pgEnum, varchar } from "drizzle-orm/pg-core";
import { entrypoints } from "./entrypoints.ts";
import { endpoints } from "./endpoints.ts";

export const userRole = pgEnum("role", [
  "owner",
  "customer"
]);

export const users = pgTable("users", {
  id: uuid("id")
    .default(sql`uuidv7()`)
    .primaryKey(),
  username: varchar("username", { length: 16 }).notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  password: text("password").notNull(),
  role: userRole("role").default("customer").notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  entrypoints: many(entrypoints),
  endpoints: many(endpoints),
}));
