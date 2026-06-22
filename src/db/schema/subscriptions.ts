import { relations } from "drizzle-orm";
import { pgTable, uuid, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.ts";
import { plans } from "./plans.ts";

export const subscriptions = pgTable("subscriptions", {
  fkUserId: uuid("fk_user_id")
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fkPlanId: serial("fk_plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  expireAt: timestamp("expire_at"),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.fkUserId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.fkPlanId],
    references: [plans.id],
  }),
}));
