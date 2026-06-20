import { relations } from "drizzle-orm";
import { pgTable, serial, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const mediamtx = pgTable("mediamtx", {
    id: serial("id").primaryKey(),
    pathId: varchar("path_id", { length: 32 }).notNull().unique(),
    userId: uuid("user_id")
          .notNull()
          .references(() => users.id, { onDelete: "cascade" }),
});

export const mediamtxRelations = relations(mediamtx, ({ one }) => ({
  users: one(users, {
    fields: [mediamtx.userId],
    references: [users.id]
  }),
}));