import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { subscriptions } from "./subscriptions.ts";

export const plans = pgTable("plans", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name", { length: 12 }).notNull(),
  price: integer("price").notNull(),
  maxEntrypoint: integer("max_entrypoint").notNull(),
  maxEndpoint: integer("max_endpoint").notNull(),
  description: text("description")
});

export const sessionsRelations = relations(plans, ({ many }) => ({
  user: many(subscriptions),
}));
