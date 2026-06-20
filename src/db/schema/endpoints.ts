import { users } from "#db";
import { relations } from "drizzle-orm";
import { pgTable, serial, uuid, varchar } from "drizzle-orm/pg-core";

export const endpoints = pgTable("entrypoints", {
    id: serial("id").notNull().primaryKey(),
    key: varchar("key").unique(),
    uri: varchar("uri"),
    fkEntryId: uuid("fk_entry_id")
          .notNull()
          .references(() => users.id, { onDelete: "cascade" }),
    fkUserId: uuid("fk_user_id")
          .notNull()
          .references(() => users.id, { onDelete: "cascade" }),
});

export const endpointsRelations = relations(endpoints, ({ one }) => ({
  user: one(users, {
    fields: [endpoints.fkUserId],
    references: [users.id],
  }),
}));