import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export type Account = typeof ACCOUNT.$inferSelect
export type Profile = typeof PROFILE.$inferSelect
export type User = typeof USER.$inferSelect

export const USER = pgTable("user", {
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  email: text().unique().notNull(),
  emailVerified: boolean().notNull().default(false),
  id: serial().primaryKey(),
  name: text().notNull(),
  role: text({ enum: ["admin", "user"] })
    .notNull()
    .default("user"),
  updatedAt: timestamp({ mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const ACCOUNT = pgTable("account", {
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  id: serial().primaryKey(),
  password: text(),
  provider: text({ enum: ["credentials", "github", "google"] })
    .notNull()
    .default("credentials"),
  userId: serial()
    .notNull()
    .references(() => USER.id, { onDelete: "cascade" }),
})

export const PROFILE = pgTable("profile", {
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  id: serial().primaryKey(),
  image: text(),
  userId: serial()
    .notNull()
    .references(() => USER.id, { onDelete: "cascade" }),
})
