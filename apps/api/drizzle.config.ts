// ====================================================== /
// :: Notes ::
// bun run db:generate
// bun run db:migrate
// ====================================================== /

import { defineConfig } from "drizzle-kit"
//put up supabase url
if (!process.env.DATABASE_URL) {
  throw new Error("`DATABASE_URL` environment variable is required.")
}

export default defineConfig({
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL },
  dialect: "postgresql",
  out: "./src/utils/db/migrations",
  schema: "./src/utils/db/schema",
})
