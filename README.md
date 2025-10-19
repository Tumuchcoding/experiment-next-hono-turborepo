# Experiment Next.js + Hono + Turborepo

A modern full-stack web application built with Next.js, Hono, and Turborepo. This project demonstrates a monorepo setup with a React frontend and a lightweight Hono API backend, featuring user authentication, database integration, and modern development tooling.

## 📁 Project Structure

```
experiment-next-hono-turborepo/
├── apps/
│   ├── api/                 # Hono API server
│   │   ├── src/
│   │   │   ├── app.ts       # Main application entry
│   │   │   ├── middleware/  # Authentication & logging
│   │   │   ├── routes/      # API endpoints
│   │   │   └── utils/       # Database, sessions, utilities
│   │   └── drizzle.config.ts
│   └── web/                 # Next.js frontend
│       ├── app/             # App Router pages
│       ├── components/      # React components
│       ├── styles/          # CSS and Tailwind styles
│       └── utils/           # Client utilities
├── scripts/                 # Build and utility scripts
└── package.json            # Root workspace configuration
```

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Set up environment variables**

   Create `.env` files in both apps:

   **`apps/api/.env`**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   JWT_SECRET="da38a2f10f3a4d85941fd6665f7413d6086d2167281419b1254a2a034e53cd55"
   NODE_ENV="development"
   ```

   **`apps/web/.env.local`**
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3002"
   NEXT_PUBLIC_WEB_URL="http://localhost:3001"
   ```

3. **Set up the database**
   ```bash
   # Generate migrations
   cd apps/api
   bun run db:generate

   # Run migrations
   bun run db:migrate
   ```

5. **Start development servers**
   ```bash
   # From root directory
   bun run dev
   ```

   This starts:
   - API: http://localhost:3002
   - WEB: http://localhost:3001

## 📚 API Endpoints

### Authentication
- `POST /auth/signup/credential` - User registration
- `POST /auth/signin/credential` - User login
- `POST /auth/signout` - User logout
- `GET /auth/verify` - Verify authentication (protected)

### Main Routes
- `GET /` - Root endpoint
- `GET /test` - Test endpoint
- `GET /users` - Get all users

## 🛠️ Available Scripts

### Root Level
- `bun run dev` - Start all development servers
- `bun run build` - Build all applications
- `bun run check` - Run Biome linter
- `bun run check:fix` - Fix linting issues
- `bun run check:type` - Type check all packages
- `bun run clean` - Clean build artifacts

### API (`apps/api`)
- `bun run dev` - Start API development server
- `bun run build` - Build API for production
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio

### Web (`apps/web`)
- `bun run dev` - Start Next.js development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run check:type` - Type check Next.js app
