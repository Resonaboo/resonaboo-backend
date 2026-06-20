import { users } from "#db";
import { relations } from "drizzle-orm";
import { pgTable, serial, uuid, varchar } from "drizzle-orm/pg-core";
import { endpoints } from "./endpoints.ts";

export const entrypoints = pgTable("entrypoints", {
    id: serial("id").notNull().primaryKey(),
    key: varchar("key").unique().notNull(),
    fkUserId: uuid("fk_user_id")
          .notNull()
          .references(() => users.id, { onDelete: "cascade" }),
});

export const entrypointsRelations = relations(entrypoints, ({ one, many }) => ({
  user: one(users, {
    fields: [entrypoints.fkUserId],
    references: [users.id],
  }),
  endpoint: many(endpoints)
}));