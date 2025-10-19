import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export type Account = typeof ACCOUNT.$inferSelect
export type Profile = typeof PROFILE.$inferSelect
export type User = typeof USER.$inferSelect

export const USER = pgTable("user", {
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  email: text().unique().notNull(),
  emailVerified: boolean().default(false).notNull(),
  id: serial().primaryKey(),
  name: text().notNull(),
  role: text({ enum: ["admin", "user"] })
    .default("user")
    .notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
})

export const ACCOUNT = pgTable("account", {
  createdAt: timestamp({ mode: "string" }).notNull().defaultNow(),
  id: serial().primaryKey(),
  password: text(),
  provider: text({ enum: ["credentials", "github", "google"] })
    .default("credentials")
    .notNull(),
  userId: integer()
    .notNull()
    .references(() => USER.id, { onDelete: "cascade" }),
})

export const PROFILE = pgTable("profile", {
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  id: serial().primaryKey(),
  image: text(),
  userId: integer()
    .notNull()
    .references(() => USER.id, { onDelete: "cascade" }),
})
