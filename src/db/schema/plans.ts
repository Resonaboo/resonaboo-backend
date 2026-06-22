import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { subscriptions } from "./subscriptions.ts";

export const plans = pgTable("plans", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name", { length: 12 }),
  price: integer("price").notNull(),
  maxEntrypoint: integer("max_entrypoint").notNull(),
  maxEndpoint: integer("max_endpoint").notNull(),
});

export const sessionsRelations = relations(plans, ({ many }) => ({
  user: many(subscriptions),
}));
