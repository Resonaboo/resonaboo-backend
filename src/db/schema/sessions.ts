import { relations, sql } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const sessions = pgTable("sessions", {
  id: uuid("id").default(sql`uuidv7()`).primaryKey(),
  ip: varchar("ip", { length: 48 }),
  os: varchar("os", { length: 16 }),
  browser: varchar("browser", { length: 16 }),
  fkUserId: uuid("fk_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.fkUserId],
    references: [users.id],
  }),
}));
